-- ====================================================================
-- KNOWTOHIRE — MODULE 02: JOB PORTAL & RECRUITMENT DATABASE SCHEMA
-- Migration: 20260815000000_job_portal_and_recruitment_schema.sql
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. CUSTOM ENUMS (Idempotent Definition)
-- --------------------------------------------------------------------

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('draft', 'published', 'paused', 'closed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type') THEN
    CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'hybrid', 'internship');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_mode') THEN
    CREATE TYPE work_mode AS ENUM ('on_site', 'hybrid', 'remote');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'experience_level') THEN
    CREATE TYPE experience_level AS ENUM ('fresher', 'associate', 'mid_level', 'senior', 'lead', 'executive');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_stage') THEN
    CREATE TYPE application_stage AS ENUM ('new', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_type') THEN
    CREATE TYPE interview_type AS ENUM ('hr_screening', 'technical_deep_dive', 'case_study', 'executive_review');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_status') THEN
    CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
  END IF;
END $$;

-- --------------------------------------------------------------------
-- 2. PUBLIC JOBS TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  category TEXT NOT NULL DEFAULT 'General',
  description TEXT NOT NULL DEFAULT '',
  responsibilities TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  requirements TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  skills TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  benefits TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  work_mode work_mode NOT NULL DEFAULT 'hybrid',
  experience_level experience_level NOT NULL DEFAULT 'mid_level',
  location TEXT NOT NULL DEFAULT 'India',
  state_code TEXT,
  is_remote BOOLEAN NOT NULL DEFAULT false,
  min_salary_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_salary_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
  salary_currency TEXT NOT NULL DEFAULT 'INR',
  status job_status NOT NULL DEFAULT 'draft',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  application_deadline TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist on jobs table even if pre-existing
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'General';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employment_type employment_type DEFAULT 'full_time';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS work_mode work_mode DEFAULT 'hybrid';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_level experience_level DEFAULT 'mid_level';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'India';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS state_code TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS min_salary_inr NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS max_salary_inr NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'INR';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status job_status DEFAULT 'draft';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMPTZ;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Indexes for Job Search and Filters
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_state_code ON public.jobs(state_code);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON public.jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON public.jobs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON public.jobs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_skills_gin ON public.jobs USING GIN(skills);

-- --------------------------------------------------------------------
-- 3. JOB APPLICATIONS TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  stage application_stage NOT NULL DEFAULT 'new',
  resume_url TEXT NOT NULL DEFAULT '',
  cover_letter TEXT,
  candidate_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
  employer_notes TEXT,
  rejection_reason TEXT,
  employer_rating INTEGER CHECK (employer_rating BETWEEN 1 AND 5),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ
);

ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS stage application_stage DEFAULT 'new';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS resume_url TEXT DEFAULT '';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS candidate_snapshot JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS employer_notes TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS employer_rating INTEGER;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

-- Indexes for Application Lookups & ATS
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON public.job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_id ON public.job_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_stage ON public.job_applications(stage);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at DESC);

-- --------------------------------------------------------------------
-- 4. SAVED JOBS TABLE (Bookmarks)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate_id ON public.saved_jobs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs(job_id);

-- --------------------------------------------------------------------
-- 5. APPLICATION STATUS HISTORY (Immutable Audit Trail)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  from_stage application_stage,
  to_stage application_stage NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.application_status_history ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE;
ALTER TABLE public.application_status_history ADD COLUMN IF NOT EXISTS from_stage application_stage;
ALTER TABLE public.application_status_history ADD COLUMN IF NOT EXISTS to_stage application_stage DEFAULT 'new';
ALTER TABLE public.application_status_history ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.application_status_history ADD COLUMN IF NOT EXISTS note TEXT;

CREATE INDEX IF NOT EXISTS idx_app_history_app_id ON public.application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_app_history_created_at ON public.application_status_history(created_at DESC);

-- --------------------------------------------------------------------
-- 6. INTERVIEWS TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  interview_type interview_type NOT NULL DEFAULT 'technical_deep_dive',
  title TEXT NOT NULL DEFAULT 'Interview',
  scheduled_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_end TIMESTAMPTZ,
  meeting_link TEXT,
  location TEXT,
  status interview_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS interview_type interview_type DEFAULT 'technical_deep_dive';
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Interview';
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS status interview_status DEFAULT 'scheduled';
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_interviews_app_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_company_id ON public.interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_start ON public.interviews(scheduled_start);

-- --------------------------------------------------------------------
-- 7. SAVED CANDIDATES TABLE (Employer Talent Bookmarks)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_company_saved_candidate UNIQUE(company_id, candidate_id)
);

ALTER TABLE public.saved_candidates ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.saved_candidates ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.saved_candidates ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.saved_candidates ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_saved_candidates_company_id ON public.saved_candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_candidate_id ON public.saved_candidates(candidate_id);

-- --------------------------------------------------------------------
-- 8. AUTOMATIC TRIGGERS & BUSINESS GOVERNANCE
-- --------------------------------------------------------------------

