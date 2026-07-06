-- ============================================================
-- Sprint 7: Content CMS & Analytics System
-- Migration: 20260706000001_content_cms_system.sql
-- Description: Blog enhancements, Lead Magnets, Resource Requests,
--              Analytics Events, Audit Logs, Admin CMS tables
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION 1: BLOG SYSTEM ENHANCEMENTS
-- (blog_categories, blog_posts, blog_tags already exist from
--  init_schema — we ADD new columns and indexes only)
-- ─────────────────────────────────────────────────────────────

-- Add missing columns to blog_posts if not present
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS featured_image TEXT,
  ADD COLUMN IF NOT EXISTS read_time_minutes INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_gated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lead_magnet_id UUID,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Add missing columns to blog_categories if not present
ALTER TABLE public.blog_categories
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#10b981',
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

-- ─────────────────────────────────────────────────────────────
-- SECTION 2: LEAD MAGNETS SYSTEM
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lead_magnets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL DEFAULT 'ebook'
                  CHECK (type IN ('ebook', 'checklist', 'template', 'course', 'webinar', 'report')),
  file_url      TEXT,
  thumbnail_url TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  gate_type     TEXT NOT NULL DEFAULT 'email'
                  CHECK (gate_type IN ('email', 'account', 'subscription')),
  required_plan TEXT,
  download_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_magnet_captures (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id UUID NOT NULL REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email          TEXT NOT NULL,
  first_name     TEXT,
  last_name      TEXT,
  company        TEXT,
  job_title      TEXT,
  source         TEXT,
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  ip_address     INET,
  downloaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SECTION 3: RESOURCE REQUEST SYSTEM
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.resource_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT,
  type        TEXT CHECK (type IN ('template', 'guide', 'video', 'tool', 'other')),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'under_review', 'planned', 'completed', 'rejected')),
  upvote_count INTEGER DEFAULT 0,
  admin_notes TEXT,
  completed_resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resource_request_upvotes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_request_id UUID NOT NULL REFERENCES public.resource_requests(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(resource_request_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- SECTION 4: ANALYTICS EVENTS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id    TEXT,
  event_type    TEXT NOT NULL,
  event_category TEXT NOT NULL DEFAULT 'general',
  entity_type   TEXT,
  entity_id     UUID,
  properties    JSONB DEFAULT '{}',
  page_url      TEXT,
  referrer      TEXT,
  user_agent    TEXT,
  ip_address    INET,
  country_code  TEXT,
  device_type   TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materialized daily analytics summary
CREATE TABLE IF NOT EXISTS public.analytics_daily_summary (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date  DATE NOT NULL,
  event_type    TEXT NOT NULL,
  event_category TEXT NOT NULL,
  entity_type   TEXT,
  total_events  INTEGER DEFAULT 0,
  unique_users  INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(summary_date, event_type, event_category, entity_type)
);

-- ─────────────────────────────────────────────────────────────
-- SECTION 5: AUDIT LOGS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  table_name    TEXT,
  record_id     UUID,
  old_values    JSONB,
  new_values    JSONB,
  ip_address    INET,
  user_agent    TEXT,
  metadata      JSONB DEFAULT '{}',
  severity      TEXT NOT NULL DEFAULT 'info'
                CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SECTION 6: BLOG COMMENTS (for engagement)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id   UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_deleted  BOOLEAN DEFAULT FALSE,
  like_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SECTION 7: NEWSLETTER ENHANCEMENTS
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- ─────────────────────────────────────────────────────────────
-- SECTION 8: INDEXES
-- ─────────────────────────────────────────────────────────────

-- Blog indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON public.blog_posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_gated ON public.blog_posts(is_gated);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- Lead magnet indexes
CREATE INDEX IF NOT EXISTS idx_lead_magnets_slug ON public.lead_magnets(slug);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_is_active ON public.lead_magnets(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_magnet ON public.lead_magnet_captures(lead_magnet_id);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_email ON public.lead_magnet_captures(email);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_user ON public.lead_magnet_captures(user_id);

-- Resource request indexes
CREATE INDEX IF NOT EXISTS idx_resource_requests_user ON public.resource_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_requests_status ON public.resource_requests(status);
CREATE INDEX IF NOT EXISTS idx_resource_request_upvotes_request ON public.resource_request_upvotes(resource_request_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity ON public.analytics_events(entity_type, entity_id);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

-- Blog comment indexes
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON public.blog_comments(parent_id);

-- ─────────────────────────────────────────────────────────────
-- SECTION 9: TRIGGERS (updated_at auto-update)
-- ─────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_update_lead_magnets_updated_at ON public.lead_magnets;
CREATE TRIGGER trigger_update_lead_magnets_updated_at
  BEFORE UPDATE ON public.lead_magnets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_resource_requests_updated_at ON public.resource_requests;
CREATE TRIGGER trigger_update_resource_requests_updated_at
  BEFORE UPDATE ON public.resource_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_analytics_daily_updated_at ON public.analytics_daily_summary;
CREATE TRIGGER trigger_update_analytics_daily_updated_at
  BEFORE UPDATE ON public.analytics_daily_summary
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER trigger_update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- SECTION 10: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on all new tables
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnet_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_request_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- ── lead_magnets ──
CREATE POLICY "Public read active lead magnets"
  ON public.lead_magnets FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin manage lead magnets"
  ON public.lead_magnets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  );

-- ── lead_magnet_captures ──
CREATE POLICY "Users read own captures"
  ON public.lead_magnet_captures FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone insert capture"
  ON public.lead_magnet_captures FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admin read all captures"
  ON public.lead_magnet_captures FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  );

-- ── resource_requests ──
CREATE POLICY "Public read resource requests"
  ON public.resource_requests FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users create requests"
  ON public.resource_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users update own requests"
  ON public.resource_requests FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin manage resource requests"
  ON public.resource_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  );

-- ── resource_request_upvotes ──
CREATE POLICY "Public read upvotes"
  ON public.resource_request_upvotes FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users upvote"
  ON public.resource_request_upvotes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users delete own upvote"
  ON public.resource_request_upvotes FOR DELETE
  USING (user_id = auth.uid());

-- ── analytics_events ──
CREATE POLICY "Service role manage analytics"
  ON public.analytics_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated insert analytics"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin read all analytics"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  );

