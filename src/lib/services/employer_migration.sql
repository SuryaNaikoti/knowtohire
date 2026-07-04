-- SPRINT 3: EMPLOYER MODULE SCHEMA MIGRATION

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    company_email VARCHAR(255),
    linkedin_url TEXT,
    website_url TEXT,
    industry VARCHAR(150),
    company_size VARCHAR(50),
    description TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. EMPLOYER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.employer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    job_title VARCHAR(150),
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. COMPANY LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.company_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    is_headquarters BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. COMPANY TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.company_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL UNIQUE REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
    member_role VARCHAR(20) DEFAULT 'Recruiter' CHECK (member_role IN ('Admin', 'Recruiter', 'Viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS POLICIES CONFIGURATION
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;

-- Employer Profile Access
CREATE POLICY "Employers can manage their own profile"
    ON public.employer_profiles FOR ALL
    USING (auth.uid() = id);

-- Company Team Members Access
CREATE POLICY "Team members can view team registry"
    ON public.company_team_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = company_team_members.company_id AND employer_id = auth.uid()
    ));

CREATE POLICY "Admins can manage team registry"
    ON public.company_team_members FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = company_team_members.company_id AND employer_id = auth.uid() AND member_role = 'Admin'
    ));

-- Company General Access (Write restricted to verified team members)
CREATE POLICY "Team members can view company details"
    ON public.companies FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = companies.id AND employer_id = auth.uid()
    ));

CREATE POLICY "Company admins/recruiters can update details"
    ON public.companies FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = companies.id AND employer_id = auth.uid() AND member_role IN ('Admin', 'Recruiter')
    ));

-- Company Locations Access
CREATE POLICY "Team members can manage company locations"
    ON public.company_locations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.company_team_members 
        WHERE company_id = company_locations.company_id AND employer_id = auth.uid() AND member_role IN ('Admin', 'Recruiter')
    ));
