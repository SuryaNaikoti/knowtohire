-- ============================================================
-- HOTFIX: Fix Infinite Recursion in company_team_members RLS
-- Run this in Supabase SQL Editor → New Query
-- Safe to run multiple times (idempotent)
-- ============================================================

-- Step 1: Drop the recursive policies that query the same table
DROP POLICY IF EXISTS "Team members can view team registry" ON public.company_team_members;
DROP POLICY IF EXISTS "Admins can manage team registry" ON public.company_team_members;

-- Step 2: Drop dependent company policies (also rely on company_team_members)
DROP POLICY IF EXISTS "Team members can view company details" ON public.companies;
DROP POLICY IF EXISTS "Company admins/recruiters can update details" ON public.companies;
DROP POLICY IF EXISTS "Team members can manage company locations" ON public.company_locations;

-- Step 3: Re-create safe company_team_members policies using auth.uid() directly
-- (avoids self-referential subquery which causes infinite recursion)

-- Allow each employer to see all rows for companies they are a member of
-- Use employer_profiles join instead of self-join on company_team_members
CREATE POLICY "Employer can view their own team row"
  ON public.company_team_members FOR SELECT
  USING (employer_id = auth.uid());

-- Allow admins (by role in employer_profiles) to manage the team
CREATE POLICY "Employer admin can manage team"
  ON public.company_team_members FOR ALL
  USING (employer_id = auth.uid());

-- Step 4: Re-create safe companies policies (join via employer_profiles, not company_team_members)
CREATE POLICY "Employer can view their company"
  ON public.companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM public.employer_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Employer can update their company"
  ON public.companies FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM public.employer_profiles
      WHERE id = auth.uid()
    )
  );

-- Step 5: Re-create safe company_locations policy
CREATE POLICY "Employer can manage their company locations"
  ON public.company_locations FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles
      WHERE id = auth.uid()
    )
  );

-- Verification query (should return list of policies without recursion errors)
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('company_team_members', 'companies', 'company_locations')
ORDER BY tablename, policyname;
