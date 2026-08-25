-- ====================================================================
-- KNOWTOHIRE — MIGRATION: CANDIDATE SETTINGS & PREFERENCES SCHEMA
-- Migration: 20260825130000_candidate_settings_and_preferences.sql
-- ====================================================================

-- 1. Add Candidate Settings fields to public.candidate_profiles
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS job_recommendation_alerts BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS application_stage_updates BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS is_discoverable BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

-- 2. Add Indexes for employer discovery performance & active filtering
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_is_discoverable ON public.candidate_profiles(is_discoverable);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_is_active ON public.candidate_profiles(is_active);

-- 3. Update RLS Policy for Employer Candidate Search
-- Employers can only select candidates who are discoverable AND active
DROP POLICY IF EXISTS "candidate_profiles_select_employers" ON public.candidate_profiles;
CREATE POLICY "candidate_profiles_select_employers"
  ON public.candidate_profiles
  FOR SELECT
  TO authenticated
  USING (
    is_discoverable = true
    AND is_active = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employer', 'admin')
      AND profiles.status = 'active'
    )
  );