-- A. Updated_at Trigger Attaching
DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON public.jobs;
CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER trigger_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_interviews_updated_at ON public.interviews;
CREATE TRIGGER trigger_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- B. Automatic Application Status History Logging Trigger
CREATE OR REPLACE FUNCTION public.handle_application_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.application_status_history (
      application_id,
      from_stage,
      to_stage,
      changed_by,
      note
    ) VALUES (
      NEW.id,
      NULL,
      NEW.stage,
      auth.uid(),
      'Initial application submission'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO public.application_status_history (
      application_id,
      from_stage,
      to_stage,
      changed_by,
      note
    ) VALUES (
      NEW.id,
      OLD.stage,
      NEW.stage,
      auth.uid(),
      CASE 
        WHEN NEW.stage = 'withdrawn' THEN 'Application withdrawn by candidate'
        WHEN NEW.stage = 'rejected' THEN COALESCE(NEW.rejection_reason, 'Candidate application rejected')
        ELSE 'Application stage updated'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_application_status ON public.job_applications;
CREATE TRIGGER trigger_log_application_status
  AFTER INSERT OR UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_stage_change();

-- C. Validation Trigger: Prevent applying to non-published jobs
CREATE OR REPLACE FUNCTION public.validate_job_application_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  v_job_status job_status;
  v_company_id UUID;
BEGIN
  SELECT status, company_id INTO v_job_status, v_company_id
  FROM public.jobs
  WHERE id = NEW.job_id;

  IF v_job_status IS NULL THEN
    RAISE EXCEPTION 'Referenced job does not exist.';
  END IF;

  IF v_job_status != 'published' THEN
    RAISE EXCEPTION 'Applications can only be submitted for published job listings.';
  END IF;

  -- Ensure company_id on application matches job's company_id
  NEW.company_id := v_company_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_application_eligibility ON public.job_applications;
CREATE TRIGGER trigger_validate_application_eligibility
  BEFORE INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_job_application_eligibility();

-- D. Validation Trigger: Ensure employer is authorized and company verification allows publishing
CREATE OR REPLACE FUNCTION public.validate_job_publishing_governance()
RETURNS TRIGGER AS $$
DECLARE
  v_user_role user_role;
  v_user_company_id UUID;
  v_company_verification company_verification_status;
BEGIN
  SELECT role INTO v_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Admins can bypass company checks
  IF v_user_role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Validate employer belongs to the target company
  SELECT company_id INTO v_user_company_id 
  FROM public.employer_profiles 
  WHERE profile_id = auth.uid();

  IF v_user_company_id IS NULL OR v_user_company_id != NEW.company_id THEN
    RAISE EXCEPTION 'Unauthorized: You may only manage jobs for your own verified enterprise.';
  END IF;

  -- If status is being set to published, verify company status
  IF NEW.status = 'published' THEN
    SELECT verification_status INTO v_company_verification
    FROM public.company_profiles
    WHERE id = NEW.company_id;

    IF v_company_verification NOT IN ('verified', 'pending_review') THEN
      RAISE EXCEPTION 'Company verification is required before job listings can be published.';
    END IF;

    IF NEW.published_at IS NULL THEN
      NEW.published_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_job_publishing ON public.jobs;
CREATE TRIGGER trigger_validate_job_publishing
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_job_publishing_governance();

-- --------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

-- ==================== 9.1 JOBS POLICIES ====================

-- 1. Public Discovery: Anyone can view published jobs
DROP POLICY IF EXISTS "jobs_select_public_published" ON public.jobs;
CREATE POLICY "jobs_select_public_published"
  ON public.jobs
  FOR SELECT
  USING (status = 'published');

-- 2. Employer Read: Employers can view all jobs (including drafts/paused/closed) for their company
DROP POLICY IF EXISTS "jobs_select_employer_company" ON public.jobs;
CREATE POLICY "jobs_select_employer_company"
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 3. Employer Insert: Authorized employers can insert jobs for their company
DROP POLICY IF EXISTS "jobs_insert_employer" ON public.jobs;
CREATE POLICY "jobs_insert_employer"
  ON public.jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 4. Employer Update: Authorized employers can update their company jobs
DROP POLICY IF EXISTS "jobs_update_employer" ON public.jobs;
CREATE POLICY "jobs_update_employer"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 5. Employer Delete: Authorized employers can delete draft jobs
DROP POLICY IF EXISTS "jobs_delete_employer" ON public.jobs;
CREATE POLICY "jobs_delete_employer"
  ON public.jobs
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 6. Admin Full Access on Jobs
DROP POLICY IF EXISTS "jobs_admin_all" ON public.jobs;
CREATE POLICY "jobs_admin_all"
  ON public.jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==================== 9.2 JOB APPLICATIONS POLICIES ====================

-- 1. Candidate View Own Applications
DROP POLICY IF EXISTS "job_applications_select_candidate_own" ON public.job_applications;
CREATE POLICY "job_applications_select_candidate_own"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (candidate_id = auth.uid());

-- 2. Candidate Submit Own Application
DROP POLICY IF EXISTS "job_applications_insert_candidate_own" ON public.job_applications;
CREATE POLICY "job_applications_insert_candidate_own"
  ON public.job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    candidate_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'candidate')
  );

