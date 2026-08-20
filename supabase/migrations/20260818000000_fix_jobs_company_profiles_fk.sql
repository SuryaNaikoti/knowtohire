-- ====================================================================
-- MIGRATION: Fix jobs -> company_profiles Foreign Key & Data Sync
-- ====================================================================

-- 1. Copy any existing companies into company_profiles to preserve legacy rows
INSERT INTO public.company_profiles (
  id, 
  name, 
  logo_url, 
  website_url, 
  industry, 
  company_size, 
  headquarters_location, 
  description, 
  verification_status, 
  created_at, 
  updated_at
)
SELECT 
  c.id, 
  c.name, 
  c.logo_url, 
  COALESCE(c.website_url, c.website), 
  c.industry, 
  c.size, 
  c.headquarters, 
  c.description, 
  'unverified', 
  COALESCE(c.created_at, NOW()), 
  COALESCE(c.updated_at, NOW())
FROM public.companies c
ON CONFLICT (id) DO NOTHING;

-- 2. Drop the old foreign key constraint pointing to companies
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_company_id_fkey;

-- 3. Add proper foreign key pointing to company_profiles
ALTER TABLE public.jobs 
  ADD CONSTRAINT jobs_company_id_fkey 
  FOREIGN KEY (company_id) 
  REFERENCES public.company_profiles(id) 
  ON DELETE CASCADE;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
