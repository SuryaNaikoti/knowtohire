-- ====================================================================
-- KNOWTOHIRE — MODULE 01: AUTHENTICATION & ONBOARDING DATABASE SCHEMA
-- Migration: 20260813000000_auth_and_profiles_schema.sql
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. CUSTOM ENUMS
-- --------------------------------------------------------------------

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('unverified', 'pending_onboarding', 'active', 'suspended');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_verification_status') THEN
    CREATE TYPE company_verification_status AS ENUM ('unverified', 'pending_review', 'verified', 'rejected');
  END IF;
END $$;

-- --------------------------------------------------------------------
-- 2. PUBLIC PROFILES TABLE (Linked 1:1 with auth.users)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'candidate',
  status account_status NOT NULL DEFAULT 'unverified',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- --------------------------------------------------------------------
-- 3. CANDIDATE PROFILES TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  location TEXT,
  domain_specialization TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  experience JSONB NOT NULL DEFAULT '[]'::JSONB,
  education JSONB NOT NULL DEFAULT '[]'::JSONB,
  certifications TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  career_preferences JSONB DEFAULT '{}'::JSONB,
  preferred_salary_min NUMERIC,
  preferred_salary_max NUMERIC,
  employment_preference TEXT,
  notice_period_days INTEGER,
  resume_url TEXT,
  profile_completion_pct INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_profile_id ON public.candidate_profiles(profile_id);

-- --------------------------------------------------------------------
-- 4. COMPANY PROFILES TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  logo_url TEXT,
  website_url TEXT,
  industry TEXT,
  company_size TEXT,
  headquarters_location TEXT,
  verification_status company_verification_status NOT NULL DEFAULT 'unverified',
  registration_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. EMPLOYER PROFILES TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE RESTRICT,
  job_title TEXT,
  work_phone TEXT,
  is_company_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employer_profiles_profile_id ON public.employer_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_company_id ON public.employer_profiles(company_id);

-- --------------------------------------------------------------------
-- 6. AUTOMATIC TIMESTAMP UPDATE TRIGGER FUNCTION
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_candidate_profiles_updated_at ON public.candidate_profiles;
CREATE TRIGGER trg_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_company_profiles_updated_at ON public.company_profiles;
CREATE TRIGGER trg_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_employer_profiles_updated_at ON public.employer_profiles;
CREATE TRIGGER trg_employer_profiles_updated_at
  BEFORE UPDATE ON public.employer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- 7. SECURE AUTH USER -> PROFILE CREATION TRIGGER
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role user_role;
  initial_status account_status;
  user_full_name TEXT;
BEGIN
  -- Extract full_name metadata safely
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

  -- Sanitize role input: ONLY allow 'candidate' or 'employer' from metadata.
  -- Hard-block 'admin' self-registration attempts to prevent role escalation.
  IF NEW.raw_user_meta_data->>'role' = 'employer' THEN
    requested_role := 'employer'::user_role;
  ELSE
    requested_role := 'candidate'::user_role; -- Default safe role
  END IF;

  -- Determine account status based on email verification state
  IF NEW.email_confirmed_at IS NOT NULL THEN
    initial_status := 'pending_onboarding'::account_status;
  ELSE
    initial_status := 'unverified'::account_status;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    requested_role,
    initial_status
  )
  ON CONFLICT (id) DO NOTHING;

  -- Automatically initialize candidate_profiles row if candidate
  IF requested_role = 'candidate' THEN
    INSERT INTO public.candidate_profiles (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) & POLICIES
-- --------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;

-- ==================== PROFILES POLICIES ====================

-- 1. Users can read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Authenticated users can view basic profiles of others (for hiring / applicant matching)
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Users can update non-sensitive fields on their own profile.
-- Role and Status CANNOT be altered by the user via client update.
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );

-- ==================== CANDIDATE_PROFILES POLICIES ====================

-- 1. Candidate can view own profile
DROP POLICY IF EXISTS "candidate_profiles_select_own" ON public.candidate_profiles;
CREATE POLICY "candidate_profiles_select_own"
  ON public.candidate_profiles
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- 2. Employers can view candidate profiles
DROP POLICY IF EXISTS "candidate_profiles_select_employers" ON public.candidate_profiles;
CREATE POLICY "candidate_profiles_select_employers"
  ON public.candidate_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

-- 3. Candidate can insert own profile
DROP POLICY IF EXISTS "candidate_profiles_insert_own" ON public.candidate_profiles;
CREATE POLICY "candidate_profiles_insert_own"
  ON public.candidate_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- 4. Candidate can update own profile
DROP POLICY IF EXISTS "candidate_profiles_update_own" ON public.candidate_profiles;
CREATE POLICY "candidate_profiles_update_own"
  ON public.candidate_profiles
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ==================== COMPANY_PROFILES POLICIES ====================

-- 1. Anyone authenticated can view company profiles
DROP POLICY IF EXISTS "company_profiles_select_public" ON public.company_profiles;
CREATE POLICY "company_profiles_select_public"
  ON public.company_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Authenticated employers can insert a company profile during onboarding
DROP POLICY IF EXISTS "company_profiles_insert_employer" ON public.company_profiles;
CREATE POLICY "company_profiles_insert_employer"
  ON public.company_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

-- 3. Employers belonging to the company can update company details
DROP POLICY IF EXISTS "company_profiles_update_employer" ON public.company_profiles;
CREATE POLICY "company_profiles_update_employer"
  ON public.company_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE company_id = company_profiles.id AND profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employer_profiles
      WHERE company_id = company_profiles.id AND profile_id = auth.uid()
    )
  );

-- ==================== EMPLOYER_PROFILES POLICIES ====================

-- 1. Employer can view own employer profile
DROP POLICY IF EXISTS "employer_profiles_select_own" ON public.employer_profiles;
CREATE POLICY "employer_profiles_select_own"
  ON public.employer_profiles
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- 2. Employers in the same company can view colleague employer profiles
DROP POLICY IF EXISTS "employer_profiles_select_company_colleagues" ON public.employer_profiles;
CREATE POLICY "employer_profiles_select_company_colleagues"
  ON public.employer_profiles
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 3. Employer can insert own employer profile
DROP POLICY IF EXISTS "employer_profiles_insert_own" ON public.employer_profiles;
CREATE POLICY "employer_profiles_insert_own"
  ON public.employer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

-- 4. Employer can update own employer profile
DROP POLICY IF EXISTS "employer_profiles_update_own" ON public.employer_profiles;
CREATE POLICY "employer_profiles_update_own"
  ON public.employer_profiles
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
