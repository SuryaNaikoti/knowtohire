-- ====================================================================
-- KNOWTOHIRE — MIGRATION: HARDEN STORAGE ROW LEVEL SECURITY FOR RESUMES & CONTENT
-- Migration: 20261013120000_harden_storage_privacy_and_access_control.sql
-- Description:
--   1. Converts 'resumes' and 'content' storage buckets from public to private.
--   2. Revokes open public read policies on storage.objects for 'resumes' and 'content'.
--   3. Introduces strict, authoritative SELECT policies:
--      - Resumes:
--        * Administrators (role = 'admin') retain audit access.
--        * Candidate owners can access only their own resume objects.
--        * Employers can access candidate resumes if the candidate has submitted
--          an application to a job posted by the employer's company (public.job_applications).
--        * Employers can access candidate resumes if the candidate profile is strictly
--          discoverable (public.candidate_profiles.is_discoverable = true) and active (is_active = true).
--      - Content Deliverables:
--        * Administrators (role = 'admin') retain fulfillment and review access.
--        * The requesting user (public.resource_requests.user_id) can access deliverables
--          only if the deliverable is free (price_inr <= 0) or verified as paid (is_paid = true).
--   4. Preserves public read policies for 'knowledge-hub' and 'templates' without modification.
--   5. Provides idempotent verification and strict diagnostic & repair instructions that
--      never weaken access controls or grant blanket authenticated access.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. FLIP RESUMES & CONTENT BUCKETS FROM PUBLIC TO PRIVATE
-- --------------------------------------------------------------------

UPDATE storage.buckets
SET public = false
WHERE id IN ('resumes', 'content');

-- --------------------------------------------------------------------
-- 2. DROP PERMISSIVE PUBLIC POLICIES ON RESUMES & CONTENT OBJECTS
-- --------------------------------------------------------------------

-- Drop legacy broad read policy on resumes and unauthenticated/unrestricted policies
DROP POLICY IF EXISTS "resumes_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "resumes_select_own" ON storage.objects;
DROP POLICY IF EXISTS "resumes_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "resumes_select_employer" ON storage.objects;
DROP POLICY IF EXISTS "resumes_select_public" ON storage.objects;

-- Drop legacy unrestricted insert policy on resumes (preserving resumes_insert_own)
DROP POLICY IF EXISTS "resumes_insert_authenticated" ON storage.objects;

-- Ensure verified owner-scoped upload policy exists (candidate folder check)
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

-- Drop legacy broad read policy on content deliverables
DROP POLICY IF EXISTS "content_deliverables_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "content_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "content_select_public" ON storage.objects;

-- --------------------------------------------------------------------
-- 3. CREATE SECURE, AUTHORITATIVE RESUMES SELECT POLICY
-- --------------------------------------------------------------------

-- Candidate folder conventions supported:
--  - "{candidate_id}/{filename}.pdf" -> (storage.foldername(name))[1] = candidate_id
--  - "resumes/{candidate_id}/{filename}.pdf" -> (storage.foldername(name))[2] = candidate_id
--  - Specific storage object name matching for legacy records

CREATE POLICY "resumes_select_policy"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (
      -- Rule 1: Administrators have global audit and inspection privileges
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
      )
      OR
      -- Rule 2: Candidate owns the resume file
      (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (
          (storage.foldername(name))[1] = 'resumes'
          AND (storage.foldername(name))[2] = auth.uid()::text
        )
      )
      OR
      -- Rule 3: Employer viewing an applicant's resume
      -- Checks public.job_applications linked to jobs for the employer's company
      EXISTS (
        SELECT 1
        FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        JOIN public.employer_profiles ep ON ep.company_id = j.company_id
        WHERE ep.profile_id = auth.uid()
          AND (
            ja.candidate_id::text = (storage.foldername(storage.objects.name))[1]
            OR (
              (storage.foldername(storage.objects.name))[1] = 'resumes'
              AND ja.candidate_id::text = (storage.foldername(storage.objects.name))[2]
            )
            OR ja.resume_url LIKE '%' || storage.objects.name || '%'
          )
      )
      OR
      -- Rule 4: Employer viewing an explicitly discoverable and active candidate's resume
      -- Requires strict boolean true checks (no default or null fallback)
      EXISTS (
        SELECT 1
        FROM public.employer_profiles ep
        JOIN public.candidate_profiles cp ON (
          cp.profile_id::text = (storage.foldername(storage.objects.name))[1]
          OR (
            (storage.foldername(storage.objects.name))[1] = 'resumes'
            AND cp.profile_id::text = (storage.foldername(storage.objects.name))[2]
          )
          OR cp.resume_url LIKE '%' || storage.objects.name || '%'
        )
        WHERE ep.profile_id = auth.uid()
          AND cp.is_discoverable = true
          AND cp.is_active = true
      )
    )
  );

-- --------------------------------------------------------------------
-- 4. CREATE SECURE, AUTHORITATIVE CONTENT DELIVERABLES SELECT POLICY
-- --------------------------------------------------------------------

