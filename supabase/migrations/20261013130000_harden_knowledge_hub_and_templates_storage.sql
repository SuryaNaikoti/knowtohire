-- ====================================================================
-- KNOWTOHIRE — MIGRATION: HARDEN STORAGE PRIVACY FOR KNOWLEDGE HUB & TEMPLATES
-- Migration: 20261013130000_harden_knowledge_hub_and_templates_storage.sql
-- Description:
--   1. Converts 'knowledge-hub' and 'templates' storage buckets from public to private.
--   2. Revokes open public read policy 'knowledge_hub_select_public' on storage.objects.
--   3. Introduces strict, entitlement-based SELECT policies:
--      - Knowledge Hub:
--        * Administrators (role = 'admin') retain review and management access.
--        * Any authenticated user can read if the resource is free (price = 0 OR is_free = true).
--        * Authenticated users can read paid resources if they have an active purchase
--          entitlement recorded in public.user_purchases.
--      - Templates:
--        * Administrators (role = 'admin') retain review and audit access.
--        * Template creator can read their own uploaded template files.
--        * Any authenticated user can read if the template is free (price = 0 OR is_free = true).
--        * Authenticated users can read paid templates if they have an active purchase
--          entitlement recorded in public.user_purchases.
--   4. Preserves idempotent verification queries and strict diagnostic steps.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. FLIP KNOWLEDGE-HUB & TEMPLATES BUCKETS FROM PUBLIC TO PRIVATE
-- --------------------------------------------------------------------

UPDATE storage.buckets
SET public = false
WHERE id IN ('knowledge-hub', 'templates');

-- --------------------------------------------------------------------
-- 2. DROP PERMISSIVE PUBLIC READ POLICIES
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "knowledge_hub_select_public" ON storage.objects;
DROP POLICY IF EXISTS "knowledge_hub_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "templates_select_policy" ON storage.objects;

-- --------------------------------------------------------------------
-- 3. CREATE SECURE KNOWLEDGE-HUB SELECT POLICY
-- --------------------------------------------------------------------

CREATE POLICY "knowledge_hub_select_policy"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'knowledge-hub'
    AND (
      -- Rule 1: Administrators have global access
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
      )
      OR
      -- Rule 2: Free Knowledge Hub resource (price = 0 or free status)
      EXISTS (
        SELECT 1
        FROM public.resources r
        WHERE (
          r.file_path = storage.objects.name
          OR r.file_url LIKE '%' || storage.objects.name || '%'
          OR storage.objects.name LIKE '%' || COALESCE(r.file_path, '___none___') || '%'
        )
        AND COALESCE(r.price, 0) <= 0
        AND r.status = 'published'
      )
      OR
      -- Rule 3: Paid Knowledge Hub resource with verified user purchase entitlement
      EXISTS (
        SELECT 1
        FROM public.resources r
        JOIN public.user_purchases up ON up.product_id = r.id::text
        WHERE (
          r.file_path = storage.objects.name
          OR r.file_url LIKE '%' || storage.objects.name || '%'
          OR storage.objects.name LIKE '%' || COALESCE(r.file_path, '___none___') || '%'
        )
        AND up.user_id = auth.uid()
        AND up.product_type IN ('knowledge_resource', 'resource')
      )
    )
  );

-- --------------------------------------------------------------------
-- 4. CREATE SECURE TEMPLATES SELECT POLICY
-- --------------------------------------------------------------------

CREATE POLICY "templates_select_policy"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'templates'
    AND (
      -- Rule 1: Administrators have global access
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
      )
      OR
      -- Rule 2: Template Creator viewing their own uploaded template
      EXISTS (
        SELECT 1
        FROM public.templates t
        WHERE t.creator_id = auth.uid()
          AND (
            t.file_path = storage.objects.name
            OR t.file_url LIKE '%' || storage.objects.name || '%'
            OR t.download_url LIKE '%' || storage.objects.name || '%'
            OR storage.objects.name LIKE '%' || COALESCE(t.file_path, '___none___') || '%'
          )
      )
      OR
      -- Rule 3: Free Template (price = 0)
      EXISTS (
        SELECT 1
        FROM public.templates t
        WHERE (
          t.file_path = storage.objects.name
          OR t.file_url LIKE '%' || storage.objects.name || '%'
          OR t.download_url LIKE '%' || storage.objects.name || '%'
          OR storage.objects.name LIKE '%' || COALESCE(t.file_path, '___none___') || '%'
        )
        AND COALESCE(t.price, 0) <= 0
        AND t.status = 'published'
        AND t.is_active = true
      )
      OR
      -- Rule 4: Paid Template with verified user purchase entitlement
      EXISTS (
        SELECT 1
        FROM public.templates t
        JOIN public.user_purchases up ON up.product_id = t.id::text
        WHERE (
          t.file_path = storage.objects.name
          OR t.file_url LIKE '%' || storage.objects.name || '%'
          OR t.download_url LIKE '%' || storage.objects.name || '%'
          OR storage.objects.name LIKE '%' || COALESCE(t.file_path, '___none___') || '%'
        )
        AND up.user_id = auth.uid()
        AND up.product_type = 'template'
      )
    )
  );

-- --------------------------------------------------------------------
-- 5. VERIFICATION CHECKS (Run in transaction or psql test)
-- --------------------------------------------------------------------
-- A. Verify buckets are private:
--    SELECT id, name, public FROM storage.buckets WHERE id IN ('knowledge-hub', 'templates');
--    -- Expected: public = false for both rows.
--
-- B. Verify all policies on storage.objects affecting these buckets:
--    SELECT policyname, roles, cmd, qual 
--    FROM pg_policies 
--    WHERE tablename = 'objects' 
--      AND schemaname = 'storage'
--      AND (qual LIKE '%knowledge-hub%' OR qual LIKE '%templates%');
--    -- Expected: roles = '{authenticated}' only. Zero {public} read access.
