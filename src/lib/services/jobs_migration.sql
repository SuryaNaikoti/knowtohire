-- SPRINT 4: JOB PORTAL MODULE SCHEMA MIGRATION

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. JOB CATEGORIES TABLE (Hierarchical)
CREATE TABLE IF NOT EXISTS public.job_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed Initial Categories (Parent & Child Categories)
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

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    benefits TEXT,
    career_domain VARCHAR(50) DEFAULT 'General' CHECK (career_domain IN ('General', 'Environmental', 'ESG', 'Patent', 'IPR', 'Research', 'Consulting')),
    location_type VARCHAR(50) DEFAULT 'Onsite' CHECK (location_type IN ('Onsite', 'Remote', 'Hybrid')),
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    salary_visible BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMP WITH TIME ZONE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    moderator_notes TEXT,
    view_count INT DEFAULT 0 NOT NULL,
    application_deadline DATE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing for fast search and filtering
CREATE INDEX IF NOT EXISTS idx_jobs_search ON public.jobs(status, approval_status);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company_id);

-- 3. JOB SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.job_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    required_level VARCHAR(50) DEFAULT 'Intermediate' CHECK (required_level IN ('Beginner', 'Intermediate', 'Expert')),
    years_experience_required INT DEFAULT 1
);

-- 4. SAVED JOBS JOIN TABLE
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(candidate_id, job_id)
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (Clerk auth.uid() Compatible)

-- Job Categories Access (Public Read)
CREATE POLICY "Anyone can view job categories" ON public.job_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage job categories" ON public.job_categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'Admin'
    )
);

-- Jobs Access Policies
CREATE POLICY "Anyone can view approved and published jobs" ON public.jobs FOR SELECT 
    USING (status = 'published' AND approval_status = 'approved');

CREATE POLICY "Employers can manage their own company jobs" ON public.jobs FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.company_team_members 
            WHERE company_id = jobs.company_id AND employer_id = auth.uid() AND member_role IN ('Admin', 'Recruiter')
        )
    );

CREATE POLICY "Admins can select/update all jobs for moderation" ON public.jobs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'Admin'
        )
    );

-- Job Skills Policies
CREATE POLICY "Anyone can view job skills" ON public.job_skills FOR SELECT USING (true);
CREATE POLICY "Employers can manage skills for their jobs" ON public.job_skills FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs j
            JOIN public.company_team_members ctm ON j.company_id = ctm.company_id
            WHERE j.id = job_skills.job_id AND ctm.employer_id = auth.uid() AND ctm.member_role IN ('Admin', 'Recruiter')
        )
    );

-- Saved Jobs Policies (candidate_id references auth.uid() directly)
CREATE POLICY "Candidates can manage their own saved jobs list" ON public.saved_jobs FOR ALL
    USING (candidate_id = auth.uid());