CREATE POLICY "Users read own analytics"
  ON public.analytics_events FOR SELECT
  USING (user_id = auth.uid());

-- ── analytics_daily_summary ──
CREATE POLICY "Admin read analytics summary"
  ON public.analytics_daily_summary FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  );

CREATE POLICY "Service role manage analytics summary"
  ON public.analytics_daily_summary FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── audit_logs ──
CREATE POLICY "Admin read all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  );

CREATE POLICY "Service role manage audit logs"
  ON public.audit_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "System insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── blog_comments ──
CREATE POLICY "Public read approved comments"
  ON public.blog_comments FOR SELECT
  USING (is_approved = TRUE AND is_deleted = FALSE);

CREATE POLICY "Authenticated users add comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users update own comments"
  ON public.blog_comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin manage comments"
  ON public.blog_comments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- SECTION 11: BLOG POSTS RLS UPDATES
-- (blog_posts existed — add new policies if not present)
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_posts'
      AND policyname = 'Admin manage blog posts'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "Admin manage blog posts"
        ON public.blog_posts FOR ALL
        USING (
          EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
        )
        WITH CHECK (
          EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role::text = 'admin')
        )
    $pol$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_posts'
      AND policyname = 'Authors manage own posts'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "Authors manage own posts"
        ON public.blog_posts FOR ALL
        USING (author_id = auth.uid())
        WITH CHECK (author_id = auth.uid())
    $pol$;
  END IF;
END$$;

-- ─────────────────────────────────────────────────────────────
-- SECTION 12: GRANTS TO service_role
-- ─────────────────────────────────────────────────────────────

GRANT ALL ON public.lead_magnets TO service_role;
GRANT ALL ON public.lead_magnet_captures TO service_role;
GRANT ALL ON public.resource_requests TO service_role;
GRANT ALL ON public.resource_request_upvotes TO service_role;
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.analytics_daily_summary TO service_role;
GRANT ALL ON public.audit_logs TO service_role;
GRANT ALL ON public.blog_comments TO service_role;

-- ─────────────────────────────────────────────────────────────
-- SECTION 13: SEED DATA — Lead Magnets
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.lead_magnets (title, slug, description, type, gate_type, is_active)
VALUES
  ('The Ultimate Job Interview Checklist', 'job-interview-checklist', 'A comprehensive checklist to ace any job interview.', 'checklist', 'email', TRUE),
  ('Resume Writing Guide 2026', 'resume-writing-guide-2026', 'Step-by-step guide to craft a modern, ATS-friendly resume.', 'ebook', 'email', TRUE),
  ('Salary Negotiation Playbook', 'salary-negotiation-playbook', 'Proven strategies to negotiate your best salary offer.', 'ebook', 'account', TRUE)
ON CONFLICT (slug) DO NOTHING;
