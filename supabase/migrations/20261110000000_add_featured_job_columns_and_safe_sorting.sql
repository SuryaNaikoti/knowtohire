-- ==============================================================================
-- KNOWTOHIRE.COM DATABASE MIGRATION
-- Migration Name: 20261110000000_add_featured_job_columns_and_safe_sorting.sql
-- Description: Adds is_featured, featured_start_date, featured_end_date, and
--              featured_duration_days to public.jobs table.
-- Safety: Reversible, non-destructive, sets DEFAULT false on is_featured.
-- ==============================================================================

DO $$
BEGIN
    -- 1. Add is_featured column if missing
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'jobs'
          AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- 2. Add featured_start_date column if missing
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'jobs'
          AND column_name = 'featured_start_date'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN featured_start_date TIMESTAMPTZ DEFAULT NULL;
    END IF;

    -- 3. Add featured_end_date column if missing
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'jobs'
          AND column_name = 'featured_end_date'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN featured_end_date TIMESTAMPTZ DEFAULT NULL;
    END IF;

    -- 4. Add featured_duration_days column if missing
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'jobs'
          AND column_name = 'featured_duration_days'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN featured_duration_days INTEGER DEFAULT NULL;
    END IF;
END $$;

-- 5. Add index on is_featured for fast filtering and ordering
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON public.jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_jobs_featured_lookup ON public.jobs(is_featured, status, published_at DESC);

-- Rollback script:
-- ALTER TABLE public.jobs DROP COLUMN IF EXISTS is_featured;
-- ALTER TABLE public.jobs DROP COLUMN IF EXISTS featured_start_date;
-- ALTER TABLE public.jobs DROP COLUMN IF EXISTS featured_end_date;
-- ALTER TABLE public.jobs DROP COLUMN IF EXISTS featured_duration_days;
-- DROP INDEX IF EXISTS idx_jobs_is_featured;
-- DROP INDEX IF EXISTS idx_jobs_featured_lookup;

