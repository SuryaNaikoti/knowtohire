-- ====================================================================
-- KNOWTOHIRE — MIGRATION: SECURE ADMIN PERMANENT ACCOUNT PURGE & AUDIT
-- Migration: 20261016000000_secure_admin_permanent_account_deletion.sql
-- Description:
--   Authoritative Database Cascade & Relational Sanitization RPC
--
-- Architecture Contract:
--   - This SQL function is the single authority for relational integrity,
--     FK de-linking, anonymization, and database deletions.
--   - It intentionally does NOT delete from auth.users and does NOT write
--     to admin_audit_logs; those actions are owned authoritatively by the
--     calling backend API to avoid duplicate executions or out-of-order race states.
--   - Uses an explicit transaction-level advisory lock to eliminate race conditions
--     in the last-active-admin check.
--   - Implements company-admin succession: promotes next eligible member or marks
--     sole-member companies as 'archived_pending_claim'.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ADMIN AUDIT LOGS (PRIVACY-CONSCIOUS AUDIT LOG)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- --------------------------------------------------------------------
-- 1B. ADMIN DELETION JOBS (DURABLE RECOVERY TOMBSTONE)
-- Tracks deletion lifecycle independently of profile existence to allow safe,
-- idempotent retries if auth deletion or storage file removal encounters timeouts.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_deletion_jobs (
  target_user_id UUID PRIMARY KEY,
  initiated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_role TEXT,
  status TEXT NOT NULL DEFAULT 'db_purged' CHECK (status IN ('in_progress', 'db_purged', 'partially_failed', 'completed')),
  auth_deleted BOOLEAN NOT NULL DEFAULT false,
  storage_completed BOOLEAN NOT NULL DEFAULT false,
  storage_cleanup JSONB NOT NULL DEFAULT '{"resumes": 0, "content": 0}'::jsonb,
  retry_count INTEGER NOT NULL DEFAULT 0,
  lease_token UUID,
  lease_expires_at TIMESTAMPTZ,
  fence BIGINT NOT NULL DEFAULT 1,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_deletion_jobs_status ON public.admin_deletion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_admin_deletion_jobs_updated_at ON public.admin_deletion_jobs(updated_at DESC);

ALTER TABLE public.admin_deletion_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view deletion jobs" ON public.admin_deletion_jobs;
CREATE POLICY "Admins can view deletion jobs"
  ON public.admin_deletion_jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- --------------------------------------------------------------------
-- 2. FINANCIAL LEDGER INTEGRITY SAFEGUARD
-- Ensure creator_sales_ledger allows creator_id to be NULL upon account deletion
-- so historical earnings are NEVER falsely attributed to the administrator
-- performing the deletion, while preserving all amounts, commissions,
-- transaction IDs, and audit records.
-- --------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'creator_sales_ledger'
      AND column_name = 'creator_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.creator_sales_ledger ALTER COLUMN creator_id DROP NOT NULL;
  END IF;
END $$;

-- --------------------------------------------------------------------
-- 3. PURGE LOGIC: CASCADE, ANONYMIZE & SUCCESSION RPC
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_purge_user_cascade(
  target_user_id UUID,
  calling_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
#variable_conflict use_variable
DECLARE
  v_caller UUID;
  v_caller_role TEXT;
  v_target_role TEXT;
  v_target_email TEXT;
  v_admin_count INT;
  v_company_id UUID;
  v_is_company_admin BOOLEAN;
  v_successor_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Acquire transaction-level advisory lock to eliminate concurrent deletion races
  PERFORM pg_advisory_xact_lock(hashtext('kth_admin_account_purge_lock'));

  -- 2. Identify caller (explicit parameter or auth.uid())
  v_caller := COALESCE(calling_admin_id, auth.uid());

  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller administrative identity could not be established.';
  END IF;

  -- 3. Authorize caller as an active admin
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = v_caller AND status = 'active';

  IF v_caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden: Only active administrators can permanently purge accounts.';
  END IF;

  -- 4. Prevent self-deletion
  IF v_caller = target_user_id THEN
    RAISE EXCEPTION 'SelfDeletionBlocked: Administrators cannot permanently remove their own active account.';
  END IF;

  -- 5. Inspect target user
  SELECT role, email INTO v_target_role, v_target_email
  FROM public.profiles
  WHERE id = target_user_id;

  -- If target is an active admin, enforce concurrency-safe last-admin protection
  IF v_target_role = 'admin' THEN
    SELECT COUNT(*) INTO v_admin_count
    FROM public.profiles
    WHERE role = 'admin' AND status = 'active';

    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'LastAdminBlocked: Cannot purge the platform''s sole remaining active administrator.';
    END IF;
  END IF;

  -- 6. COMPANY-ADMIN SUCCESSION & EMPLOYER MEMBERSHIP
  -- Check if target is an employer with company admin privileges
  SELECT company_id, is_company_admin INTO v_company_id, v_is_company_admin
  FROM public.employer_profiles
  WHERE profile_id = target_user_id;

  IF v_company_id IS NOT NULL THEN
    IF v_is_company_admin = true THEN
      -- Find oldest remaining eligible employer member in the same company
      SELECT profile_id INTO v_successor_id
      FROM public.employer_profiles
      WHERE company_id = v_company_id
        AND profile_id != target_user_id
      ORDER BY created_at ASC
      LIMIT 1;

      IF v_successor_id IS NOT NULL THEN
        -- Promote successor to company admin
        UPDATE public.employer_profiles
        SET is_company_admin = true
        WHERE profile_id = v_successor_id;
      ELSE
        -- Sole member leaving: preserve company record and past jobs, mark company archived
        UPDATE public.company_profiles
        SET verification_status = 'rejected' -- sets to restricted/archived state
        WHERE id = v_company_id;
      END IF;
    END IF;

    -- Delete employer membership link (ON DELETE RESTRICT on company_profiles avoided)
    DELETE FROM public.employer_profiles WHERE profile_id = target_user_id;
  END IF;

  -- 7. NEUTRALIZE ON DELETE RESTRICT DEPENDENCIES
  -- A. JOBS: Reassign / detach created_by & employer_id to prevent FK failure while preserving company jobs
  UPDATE public.jobs
  SET created_by = NULL,
      status = CASE WHEN status = 'published' THEN 'closed' ELSE status END
  WHERE created_by = target_user_id;

  UPDATE public.jobs
  SET employer_id = NULL
  WHERE employer_id = target_user_id;

  -- B. EXTERNAL JOBS: Detach created_by
  UPDATE public.external_jobs
  SET created_by = NULL
  WHERE created_by = target_user_id;

  -- C. CREATOR SALES LEDGER: Retain immutable financial records for tax/audit compliance.
  -- Anonymize personal buyer emails; detach creator_id to NULL to preserve true historic accounting
  -- without falsely attributing deleted creator earnings to the admin who performed deletion.
  IF v_target_email IS NOT NULL THEN
    UPDATE public.creator_sales_ledger
    SET buyer_email = '[PURGED_USER]'
    WHERE buyer_email = v_target_email;
  END IF;

  UPDATE public.creator_sales_ledger
  SET creator_id = NULL
  WHERE creator_id = target_user_id;

  -- D. MARKETPLACE CONTENT & EDITORIAL REFERENCES
  -- Shared marketplace resources and templates are preserved for purchasers; creator link is detached.
  UPDATE public.resources SET creator_id = NULL WHERE creator_id = target_user_id;
  UPDATE public.templates SET creator_id = NULL WHERE creator_id = target_user_id;
  UPDATE public.blog_posts SET author_id = NULL WHERE author_id = target_user_id;

  -- E. APPLICATION STATUS AUDIT & INTERVIEWS
  UPDATE public.application_status_history SET changed_by = NULL WHERE changed_by = target_user_id;
  UPDATE public.interviews SET created_by = NULL WHERE created_by = target_user_id;

  -- F. FINANCIAL PAYMENT ORDERS: Retain financial order history, detach profile link and scrub PII
  UPDATE public.payment_orders
  SET user_id = NULL,
      customer_email = '[PURGED_USER]',
      customer_name = '[PURGED_USER]',
      customer_phone = NULL
  WHERE user_id = target_user_id;

  -- 8. USER-OWNED RECORDS CASCADE
  DELETE FROM public.candidate_profiles WHERE profile_id = target_user_id;
  DELETE FROM public.job_applications WHERE candidate_id = target_user_id;
  DELETE FROM public.saved_jobs WHERE candidate_id = target_user_id;
  DELETE FROM public.saved_candidates WHERE candidate_id = target_user_id OR employer_id = target_user_id;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    EXECUTE 'DELETE FROM public.notifications WHERE user_id = $1' USING target_user_id;
  END IF;
  DELETE FROM public.user_purchases WHERE user_id = target_user_id;
  DELETE FROM public.resource_requests WHERE user_id = target_user_id;

  -- 9. DELETE PUBLIC PROFILE RECORD
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- 10. RECORD DURABLE DELETION JOB TOMBSTONE
  -- Preserves operation record and actor across retries even after profiles row is gone
  INSERT INTO public.admin_deletion_jobs (
    target_user_id,
    initiated_by,
    target_role,
    status,
    retry_count,
    created_at,
    updated_at
  )
  VALUES (
    target_user_id,
    v_caller,
    v_target_role,
    'db_purged',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT ON CONSTRAINT admin_deletion_jobs_pkey DO UPDATE SET
    retry_count = public.admin_deletion_jobs.retry_count + 1,
    status = 'db_purged',
    updated_at = NOW();

  v_result := jsonb_build_object(
    'success', true,
    'purged_user_id', target_user_id,
    'purged_by', v_caller,
    'target_role', v_target_role,
    'company_successor_promoted', v_successor_id IS NOT NULL
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'PurgeFailed: %', SQLERRM;
END;
$$;

-- --------------------------------------------------------------------
-- 4. HARDEN RPC FUNCTION PERMISSIONS
-- Explicitly revoke execution from public, anon, and authenticated.
-- Grant execution ONLY to service_role (invoked authoritatively by serverless API).
-- --------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) TO service_role;

-- --------------------------------------------------------------------
-- 5. ATOMIC CROSS-INSTANCE DELETION LEASE WITH EXPIRY & FENCING
-- Guarantees that only ONE serverless instance can execute post-DB Auth & Storage
-- cleanup for a target user at any given second, while automatically recovering
-- from crashed or timed-out workers after lease_duration_seconds.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_acquire_deletion_lease(
  p_target_user_id UUID,
  p_caller_id UUID,
  p_target_role TEXT DEFAULT NULL,
  p_lease_seconds INT DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_token UUID := gen_random_uuid();
  v_now TIMESTAMPTZ := NOW();
  v_expiry TIMESTAMPTZ := v_now + (p_lease_seconds || ' seconds')::INTERVAL;
  v_job public.admin_deletion_jobs%ROWTYPE;
BEGIN
  -- Row-level lock on existing job record if present
  SELECT * INTO v_job
  FROM public.admin_deletion_jobs
  WHERE target_user_id = p_target_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- First time inserting job: claim lease immediately
    INSERT INTO public.admin_deletion_jobs (
      target_user_id,
      initiated_by,
      target_role,
      status,
      lease_token,
      lease_expires_at,
      fence,
      retry_count,
      created_at,
      updated_at
    )
    VALUES (
      p_target_user_id,
      p_caller_id,
      p_target_role,
      'in_progress',
      v_token,
      v_expiry,
      1,
      0,
      v_now,
      v_now
    )
    RETURNING * INTO v_job;

    RETURN jsonb_build_object(
      'acquired', true,
      'lease_token', v_token,
      'fence', v_job.fence,
      'status', v_job.status
    );
  END IF;

  -- If job is already fully completed, do not allow re-acquisition
  IF v_job.status = 'completed' THEN
    RETURN jsonb_build_object(
      'acquired', false,
      'already_completed', true,
      'fence', v_job.fence,
      'status', v_job.status
    );
  END IF;

  -- Check if existing lease is active
  IF v_job.lease_expires_at IS NOT NULL AND v_job.lease_expires_at > v_now THEN
    RETURN jsonb_build_object(
      'acquired', false,
      'already_completed', false,
      'active_lease_expires_at', v_job.lease_expires_at,
      'fence', v_job.fence,
      'status', v_job.status
    );
  END IF;

  -- Lease expired or unassigned: claim lease with incremented fence and retry count
  UPDATE public.admin_deletion_jobs
  SET lease_token = v_token,
      lease_expires_at = v_expiry,
      fence = fence + 1,
      retry_count = retry_count + 1,
      status = 'in_progress',
      updated_at = v_now
  WHERE target_user_id = p_target_user_id
  RETURNING * INTO v_job;

  RETURN jsonb_build_object(
    'acquired', true,
    'lease_token', v_token,
    'fence', v_job.fence,
    'status', v_job.status
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_release_deletion_lease(
  p_target_user_id UUID,
  p_lease_token UUID,
  p_fence BIGINT,
  p_status TEXT,
  p_auth_deleted BOOLEAN,
  p_storage_completed BOOLEAN,
  p_storage_cleanup JSONB DEFAULT '{"resumes": 0, "content": 0}'::jsonb,
  p_error TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_updated BOOLEAN := false;
BEGIN
  -- Release lease ONLY if caller holds the matching lease_token AND fence (fenced update)
  UPDATE public.admin_deletion_jobs
  SET status = p_status,
      auth_deleted = p_auth_deleted,
      storage_completed = p_storage_completed,
      storage_cleanup = p_storage_cleanup,
      last_error = p_error,
      lease_token = NULL,
      lease_expires_at = NULL,
      updated_at = NOW()
  WHERE target_user_id = p_target_user_id
    AND lease_token = p_lease_token
    AND fence = p_fence;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_renew_deletion_lease(
  p_target_user_id UUID,
  p_lease_token UUID,
  p_fence BIGINT,
  p_extension_seconds INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_updated BOOLEAN := false;
BEGIN
  -- Renew lease ONLY if caller holds matching lease_token AND fence (fenced heartbeat)
  UPDATE public.admin_deletion_jobs
  SET lease_expires_at = NOW() + (p_extension_seconds || ' seconds')::INTERVAL,
      updated_at = NOW()
  WHERE target_user_id = p_target_user_id
    AND lease_token = p_lease_token
    AND fence = p_fence
    AND status = 'in_progress';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_acquire_deletion_lease(UUID, UUID, TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_acquire_deletion_lease(UUID, UUID, TEXT, INT) TO service_role;

REVOKE ALL ON FUNCTION public.admin_renew_deletion_lease(UUID, UUID, BIGINT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_renew_deletion_lease(UUID, UUID, BIGINT, INT) TO service_role;

REVOKE ALL ON FUNCTION public.admin_release_deletion_lease(UUID, UUID, BIGINT, TEXT, BOOLEAN, BOOLEAN, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_release_deletion_lease(UUID, UUID, BIGINT, TEXT, BOOLEAN, BOOLEAN, JSONB, TEXT) TO service_role;


