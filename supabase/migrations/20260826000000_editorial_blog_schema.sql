-- ============================================================================
-- Migration: 20260826000000_editorial_blog_schema.sql
-- Description: Reconciles public.blog_posts table with RLS policies, indexes, and full text search.
-- Non-destructive: preserves existing legacy table and all rows while ensuring all required columns exist.
-- ============================================================================

-- 1. Create table if it does not exist at all
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'KnowToHire Editorial Team',
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'Environmental Policy',
  cover_url TEXT,
  read_time TEXT DEFAULT '5 min read',
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Non-destructive reconciliation of columns for pre-existing legacy table
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'KnowToHire Editorial Team';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Environmental Policy';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5 min read';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Populate missing values for legacy rows safely (only where NULL)
UPDATE public.blog_posts 
SET status = 'published' 
WHERE status IS NULL;

UPDATE public.blog_posts 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE public.blog_posts 
SET author_name = 'KnowToHire Editorial Team' 
WHERE author_name IS NULL;

UPDATE public.blog_posts 
SET category = 'Environmental Policy' 
WHERE category IS NULL;

UPDATE public.blog_posts 
SET read_time = '5 min read' 
WHERE read_time IS NULL;

-- 4. Status Check Constraint (idempotent)
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_status_check 
  CHECK (status IN ('draft', 'published', 'archived'));

-- 5. Indices for rapid querying and filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON public.blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at ON public.blog_posts(deleted_at);

-- 6. Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 7. Public Read Policy: Anyone can read non-deleted published active blog posts, while admins see all
DROP POLICY IF EXISTS "blog_posts_public_select" ON public.blog_posts;
CREATE POLICY "blog_posts_public_select"
  ON public.blog_posts
  FOR SELECT
  TO public
  USING (
    deleted_at IS NULL AND (
      (status = 'published' AND is_active = true) OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- 8. Admin Management Policy: Admins have full access to create, update, and soft-delete
DROP POLICY IF EXISTS "blog_posts_admin_all" ON public.blog_posts;
CREATE POLICY "blog_posts_admin_all"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
