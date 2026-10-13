-- ====================================================================
-- MIGRATION: Fix jobs INSERT schema columns and defaults
-- ====================================================================

-- 1. Ensure required columns exist on public.jobs (supporting both fresh and legacy schemas)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Drop strict NOT NULL on legacy columns if they exist with NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'employer_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.jobs ALTER COLUMN employer_id DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'slug' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.jobs ALTER COLUMN slug DROP NOT NULL;
  END IF;
END $$;

-- 3. Ensure defaults for created_by and employer_id
ALTER TABLE public.jobs ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.jobs ALTER COLUMN employer_id SET DEFAULT auth.uid();

-- 4. Create a before-insert trigger to ensure slug, created_by, and company_id are always populated
CREATE OR REPLACE FUNCTION public.handle_jobs_before_insert_or_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  -- Populate created_by if null
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;

  -- Ensure company_id is populated from get_auth_company_id() if null
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.get_auth_company_id();
  END IF;

  -- Ensure employer_id mirrors created_by if present
  NEW.employer_id := COALESCE(NEW.employer_id, NEW.created_by, auth.uid());

  -- Generate slug if missing
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(COALESCE(NEW.title, 'job'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(gen_random_uuid()::text from 1 for 8);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_jobs_defaults ON public.jobs;
CREATE TRIGGER trigger_jobs_defaults
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_jobs_before_insert_or_update();

-- 4. Update Demo Employer's company verification status to verified
UPDATE public.company_profiles
SET verification_status = 'verified'
WHERE id = 'e977582f-4c34-4d4b-9b7c-90b4b999c7e6';

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
