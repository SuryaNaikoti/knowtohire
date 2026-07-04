-- KnowToHire Sprint 5 Migration
-- Enhance job_alerts with additional filter columns and active/frequency flags
-- Date: 2026-07-05

ALTER TABLE public.job_alerts
  ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS location_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS min_salary INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frequency VARCHAR(10) DEFAULT 'weekly'
    CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Index for active alerts lookup
CREATE INDEX IF NOT EXISTS idx_job_alerts_candidate_active
  ON public.job_alerts(candidate_id, is_active);
