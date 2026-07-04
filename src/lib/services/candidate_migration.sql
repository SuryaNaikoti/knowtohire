-- SPRINT 2: CANDIDATE MODULE SCHEMA MIGRATION

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CANDIDATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    bio TEXT,
    desired_salary NUMERIC(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    resume_url TEXT,
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'employers-only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CANDIDATE SKILLS TABLE (Relational - No arrays)
CREATE TABLE IF NOT EXISTS public.candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    years_of_experience INT CHECK (years_of_experience >= 0),
    competency_level VARCHAR(20) CHECK (competency_level IN ('Beginner', 'Intermediate', 'Expert')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(candidate_id, skill_name)
);

-- 3. CANDIDATE EDUCATION TABLE
CREATE TABLE IF NOT EXISTS public.candidate_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(100) NOT NULL,
    field_of_study VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CANDIDATE EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS public.candidate_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    location VARCHAR(150),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. CANDIDATE CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.candidate_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    credential_id VARCHAR(100),
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS POLICIES CONFIGURATION
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_certifications ENABLE ROW LEVEL SECURITY;

-- Owner Write / Select RLS Policies
CREATE POLICY "Candidates can manage their own profile" 
    ON public.candidate_profiles FOR ALL 
    USING (auth.uid() = id);

CREATE POLICY "Candidates can manage their own skills" 
    ON public.candidate_skills FOR ALL 
    USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can manage their own education" 
    ON public.candidate_education FOR ALL 
    USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can manage their own experience" 
    ON public.candidate_experience FOR ALL 
    USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can manage their own certifications" 
    ON public.candidate_certifications FOR ALL 
    USING (auth.uid() = candidate_id);

-- Read Access RLS Policies for Profiles
CREATE POLICY "Public profiles are visible to all users" 
    ON public.candidate_profiles FOR SELECT 
    USING (profile_visibility = 'public');

CREATE POLICY "Employer visible profiles"
    ON public.candidate_profiles FOR SELECT
    USING (profile_visibility = 'employers-only');
