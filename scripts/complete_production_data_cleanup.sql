-- =========================================================================
-- KnowToHire Complete Production Data Cleanup: Execute Plan
-- Preserves: supportk2h@gmail.com, master admin profile, payments, audit trails
-- =========================================================================

BEGIN;

-- 1. Disable triggers that prevent cleanup
ALTER TABLE public.jobs DISABLE TRIGGER trigger_validate_job_publishing;

-- 2. Clean candidate profile records (candidate profile associated with admin account)
DELETE FROM public.candidate_profiles;

-- 3. Delete any orphaned / test employer profiles (currently 0)
DELETE FROM public.employer_profiles;

-- 4. Delete dependent relational job records (interviews, applications, saved_jobs, job_skills)
DELETE FROM public.interviews;
DELETE FROM public.application_status_history;
DELETE FROM public.job_applications;
DELETE FROM public.saved_jobs;
DELETE FROM public.saved_candidates;
DELETE FROM public.job_skills;

-- 5. Delete all existing job listings (10 total: published, closed, rejected, test, duplicate)
DELETE FROM public.jobs;

-- 6. Delete orphaned test company profiles
-- GreenEarth Consultants, SustainEdge, Patent Nexus, Niche Synthesis, Acme Enterprises, Suryan MSC
DELETE FROM public.company_profiles;

-- 7. Ensure Master Admin profile remains active and configured as admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'b3b30f73-46dc-43ec-8f5e-6784a8002452';

-- 8. Re-enable triggers
ALTER TABLE public.jobs ENABLE TRIGGER trigger_validate_job_publishing;

COMMIT;
