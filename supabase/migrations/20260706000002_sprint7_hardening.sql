-- ============================================================
-- Sprint 7 Hardening: Security & Performance Fixes
-- Migration: 20260706000002_sprint7_hardening.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION 1: Increment RPC for lead_magnets download_count
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_lead_magnet_download_count(magnet_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.lead_magnets
  SET download_count = download_count + 1
  WHERE id = magnet_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_lead_magnet_download_count(UUID) TO anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────
-- SECTION 2: Increment RPC for blog view_count
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_blog_post_view_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_blog_post_view_count(UUID) TO anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────
-- SECTION 3: Increment RPC for resource_request upvote_count
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_resource_request_upvote(request_id UUID, delta INTEGER DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.resource_requests
  SET upvote_count = GREATEST(0, upvote_count + delta)
  WHERE id = request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_resource_request_upvote(UUID, INTEGER) TO authenticated, service_role;

-- ─────────────────────────────────────────────────────────────
-- SECTION 4: Add missing blog_posts tag column
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Backfill category from category_id join (where possible)
-- (category text column is denormalized for query simplicity)

-- ─────────────────────────────────────────────────────────────
-- SECTION 5: Performance — composite indexes
-- ─────────────────────────────────────────────────────────────

-- Blog performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_deleted
  ON public.blog_posts(published_at DESC, deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON public.blog_posts(category)
  WHERE category IS NOT NULL;

-- Analytics write performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_session
  ON public.analytics_events(session_id)
  WHERE session_id IS NOT NULL;

-- Lead magnets performance
CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_created
  ON public.lead_magnet_captures(created_at DESC);

-- Resource requests performance
CREATE INDEX IF NOT EXISTS idx_resource_requests_upvotes
  ON public.resource_requests(upvote_count DESC);

-- ─────────────────────────────────────────────────────────────
-- SECTION 6: Resource request upvote trigger
-- (Auto-update upvote_count on insert/delete)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_resource_request_upvote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.resource_requests
    SET upvote_count = upvote_count + 1
    WHERE id = NEW.resource_request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.resource_requests
    SET upvote_count = GREATEST(0, upvote_count - 1)
    WHERE id = OLD.resource_request_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_upvote_count ON public.resource_request_upvotes;
CREATE TRIGGER trigger_sync_upvote_count
  AFTER INSERT OR DELETE ON public.resource_request_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.sync_resource_request_upvote_count();

-- ─────────────────────────────────────────────────────────────
-- SECTION 7: Blog post search vector trigger
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_blog_post_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_blog_post_search_vector ON public.blog_posts;
CREATE TRIGGER trigger_blog_post_search_vector
  BEFORE INSERT OR UPDATE OF title, excerpt, category ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_post_search_vector();

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_blog_posts_search_vector
  ON public.blog_posts USING GIN(search_vector);