-- 3. Candidate Withdraw Own Application (Can only update stage to 'withdrawn')
DROP POLICY IF EXISTS "job_applications_update_candidate_withdraw" ON public.job_applications;
CREATE POLICY "job_applications_update_candidate_withdraw"
  ON public.job_applications
  FOR UPDATE
  TO authenticated
  USING (candidate_id = auth.uid())
  WITH CHECK (
    candidate_id = auth.uid() AND
    stage = 'withdrawn'
  );

-- 4. Employer View Applications for their Company's Jobs
DROP POLICY IF EXISTS "job_applications_select_employer_company" ON public.job_applications;
CREATE POLICY "job_applications_select_employer_company"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 5. Employer Update Application Stage & Employer Notes
DROP POLICY IF EXISTS "job_applications_update_employer_company" ON public.job_applications;
CREATE POLICY "job_applications_update_employer_company"
  ON public.job_applications
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 6. Admin Full Access on Applications
DROP POLICY IF EXISTS "job_applications_admin_all" ON public.job_applications;
CREATE POLICY "job_applications_admin_all"
  ON public.job_applications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==================== 9.3 SAVED JOBS POLICIES ====================

-- 1. Candidate View Own Saved Jobs
DROP POLICY IF EXISTS "saved_jobs_select_candidate_own" ON public.saved_jobs;
CREATE POLICY "saved_jobs_select_candidate_own"
  ON public.saved_jobs
  FOR SELECT
  TO authenticated
  USING (candidate_id = auth.uid());

-- 2. Candidate Insert Own Saved Job
DROP POLICY IF EXISTS "saved_jobs_insert_candidate_own" ON public.saved_jobs;
CREATE POLICY "saved_jobs_insert_candidate_own"
  ON public.saved_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (candidate_id = auth.uid());

-- 3. Candidate Delete Own Saved Job
DROP POLICY IF EXISTS "saved_jobs_delete_candidate_own" ON public.saved_jobs;
CREATE POLICY "saved_jobs_delete_candidate_own"
  ON public.saved_jobs
  FOR DELETE
  TO authenticated
  USING (candidate_id = auth.uid());

-- ==================== 9.4 APPLICATION STATUS HISTORY POLICIES ====================

-- 1. Candidate View History for Own Application
DROP POLICY IF EXISTS "app_history_select_candidate_own" ON public.application_status_history;
CREATE POLICY "app_history_select_candidate_own"
  ON public.application_status_history
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM public.job_applications WHERE candidate_id = auth.uid()
    )
  );

-- 2. Employer View History for Company Applications
DROP POLICY IF EXISTS "app_history_select_employer_company" ON public.application_status_history;
CREATE POLICY "app_history_select_employer_company"
  ON public.application_status_history
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM public.job_applications WHERE company_id IN (
        SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
      )
    )
  );

-- 3. Admin View All History
DROP POLICY IF EXISTS "app_history_select_admin" ON public.application_status_history;
CREATE POLICY "app_history_select_admin"
  ON public.application_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==================== 9.5 INTERVIEWS POLICIES ====================

-- 1. Candidate View Own Scheduled Interviews
DROP POLICY IF EXISTS "interviews_select_candidate_own" ON public.interviews;
CREATE POLICY "interviews_select_candidate_own"
  ON public.interviews
  FOR SELECT
  TO authenticated
  USING (candidate_id = auth.uid());

-- 2. Employer View Interviews for Company
DROP POLICY IF EXISTS "interviews_select_employer_company" ON public.interviews;
CREATE POLICY "interviews_select_employer_company"
  ON public.interviews
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 3. Employer Manage (Insert, Update, Delete) Interviews for Company
DROP POLICY IF EXISTS "interviews_insert_employer" ON public.interviews;
CREATE POLICY "interviews_insert_employer"
  ON public.interviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "interviews_update_employer" ON public.interviews;
CREATE POLICY "interviews_update_employer"
  ON public.interviews
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "interviews_delete_employer" ON public.interviews;
CREATE POLICY "interviews_delete_employer"
  ON public.interviews
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 4. Admin Access on Interviews
DROP POLICY IF EXISTS "interviews_admin_all" ON public.interviews;
CREATE POLICY "interviews_admin_all"
  ON public.interviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==================== 9.6 SAVED CANDIDATES POLICIES ====================

-- 1. Employer View Company Saved Candidates
DROP POLICY IF EXISTS "saved_candidates_select_employer_company" ON public.saved_candidates;
CREATE POLICY "saved_candidates_select_employer_company"
  ON public.saved_candidates
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 2. Employer Insert Saved Candidate for Company
DROP POLICY IF EXISTS "saved_candidates_insert_employer" ON public.saved_candidates;
CREATE POLICY "saved_candidates_insert_employer"
  ON public.saved_candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id = auth.uid() AND
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );

-- 3. Employer Delete Saved Candidate for Company
DROP POLICY IF EXISTS "saved_candidates_delete_employer" ON public.saved_candidates;
CREATE POLICY "saved_candidates_delete_employer"
  ON public.saved_candidates
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()
    )
  );
