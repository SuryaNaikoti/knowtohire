-- ============================================================================
-- Migration: 20260907000000_external_jobs_schema.sql
-- Description: Creates public.external_jobs table with RLS policies, indexes, and constraints.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.external_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  description TEXT,
  redirect_url TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('latest', 'fresher', 'walk_in')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  display_order INTEGER NOT NULL DEFAULT 0,
  published_from TIMESTAMPTZ,
  published_until TIMESTAMPTZ,
  link_label TEXT DEFAULT 'View Job',
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid querying, filtering and sorting
CREATE INDEX IF NOT EXISTS idx_external_jobs_section ON public.external_jobs(section);
CREATE INDEX IF NOT EXISTS idx_external_jobs_status ON public.external_jobs(status);
CREATE INDEX IF NOT EXISTS idx_external_jobs_display_order ON public.external_jobs(display_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_jobs_published_dates ON public.external_jobs(published_from, published_until);
CREATE INDEX IF NOT EXISTS idx_external_jobs_created_at ON public.external_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE public.external_jobs ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy:
-- Unauthenticated and authenticated users can view published jobs within valid publication date windows.
-- Admins can view all jobs regardless of status or date.
DROP POLICY IF EXISTS "external_jobs_public_select" ON public.external_jobs;
CREATE POLICY "external_jobs_public_select"
  ON public.external_jobs
  FOR SELECT
  TO public
  USING (
    (
      status = 'published'
      AND (published_from IS NULL OR published_from <= NOW())
      AND (published_until IS NULL OR published_until >= NOW())
    )
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Admin Management Policy:
-- Only authenticated users with admin role can create, update, or delete external jobs.
DROP POLICY IF EXISTS "external_jobs_admin_all" ON public.external_jobs;
CREATE POLICY "external_jobs_admin_all"
  ON public.external_jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
