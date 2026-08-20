-- ====================================================================
-- MIGRATION: Fix jobs INSERT schema columns and defaults
-- ====================================================================

-- 1. Drop strict NOT NULL on legacy columns that have modern replacements
ALTER TABLE public.jobs ALTER COLUMN employer_id DROP NOT NULL;
ALTER TABLE public.jobs ALTER COLUMN slug DROP NOT NULL;

-- 2. Ensure defaults for created_by and employer_id
ALTER TABLE public.jobs ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.jobs ALTER COLUMN employer_id SET DEFAULT auth.uid();

-- 3. Create a before-insert trigger to ensure slug and employer_id are always populated
CREATE OR REPLACE FUNCTION public.handle_jobs_before_insert_or_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  -- Populate created_by and employer_id if null
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;

  IF NEW.employer_id IS NULL THEN
    NEW.employer_id := COALESCE(NEW.created_by, auth.uid());
  END IF;

  -- Ensure company_id is populated from get_auth_company_id() if null
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.get_auth_company_id();
  END IF;

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
