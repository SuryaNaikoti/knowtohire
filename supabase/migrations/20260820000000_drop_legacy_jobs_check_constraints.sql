-- ====================================================================
-- MIGRATION: Drop conflicting legacy check constraints on jobs table
-- ====================================================================

-- Drop legacy table check constraints that conflict with PostgreSQL ENUMs
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_location_type_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_approval_status_check;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_career_domain_check;

-- Note: public.jobs.status is typed as job_status ENUM ('draft', 'published', 'paused', 'closed')
-- and public.jobs.employment_type is typed as employment_type ENUM.
-- The PostgreSQL enum types themselves strictly enforce domain validity;
-- redundant check constraints with mismatching values ('archived', 'Full-time') are omitted.

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

