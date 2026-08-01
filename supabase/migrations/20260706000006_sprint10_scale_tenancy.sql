-- Migration: Sprint 10 Scale & Multi-Tenancy Enhancements
-- 20260706000006_sprint10_scale_tenancy.sql

-- 1. Extend companies table for Multi-Tenancy
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS subdomain VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{"primaryColor": "#0F52BA", "themeMode": "light"}'::jsonb,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"allowJobMatching": true, "enableNotifications": true}'::jsonb;

-- Create GIN index for theme and settings search/filtering
CREATE INDEX IF NOT EXISTS idx_companies_theme_config ON public.companies USING gin (theme_config);
CREATE INDEX IF NOT EXISTS idx_companies_settings ON public.companies USING gin (settings);

-- 2. Create Event-Driven Automation Tables
CREATE TABLE IF NOT EXISTS public.automation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type VARCHAR(255) NOT NULL, -- e.g., 'application_submitted', 'application_reviewed', 'interview_scheduled'
  payload JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_automation_events_status ON public.automation_events(status);
CREATE INDEX IF NOT EXISTS idx_automation_events_tenant ON public.automation_events(tenant_id);

-- Enable RLS for automation events
ALTER TABLE public.automation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view automation events"
  ON public.automation_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_team_members ctm
      WHERE ctm.company_id = tenant_id AND ctm.employer_id = auth.uid() AND ctm.member_role IN ('Admin', 'Recruiter')
    )
  );

-- 3. Create stored procedure for trigger on application state change
CREATE OR REPLACE FUNCTION public.handle_application_state_change()
RETURNS TRIGGER AS $$
DECLARE
  company_id_val UUID;
BEGIN
  -- Fetch company_id linked to the job
  SELECT company_id INTO company_id_val
  FROM public.jobs
  WHERE id = NEW.job_id;

  IF company_id_val IS NOT NULL THEN
    -- Insert an automation event
    INSERT INTO public.automation_events (tenant_id, event_type, payload)
    VALUES (
      company_id_val,
      'application_state_change',
      jsonb_build_object(
        'application_id', NEW.id,
        'job_id', NEW.job_id,
        'candidate_id', NEW.candidate_id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for application status change
DROP TRIGGER IF EXISTS trg_application_state_change ON public.job_applications;
CREATE TRIGGER trg_application_state_change
  AFTER UPDATE OF status ON public.job_applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_application_state_change();

-- 4. Database Optimization Procedures (VACUUM / ANALYZE guidelines)
CREATE OR REPLACE FUNCTION public.run_database_maintenance()
RETURNS VOID AS $$
BEGIN
  -- We perform an ANALYZE on critical tables to update database stats.
  -- Note: Run-time VACUUM FULL cannot be done in a standard transactional function block in PostgreSQL,
  -- but standard ANALYZE updates query planner stats dynamically.
  ANALYZE public.companies;
  ANALYZE public.jobs;
  ANALYZE public.job_applications;
  ANALYZE public.profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
