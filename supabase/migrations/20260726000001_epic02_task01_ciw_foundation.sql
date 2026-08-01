-- ====================================================================
-- EPIC-02 TASK-01: CANDIDATE CAREER INTELLIGENCE WORKSPACE (CIW) SCHEMA
-- ====================================================================

-- 1. Core Profile Identity & Multi-Tenancy
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    headline VARCHAR(255),
    bio TEXT,
    phone VARCHAR(50),
    location VARCHAR(150),
    work_authorization VARCHAR(100),
    avatar_url TEXT,
    source VARCHAR(50) DEFAULT 'manual',
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    platform_name VARCHAR(50) NOT NULL,
    profile_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    language_name VARCHAR(50) NOT NULL,
    proficiency_level VARCHAR(50) NOT NULL
);

-- 2. Professional Experience & Progression
CREATE TABLE IF NOT EXISTS public.candidate_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Education & Accreditations
CREATE TABLE IF NOT EXISTS public.candidate_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(200) NOT NULL,
    degree VARCHAR(150) NOT NULL,
    field_of_study VARCHAR(150),
    start_year INTEGER,
    end_year INTEGER,
    grade_gpa VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(150) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    credential_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Hierarchical Skills Taxonomy
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.skill_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
    subcategory_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id UUID NOT NULL REFERENCES public.skill_subcategories(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) NOT NULL,
    years_experience NUMERIC(4,1) DEFAULT 0.0,
    confidence_score INTEGER DEFAULT 80,
    evidence_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, skill_id)
);

-- 5. Portfolio Showcase & Project Media
CREATE TABLE IF NOT EXISTS public.candidate_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    website_url TEXT,
    github_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    role VARCHAR(150),
    description TEXT,
    start_date DATE,
    end_date DATE,
    project_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.candidate_projects(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL,
    media_url TEXT NOT NULL,
    caption VARCHAR(255)
);

-- 6. Resume Intelligence Center
CREATE TABLE IF NOT EXISTS public.candidate_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    file_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
    version_name VARCHAR(100) NOT NULL,
    raw_text TEXT,
    parsed_json JSONB DEFAULT '{}'::jsonb,
    format_type VARCHAR(50) DEFAULT 'ats',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_resume_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
    ats_score INTEGER DEFAULT 0,
    keyword_density_json JSONB DEFAULT '{}'::jsonb,
    missing_keywords JSONB DEFAULT '[]'::jsonb,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Privacy, Preferences, Activity & Explainable AI Audit
CREATE TABLE IF NOT EXISTS public.candidate_preferences (
    candidate_id UUID PRIMARY KEY REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    desired_role VARCHAR(150),
    target_salary_min INTEGER,
    target_salary_max INTEGER,
    remote_preference VARCHAR(50) DEFAULT 'hybrid',
    relocation_willing BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_privacy (
    candidate_id UUID PRIMARY KEY REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    show_contact_info BOOLEAN DEFAULT FALSE,
    show_resume BOOLEAN DEFAULT TRUE,
    show_portfolio BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.candidate_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL,
    prompt_used TEXT,
    model_name VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    model_version VARCHAR(50) DEFAULT 'v1.0',
    confidence_score NUMERIC(5,2),
    ai_suggestions_json JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_USER_APPROVAL',
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_completion (
    candidate_id UUID PRIMARY KEY REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    overall_readiness_score INTEGER DEFAULT 0,
    identity_score INTEGER DEFAULT 0,
    experience_score INTEGER DEFAULT 0,
    education_score INTEGER DEFAULT 0,
    skills_score INTEGER DEFAULT 0,
    portfolio_score INTEGER DEFAULT 0,
    resume_score INTEGER DEFAULT 0,
    ats_score INTEGER DEFAULT 0,
    interview_score INTEGER DEFAULT 0,
    market_score INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_activity ENABLE ROW LEVEL SECURITY;

-- Owner Full Control Policy
CREATE POLICY candidate_profiles_owner_all ON public.candidate_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY candidate_experience_owner_all ON public.candidate_experience
    FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY candidate_education_owner_all ON public.candidate_education
    FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY candidate_certifications_owner_all ON public.candidate_certifications
    FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY candidate_skills_owner_all ON public.candidate_skills
    FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY candidate_portfolios_owner_all ON public.candidate_portfolios
    FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY candidate_projects_owner_all ON public.candidate_projects
    FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY candidate_resumes_owner_all ON public.candidate_resumes
    FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY candidate_ai_analysis_owner_all ON public.candidate_ai_analysis
    FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY candidate_activity_owner_all ON public.candidate_activity
    FOR ALL USING (auth.uid() = candidate_id);

-- Employer & Public Read-Only Policy (Controlled by candidate_privacy)
CREATE POLICY candidate_profiles_public_read ON public.candidate_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.candidate_privacy p
            WHERE p.candidate_id = candidate_profiles.id AND p.is_public = TRUE
        )
    );
