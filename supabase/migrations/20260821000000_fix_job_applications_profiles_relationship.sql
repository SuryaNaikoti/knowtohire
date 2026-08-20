-- ====================================================================
-- MIGRATION: Fix job_applications -> profiles foreign key relationship
-- ====================================================================

-- 1. Ensure any legacy job_applications have company_id populated from jobs table
UPDATE public.job_applications ja
SET company_id = j.company_id
FROM public.jobs j
WHERE ja.job_id = j.id
  AND ja.company_id IS NULL;

-- 2. Drop existing constraint if it exists
ALTER TABLE public.job_applications 
  DROP CONSTRAINT IF EXISTS job_applications_candidate_id_fkey;

-- 3. Add explicit foreign key constraint from job_applications.candidate_id to profiles.id
ALTER TABLE public.job_applications 
  ADD CONSTRAINT job_applications_candidate_id_fkey 
  FOREIGN KEY (candidate_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- 4. Ensure index exists for performance on candidate_id lookups
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id 
  ON public.job_applications(candidate_id);

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
