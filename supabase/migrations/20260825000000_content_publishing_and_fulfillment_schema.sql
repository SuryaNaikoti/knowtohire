-- ====================================================================
-- KNOWTOHIRE — MIGRATION: CONTENT PUBLISHING & FULFILLMENT SCHEMA
-- Migration: 20260825000000_content_publishing_and_fulfillment_schema.sql
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. STORAGE BUCKETS (content, knowledge-hub, templates)
-- --------------------------------------------------------------------

-- A. 'content' bucket: For on-demand content request deliverables
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content',
  'content',
  true,
  52428800, -- 50 MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- B. 'knowledge-hub' bucket: For Knowledge Hub documents, handbooks, e-books
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'knowledge-hub',
  'knowledge-hub',
  true,
  52428800, -- 50 MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- C. 'templates' bucket: For Marketplace resume & compliance templates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'templates',
  'templates',
  true,
  52428800, -- 50 MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- --------------------------------------------------------------------
-- 2. STORAGE ROW LEVEL SECURITY POLICIES
-- --------------------------------------------------------------------
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2.1 Admin Full Access on Content, Knowledge-Hub, and Templates buckets
DROP POLICY IF EXISTS "content_admin_all_objects" ON storage.objects;
CREATE POLICY "content_admin_all_objects"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id IN ('content', 'knowledge-hub', 'templates') AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    bucket_id IN ('content', 'knowledge-hub', 'templates') AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2.2 Public / Authenticated Read on Published Knowledge Hub & Templates
DROP POLICY IF EXISTS "knowledge_hub_select_public" ON storage.objects;
CREATE POLICY "knowledge_hub_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id IN ('knowledge-hub', 'templates'));

-- 2.3 Content Deliverables Read Access: Candidate owning the request or Admin
DROP POLICY IF EXISTS "content_deliverables_select_policy" ON storage.objects;
CREATE POLICY "content_deliverables_select_policy"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'content'
  );

-- --------------------------------------------------------------------
-- 3. SCHEMA ENHANCEMENTS: public.resource_requests
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Technology',
  type TEXT NOT NULL DEFAULT 'Study Material',
  preferred_format TEXT DEFAULT 'PDF',
  additional_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  upvote_count INTEGER NOT NULL DEFAULT 0,
  admin_notes TEXT,
  completed_resource_id UUID,
  deliverable_title TEXT,
  deliverable_description TEXT,
  deliverable_url TEXT,
  deliverable_format TEXT,
  deliverable_size TEXT,
  deliverable_name TEXT,
  storage_path TEXT,
  storage_bucket TEXT DEFAULT 'content',
  fulfilled_by_resource_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if table was already present
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Technology';
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Study Material';
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS preferred_format TEXT DEFAULT 'PDF';
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS additional_requirements TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS completed_resource_id UUID;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS deliverable_title TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS deliverable_description TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS deliverable_url TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS deliverable_format TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS deliverable_size TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS deliverable_name TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'content';
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS fulfilled_by_resource_id UUID;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_resource_requests_user_id ON public.resource_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_requests_status ON public.resource_requests(status);
CREATE INDEX IF NOT EXISTS idx_resource_requests_created_at ON public.resource_requests(created_at DESC);

-- --------------------------------------------------------------------
-- 4. SCHEMA ENHANCEMENTS: public.resources (Knowledge Hub)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Environmental & ESG',
  format TEXT NOT NULL DEFAULT 'PDF',
  file_url TEXT,
  file_size TEXT,
  file_name TEXT,
  file_path TEXT,
  mime_type TEXT,
  storage_bucket TEXT DEFAULT 'knowledge-hub',
  cover_url TEXT,
  author TEXT DEFAULT 'KnowToHire Regulatory Team',
  page_count INTEGER DEFAULT 48,
  rating NUMERIC(3,2) DEFAULT 4.80,
  downloads_count INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_from_request_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'knowledge-hub';
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS created_from_request_id UUID;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);

-- --------------------------------------------------------------------
-- 5. SCHEMA ENHANCEMENTS: public.templates (Template Marketplace)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Professional Documents',
  formats TEXT[] DEFAULT ARRAY['DOCX', 'PDF'],
  cover_url TEXT,
  file_url TEXT,
  download_url TEXT,
  file_name TEXT,
  file_path TEXT,
  file_size TEXT,
  mime_type TEXT,
  storage_bucket TEXT DEFAULT 'templates',
  rating NUMERIC(3,2) DEFAULT 4.90,
  downloads_count INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'templates';
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_status ON public.templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON public.templates(created_at DESC);

-- --------------------------------------------------------------------
-- 6. RLS POLICIES FOR TABLES
-- --------------------------------------------------------------------
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- 6.1 Resource Requests Policies
DROP POLICY IF EXISTS "resource_requests_candidate_select" ON public.resource_requests;
CREATE POLICY "resource_requests_candidate_select"
  ON public.resource_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "resource_requests_candidate_insert" ON public.resource_requests;
CREATE POLICY "resource_requests_candidate_insert"
  ON public.resource_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "resource_requests_admin_all" ON public.resource_requests;
CREATE POLICY "resource_requests_admin_all"
  ON public.resource_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6.2 Resources (Knowledge Hub) Policies
DROP POLICY IF EXISTS "resources_public_select" ON public.resources;
CREATE POLICY "resources_public_select"
  ON public.resources
  FOR SELECT
  TO public
  USING (
    deleted_at IS NULL AND (
      status = 'published' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "resources_admin_all" ON public.resources;
CREATE POLICY "resources_admin_all"
  ON public.resources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6.3 Templates Policies
DROP POLICY IF EXISTS "templates_public_select" ON public.templates;
CREATE POLICY "templates_public_select"
  ON public.templates
  FOR SELECT
  TO public
  USING (
    deleted_at IS NULL AND (
      (status = 'published' AND is_active = true) OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "templates_admin_all" ON public.templates;
CREATE POLICY "templates_admin_all"
  ON public.templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
