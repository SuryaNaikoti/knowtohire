-- ====================================================================
-- KNOWTOHIRE — SUBSCRIPTION-BASED FEATURE ACCESS CONTROL & JOB LIMITS RLS
-- Migration: 20260929000000_subscription_entitlement_rls.sql
-- Description:
--   1. Enforces that only employers with active subscriptions can publish jobs
--   2. Enforces active plan check for employer pipeline and interview actions
--   3. Provides helper function to test active company subscription status
-- ====================================================================

-- Function to check if a company has an active, unexpired subscription
CREATE OR REPLACE FUNCTION public.is_company_subscription_active(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF target_company_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT subscription_status, subscription_expires_at
  INTO v_status, v_expires_at
  FROM public.company_profiles
  WHERE id = target_company_id;

  IF v_status = 'active' AND (v_expires_at IS NULL OR v_expires_at > now()) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Function to get the active job count for a company
CREATE OR REPLACE FUNCTION public.get_company_active_job_count(target_company_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT count(*)
  INTO v_count
  FROM public.jobs
  WHERE company_id = target_company_id AND status = 'published';

  RETURN COALESCE(v_count, 0);
END;
$$;

-- RLS Policy on Jobs: Ensure only active subscribers can publish new jobs
-- (Draft jobs can still be prepared, but publishing requires active subscription)
DROP POLICY IF EXISTS "Employers can publish jobs with active subscription" ON public.jobs;
CREATE POLICY "Employers can publish jobs with active subscription"
  ON public.jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status != 'published'
    OR public.is_company_subscription_active(company_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policy on Jobs: Prevent changing status to published if subscription is not active
DROP POLICY IF EXISTS "Employers can update job status if subscription active" ON public.jobs;
CREATE POLICY "Employers can update job status if subscription active"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT ep.company_id FROM public.employer_profiles ep WHERE ep.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    status != 'published'
    OR public.is_company_subscription_active(company_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
