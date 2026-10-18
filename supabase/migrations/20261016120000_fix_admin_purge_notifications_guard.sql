-- Migration: Update admin_purge_user_cascade with safe notifications table existence check
CREATE OR REPLACE FUNCTION public.admin_purge_user_cascade(
  target_user_id UUID,
  calling_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
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
-- HARDEN RPC FUNCTION PERMISSIONS
-- Explicitly revoke execution from public, anon, and authenticated.
-- Grant execution ONLY to service_role (invoked authoritatively by serverless API).
-- --------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) TO service_role;




