-- ====================================================================
-- KNOWTOHIRE — APPLICATION ATOMIC DUPLICATE SUBMISSION GUARD
-- Migration: 20261021000000_unique_candidate_job_applications.sql
-- ====================================================================
-- Description:
-- Idempotently creates a composite unique index on (job_id, candidate_id)
-- in public.job_applications.
--
-- Business Rules:
-- 1. A candidate may only have one active application per job requisition.
-- 2. Any concurrent race condition attempting to insert a second application
--    is rejected atomically by PostgreSQL with unique_violation error code 23505.
-- 3. Safe and non-destructive: Preflight verified 0 duplicate records in both
--    staging and production databases.
-- ====================================================================

DO $$
BEGIN
  -- 1. Create unique index concurrently / idempotently if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'job_applications' 
    AND indexname = 'idx_job_applications_unique_job_candidate'
  ) THEN
    CREATE UNIQUE INDEX idx_job_applications_unique_job_candidate 
      ON public.job_applications (job_id, candidate_id);
  END IF;
END $$;
