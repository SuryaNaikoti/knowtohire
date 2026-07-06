-- ============================================================
-- Sprint 8: Platform Optimizations, Search & Notifications
-- Migration: 20260706000003_sprint8_optimizations.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION 1: Full-Text Search for Jobs
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.update_jobs_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_jobs_search_vector ON public.jobs;
CREATE TRIGGER trigger_jobs_search_vector
  BEFORE INSERT OR UPDATE OF title, description ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_jobs_search_vector();

CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON public.jobs USING GIN(search_vector);

-- ─────────────────────────────────────────────────────────────
-- SECTION 2: Full-Text Search for Resources
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.update_resources_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_resources_search_vector ON public.resources;
CREATE TRIGGER trigger_resources_search_vector
  BEFORE INSERT OR UPDATE OF title, description ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_resources_search_vector();

CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON public.resources USING GIN(search_vector);

-- ─────────────────────────────────────────────────────────────
-- SECTION 3: Full-Text Search for Templates
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.update_templates_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_templates_search_vector ON public.templates;
CREATE TRIGGER trigger_templates_search_vector
  BEFORE INSERT OR UPDATE OF title, description ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_templates_search_vector();

CREATE INDEX IF NOT EXISTS idx_templates_search_vector ON public.templates USING GIN(search_vector);

-- ─────────────────────────────────────────────────────────────
-- SECTION 4: Full-Text Search for Lead Magnets
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.lead_magnets ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.update_lead_magnets_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_lead_magnets_search_vector ON public.lead_magnets;
CREATE TRIGGER trigger_lead_magnets_search_vector
  BEFORE INSERT OR UPDATE OF title, description ON public.lead_magnets
  FOR EACH ROW EXECUTE FUNCTION public.update_lead_magnets_search_vector();

CREATE INDEX IF NOT EXISTS idx_lead_magnets_search_vector ON public.lead_magnets USING GIN(search_vector);

-- ─────────────────────────────────────────────────────────────
-- SECTION 5: Notification System Schema
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error', 'application', 'purchase'
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System/Service role insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  digest_enabled BOOLEAN NOT NULL DEFAULT false,
  digest_frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly'
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
