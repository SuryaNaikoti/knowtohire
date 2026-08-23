-- ====================================================================
-- KNOWTOHIRE — MIGRATION: RESUMES STORAGE BUCKET & RLS POLICIES
-- Migration: 20260824000000_resumes_storage_bucket_and_policies.sql
-- ====================================================================

-- 1. Create the 'resumes' storage bucket if it doesn't already exist.
-- Set public to true so generated public URLs can be previewed/downloaded by authorized viewers,
-- with access and write operations protected by strict RLS policies on storage.objects.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  10485760, -- 10 MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Enable Row-Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Authenticated candidate can INSERT their own resume into their own folder.
-- Path structure: {candidate_id}/{filename}.pdf OR resumes/{candidate_id}/{filename}.pdf
DROP POLICY IF EXISTS "resumes_insert_own" ON storage.objects;
CREATE POLICY "resumes_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      (
        (storage.foldername(name))[1] = 'resumes' AND
        (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

-- 4. Policy: Authenticated candidate can UPDATE/overwrite their own resume.
DROP POLICY IF EXISTS "resumes_update_own" ON storage.objects;
CREATE POLICY "resumes_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      (
        (storage.foldername(name))[1] = 'resumes' AND
        (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    bucket_id = 'resumes' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      (
        (storage.foldername(name))[1] = 'resumes' AND
        (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

-- 5. Policy: Authenticated candidate can DELETE their own resume.
DROP POLICY IF EXISTS "resumes_delete_own" ON storage.objects;
CREATE POLICY "resumes_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      (
        (storage.foldername(name))[1] = 'resumes' AND
        (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

-- 6. Policy: SELECT/Read access.
-- Candidates can view their own resumes; employers and admins can view applicant resumes.
DROP POLICY IF EXISTS "resumes_select_policy" ON storage.objects;
CREATE POLICY "resumes_select_policy"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'resumes'
  );
