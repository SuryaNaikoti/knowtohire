-- KnowToHire Sprint 5 Migration
-- Enhance candidate_projects with tech stack, GitHub, thumbnail, and featured flag
-- Date: 2026-07-05

ALTER TABLE public.candidate_projects
  ADD COLUMN IF NOT EXISTS tech_stack TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE NOT NULL;

-- Index for featured projects
CREATE INDEX IF NOT EXISTS idx_candidate_projects_candidate_id
  ON public.candidate_projects(candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_projects_featured
  ON public.candidate_projects(candidate_id, is_featured);
