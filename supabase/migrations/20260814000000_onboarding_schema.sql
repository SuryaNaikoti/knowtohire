-- ====================================================================
-- KNOWTOHIRE — MODULE 01: ONBOARDING WIZARD SCHEMA & POLICY UPDATES
-- Migration: 20260814000000_onboarding_schema.sql
-- ====================================================================

-- 1. Add description to company_profiles if not already present
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Update profiles_update_own policy to allow transitioning status from 'pending_onboarding' to 'active'
-- while strictly preserving role immutability and preventing unauthorized role/status tampering.

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    (
      status = (SELECT status FROM public.profiles WHERE id = auth.uid()) OR
      ((SELECT status FROM public.profiles WHERE id = auth.uid()) = 'pending_onboarding' AND status = 'active')
    )
  );
