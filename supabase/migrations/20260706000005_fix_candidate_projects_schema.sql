-- Migration: fix_candidate_projects_schema
-- Added on 2026-07-06
ALTER TABLE public.candidate_projects
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_candidate_projects_featured ON public.candidate_projects(is_featured);
