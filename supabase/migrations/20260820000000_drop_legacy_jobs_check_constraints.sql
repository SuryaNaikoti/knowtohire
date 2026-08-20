-- ====================================================================
-- MIGRATION: Drop conflicting legacy check constraints on jobs table
-- ====================================================================

ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_location_type_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_approval_status_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_career_domain_check;

-- Add updated check constraints that match modern KnowToHire enum values
ALTER TABLE public.jobs 
  ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('draft', 'published', 'paused', 'closed', 'archived'));

ALTER TABLE public.jobs 
  ADD CONSTRAINT jobs_employment_type_check 
  CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'hybrid', 'internship', 'Full-time', 'Part-time', 'Contract', 'Internship'));

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