CREATE POLICY "content_deliverables_select_policy"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'content'
    AND (
      -- Rule 1: Administrators have access to review and fulfill deliverables
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
      )
      OR
      -- Rule 2: The requesting user who owns the resource request,
      -- provided the request is free or payment has been verified (is_paid = true)
      EXISTS (
        SELECT 1
        FROM public.resource_requests rr
        WHERE rr.user_id = auth.uid()
          AND (
            rr.storage_path = storage.objects.name
            OR rr.deliverable_url LIKE '%' || storage.objects.name || '%'
            OR storage.objects.name LIKE '%' || COALESCE(rr.storage_path, '___none___') || '%'
          )
          AND (
            COALESCE(rr.price_inr, 0) <= 0
            OR rr.is_paid = true
          )
      )
    )
  );

-- --------------------------------------------------------------------
-- 5. VERIFICATION CHECKS (Run in transaction or psql test)
-- --------------------------------------------------------------------
-- The following queries verify the correctness of the migration:
--
-- A. Verify buckets are private:
--    SELECT id, name, public FROM storage.buckets WHERE id IN ('resumes', 'content');
--    -- Expected: public = false for both rows.
--
-- B. Verify all policies on storage.objects affecting 'resumes' or 'content':
--    SELECT policyname, roles, cmd, qual, with_check 
--    FROM pg_policies 
--    WHERE tablename = 'objects' 
--      AND schemaname = 'storage'
--      AND (
--        qual LIKE '%resumes%' 
--        OR qual LIKE '%content%'
--        OR with_check LIKE '%resumes%'
--        OR with_check LIKE '%content%'
--      );
--    -- Expected: 
--    --   No policy with cmd = 'SELECT' granting access to {public} or {anon} on resumes or content.
--    --   Only 'resumes_select_policy' and 'content_deliverables_select_policy' exist for SELECT on these buckets.
--    --   Write policies (insert, update, delete) remain scoped strictly to authenticated owners.
--
-- --------------------------------------------------------------------
-- 6. AUTHORIZATION INCIDENT DIAGNOSTIC & REMEDIATION PROCEDURE
-- --------------------------------------------------------------------
-- CRITICAL POLICY: NEVER execute blanket recovery SQL such as:
--   UPDATE storage.buckets SET public = true;
--   CREATE POLICY ... USING (bucket_id = 'resumes');  -- FORBIDDEN
--
-- If an authorized user encounters an unexpected download/preview denial,
-- follow these diagnostic steps to identify and fix the specific root cause:
--
-- Step 1: Diagnose Resume Access Denials
--   a. Check if the authenticated user has an active employer profile:
--      SELECT profile_id, company_id FROM public.employer_profiles WHERE profile_id = '<USER_UUID>';
--   b. Check if the target candidate applied to any job under the employer's company:
--      SELECT ja.id, ja.candidate_id, ja.job_id, j.company_id
--      FROM public.job_applications ja
--      JOIN public.jobs j ON j.id = ja.job_id
--      WHERE ja.candidate_id = '<TARGET_CANDIDATE_UUID>'
--        AND j.company_id = '<EMPLOYER_COMPANY_UUID>';
--   c. If candidate is NOT an applicant, verify their discoverability and active status:
--      SELECT profile_id, is_discoverable, is_active 
--      FROM public.candidate_profiles 
--      WHERE profile_id = '<TARGET_CANDIDATE_UUID>';
--      --> If is_discoverable or is_active is false, the denial is intentional and valid.
--   d. Check object naming format against path patterns:
--      SELECT name FROM storage.objects WHERE bucket_id = 'resumes' AND name LIKE '%<TARGET_CANDIDATE_UUID>%';
--
-- Step 2: Diagnose Deliverable Access Denials
--   a. Check the resource request record and payment status:
--      SELECT id, user_id, price_inr, is_paid, storage_path, deliverable_url 
--      FROM public.resource_requests 
--      WHERE id = '<REQUEST_UUID>';
--      --> If price_inr > 0 and is_paid is false, the denial is intentional and valid.
--   b. If an authoritative paid order exists in payment_orders but is_paid was not flipped:
--      Execute atomic payment reconciliation requiring verified successful payment,
--      matching user identity, matching product type, non-null payment reference, and exact price equality:
--      UPDATE public.resource_requests rr
--      SET is_paid = true,
--          paid_at = po.paid_at,
--          payment_id = po.provider_payment_id
--      FROM public.payment_orders po
--      WHERE rr.id = '<REQUEST_UUID>'::uuid
--        AND po.product_type = 'content_request'
--        AND po.product_id = rr.id::text
--        AND po.user_id = rr.user_id
--        AND po.status = 'paid'
--        AND po.is_paid = true
--        AND po.provider_payment_id IS NOT NULL
--        AND po.amount_inr = rr.price_inr
--        AND rr.is_paid = false;
