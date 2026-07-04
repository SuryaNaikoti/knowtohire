-- SUPABASE MIGRATION: v1.2 SCHEMA RECONCILIATION
-- Generated: 2026-07-04
-- Type: Additive & Backward-Compatible Reconciliation

-- ==========================================
-- 1. EXTENSIONS & ENUMS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. CREATE NEW TABLES (IF NOT EXISTS)
-- ==========================================

-- Job Categories Table
CREATE TABLE IF NOT EXISTS public.job_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Company Locations Table
CREATE TABLE IF NOT EXISTS public.company_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    is_headquarters BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Company Team Members Table
CREATE TABLE IF NOT EXISTS public.company_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL UNIQUE REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
    member_role VARCHAR(20) DEFAULT 'Recruiter' CHECK (member_role IN ('Admin', 'Recruiter', 'Viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 3. ADDITIVE COLUMNS (CANDIDATE MODULE)
-- ==========================================

-- candidate_profiles
ALTER TABLE public.candidate_profiles 
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS desired_salary NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'employers-only'));

-- candidate_skills
ALTER TABLE public.candidate_skills 
  ADD COLUMN IF NOT EXISTS competency_level VARCHAR(20) CHECK (competency_level IN ('Beginner', 'Intermediate', 'Expert')),
  ADD COLUMN IF NOT EXISTS years_of_experience INT CHECK (years_of_experience >= 0);

-- Migrate/copy data for candidate_skills (proficiency_level -> competency_level)
UPDATE public.candidate_skills
SET competency_level = CASE 
  WHEN LOWER(proficiency_level) = 'beginner' THEN 'Beginner'::VARCHAR
  WHEN LOWER(proficiency_level) = 'intermediate' THEN 'Intermediate'::VARCHAR
  WHEN LOWER(proficiency_level) = 'advanced' THEN 'Expert'::VARCHAR
  ELSE 'Intermediate'::VARCHAR
END
WHERE competency_level IS NULL AND proficiency_level IS NOT NULL;

-- ==========================================
-- 4. ADDITIVE COLUMNS (EMPLOYER MODULE)
-- ==========================================

-- companies
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS company_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Safely copy data from website to website_url if exists
UPDATE public.companies 
SET website_url = website 
WHERE website_url IS NULL AND website IS NOT NULL;

-- employer_profiles
ALTER TABLE public.employer_profiles 
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);

-- ==========================================
-- 5. ADDITIVE COLUMNS (JOBS PORTAL MODULE)
-- ==========================================

-- jobs
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS career_domain VARCHAR(50) DEFAULT 'General' CHECK (career_domain IN ('General', 'Environmental', 'ESG', 'Patent', 'IPR', 'Research', 'Consulting')),
  ADD COLUMN IF NOT EXISTS salary_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS moderator_notes TEXT,
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS application_deadline DATE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS country VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) DEFAULT 'Onsite' CHECK (location_type IN ('Onsite', 'Remote', 'Hybrid')),
  ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship'));

-- Copy/map data from jobs status/location indicators
UPDATE public.jobs 
SET 
  status = CASE WHEN is_active = TRUE THEN 'published'::VARCHAR ELSE 'draft'::VARCHAR END,
  approval_status = 'approved'::VARCHAR,
  city = COALESCE(location, 'Remote'::VARCHAR),
  country = 'India'::VARCHAR,
  location_type = INITCAP(work_mode::TEXT)::VARCHAR,
  employment_type = INITCAP(job_type::TEXT)::VARCHAR
WHERE status = 'draft' AND is_active IS NOT NULL;

-- Safely convert requirements/benefits to text columns (Already TEXT on live schema, commented out)
-- ALTER TABLE public.jobs ALTER COLUMN requirements TYPE TEXT USING array_to_string(requirements, E'\n');
-- ALTER TABLE public.jobs ALTER COLUMN benefits TYPE TEXT USING array_to_string(benefits, E'\n');

-- job_skills
ALTER TABLE public.job_skills 
  ADD COLUMN IF NOT EXISTS required_level VARCHAR(50) DEFAULT 'Intermediate' CHECK (required_level IN ('Beginner', 'Intermediate', 'Expert')),
  ADD COLUMN IF NOT EXISTS years_experience_required INT DEFAULT 1;

-- Map job_skills is_required to required_level
UPDATE public.job_skills
SET required_level = CASE WHEN is_required = TRUE THEN 'Expert'::VARCHAR ELSE 'Intermediate'::VARCHAR END
WHERE required_level = 'Intermediate' AND is_required IS NOT NULL;

-- saved_jobs
ALTER TABLE public.saved_jobs 
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS) & GRANTS
-- ==========================================
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;

-- 6b. Create RLS Policies
CREATE POLICY "Anyone can view job categories" ON public.job_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage job categories" ON public.job_categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'Admin'
    )
);

CREATE POLICY "Team members can view team registry" ON public.company_team_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = company_team_members.company_id AND employer_id = auth.uid()
    ));

CREATE POLICY "Admins can manage team registry" ON public.company_team_members FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = company_team_members.company_id AND employer_id = auth.uid() AND member_role = 'Admin'
    ));

CREATE POLICY "Team members can view company details" ON public.companies FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = companies.id AND employer_id = auth.uid()
    ));

CREATE POLICY "Company admins/recruiters can update details" ON public.companies FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = companies.id AND employer_id = auth.uid() AND member_role IN ('Admin', 'Recruiter')
    ));

CREATE POLICY "Team members can manage company locations" ON public.company_locations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = company_locations.company_id AND employer_id = auth.uid() AND member_role IN ('Admin', 'Recruiter')
    ));

-- 6c. Grant access to API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ==========================================
-- 7. SEED DATA (JOB CATEGORIES)
-- ==========================================
INSERT INTO public.job_categories (id, name, slug, description, parent_category_id) VALUES
('1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', 'Technology & Engineering', 'technology-engineering', 'Software, data, systems, and product engineering.', NULL),
('2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 'Legal & Intellectual Property', 'legal-ip', 'Patent, copyright, licensing, and legal consulting.', NULL),
('3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c', 'Sustainability & Environmental', 'sustainability-environmental', 'ESG, climate tech, ecology, and sustainability initiatives.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.job_categories (name, slug, description, parent_category_id) VALUES
('Software Development', 'software-development', 'Frontend, backend, and fullstack positions.', '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a'),
('Patent Engineering', 'patent-engineering', 'Intellectual property and patent writing roles.', '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b'),
('ESG Strategy', 'esg-strategy', 'Corporate social responsibility and ESG reporting.', '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c')
ON CONFLICT (name) DO NOTHING;
