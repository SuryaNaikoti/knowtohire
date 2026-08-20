-- ====================================================================
-- KNOWTOHIRE — FIX EMPLOYER PROFILES RLS RECURSION
-- Migration: 20260817000000_fix_employer_rls_recursion.sql
-- ====================================================================

-- 1. Create SECURITY DEFINER helper function to retrieve company_id for the current user
-- This runs with security definer privileges, bypassing RLS and avoiding infinite recursion.
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- 2. Clean up and recreate policies on employer_profiles
DROP POLICY IF EXISTS "employer_profiles_select_own" ON public.employer_profiles;
DROP POLICY IF EXISTS "employer_profiles_select_company_colleagues" ON public.employer_profiles;
DROP POLICY IF EXISTS "employer_profiles_insert_own" ON public.employer_profiles;
DROP POLICY IF EXISTS "employer_profiles_update_own" ON public.employer_profiles;
DROP POLICY IF EXISTS "employer_profiles_all_own" ON public.employer_profiles;

CREATE POLICY "employer_profiles_select_own"
  ON public.employer_profiles
  FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid() OR 
    company_id = public.get_auth_company_id()
  );

CREATE POLICY "employer_profiles_insert_own"
  ON public.employer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
  );

CREATE POLICY "employer_profiles_update_own"
  ON public.employer_profiles
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- 3. Clean up and recreate policies on company_profiles
DROP POLICY IF EXISTS "company_profiles_select_public" ON public.company_profiles;
DROP POLICY IF EXISTS "company_profiles_insert_employer" ON public.company_profiles;
DROP POLICY IF EXISTS "company_profiles_update_employer" ON public.company_profiles;

CREATE POLICY "company_profiles_select_public"
  ON public.company_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "company_profiles_insert_employer"
  ON public.company_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "company_profiles_update_employer"
  ON public.company_profiles
  FOR UPDATE
  TO authenticated
  USING (id = public.get_auth_company_id())
  WITH CHECK (id = public.get_auth_company_id());

-- 4. Update jobs policies to use helper function
DROP POLICY IF EXISTS "jobs_select_employer_company" ON public.jobs;
DROP POLICY IF EXISTS "jobs_insert_employer" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_employer" ON public.jobs;
DROP POLICY IF EXISTS "jobs_delete_employer" ON public.jobs;

CREATE POLICY "jobs_select_employer_company"
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "jobs_insert_employer"
  ON public.jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    company_id = public.get_auth_company_id()
  );

CREATE POLICY "jobs_update_employer"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "jobs_delete_employer"
  ON public.jobs
  FOR DELETE
  TO authenticated
  USING (company_id = public.get_auth_company_id());

-- 5. Update job_applications employer policies
DROP POLICY IF EXISTS "job_applications_select_employer_company" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_update_employer_company" ON public.job_applications;

CREATE POLICY "job_applications_select_employer_company"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "job_applications_update_employer_company"
  ON public.job_applications
  FOR UPDATE
  TO authenticated
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

-- 6. Update application_status_history employer policy
DROP POLICY IF EXISTS "app_history_select_employer_company" ON public.application_status_history;

CREATE POLICY "app_history_select_employer_company"
  ON public.application_status_history
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM public.job_applications WHERE company_id = public.get_auth_company_id()
    )
  );

-- 7. Update interviews employer policies
DROP POLICY IF EXISTS "interviews_select_employer_company" ON public.interviews;
DROP POLICY IF EXISTS "interviews_insert_employer" ON public.interviews;
DROP POLICY IF EXISTS "interviews_update_employer" ON public.interviews;
DROP POLICY IF EXISTS "interviews_delete_employer" ON public.interviews;

CREATE POLICY "interviews_select_employer_company"
  ON public.interviews
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "interviews_insert_employer"
  ON public.interviews
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "interviews_update_employer"
  ON public.interviews
  FOR UPDATE
  TO authenticated
  USING (company_id = public.get_auth_company_id())
  WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "interviews_delete_employer"
  ON public.interviews
  FOR DELETE
  TO authenticated
  USING (company_id = public.get_auth_company_id());

-- 8. Update saved_candidates employer policies
DROP POLICY IF EXISTS "saved_candidates_select_employer_company" ON public.saved_candidates;
DROP POLICY IF EXISTS "saved_candidates_insert_employer" ON public.saved_candidates;
DROP POLICY IF EXISTS "saved_candidates_delete_employer" ON public.saved_candidates;

CREATE POLICY "saved_candidates_select_employer_company"
  ON public.saved_candidates
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "saved_candidates_insert_employer"
  ON public.saved_candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id = auth.uid() AND
    company_id = public.get_auth_company_id()
  );

CREATE POLICY "saved_candidates_delete_employer"
  ON public.saved_candidates
  FOR DELETE
  TO authenticated
  USING (company_id = public.get_auth_company_id());
