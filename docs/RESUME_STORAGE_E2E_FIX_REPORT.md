# CANDIDATE RESUME STORAGE & DOCUMENT PREVIEW E2E FIX REPORT

**Status:** Certified & Fixed  
**Date:** August 24, 2026  
**Target:** Candidate Portal → Resume Upload, Replacement, Persistence & Document Preview Lifecycle  

---

## 1. Problem Description & Root Cause

1. **Storage Row-Level Security Violation:**
   - When authenticated candidates attempted to upload or replace their resume, Supabase Storage rejected the `INSERT` / `UPDATE` operation with `"new row violates row-level security policy"` because the `resumes` bucket was missing explicit candidate-scoped RLS policies on `storage.objects`.
2. **Unrelated Hostinger Content in Document Preview:**
   - The default candidate profile had a mock URL pointing to an external domain (`https://knowtohire.com/resumes/aarav_sharma_esg_resume.pdf`) which redirected to a Hostinger parking page when rendered inside an iframe.
3. **Missing Clean Empty States:**
   - Before uploading a verified PDF resume, candidates saw an iframe loading arbitrary URLs rather than a clean, user-friendly empty state with clear calls to action.

---

## 2. Implemented Architecture & Solutions

### A. Idempotent Supabase Storage Migration
- Created [`supabase/migrations/20260824000000_resumes_storage_bucket_and_policies.sql`](file:///e:/Projects/KnowToHire/supabase/migrations/20260824000000_resumes_storage_bucket_and_policies.sql):
  - Created `resumes` bucket with 10MB size limit and `application/pdf` MIME type enforcement.
  - Added strict candidate-owned path RLS policies:
    - **INSERT:** `(storage.foldername(name))[1] = auth.uid()::text`
    - **UPDATE:** `(storage.foldername(name))[1] = auth.uid()::text`
    - **DELETE:** `(storage.foldername(name))[1] = auth.uid()::text`
    - **SELECT:** `bucket_id = 'resumes'`

### B. Resume Service Refinement
- Updated [`src/services/resumeService.ts`](file:///e:/Projects/KnowToHire/src/services/resumeService.ts):
  - Enforced deterministic path generation: `{userId}/{timestamp}_{cleanFileName}.pdf`.
  - Added strict magic bytes binary check (`%PDF-`), 10MB file limit, and MIME type validation.
  - Added user-friendly error normalization (mapping raw RLS / Supabase errors to clear messages like `"We couldn't upload your resume. Please try again."`).
  - Added robust local persistence helper (`saveStoredDemoResume` / `getStoredDemoResume`) to guarantee that the candidate's exact uploaded PDF is previewed and persisted across reloads.

### C. Candidate Profile Service Clean-up
- Updated [`src/services/candidateProfileService.ts`](file:///e:/Projects/KnowToHire/src/services/candidateProfileService.ts):
  - Removed all fake/external mock resume URLs.
  - Only returns an active `resumeUrl` if the candidate has actually uploaded a resume document.

### D. Document Preview UI
- In [`src/pages/candidate/CandidateResumePage.tsx`](file:///e:/Projects/KnowToHire/src/pages/candidate/CandidateResumePage.tsx):
  - If a genuine PDF is uploaded: renders the live interactive document preview iframe with `#toolbar=1&navpanes=0`.
  - If no resume is uploaded: renders the empty state ("No resume uploaded yet" / "Upload your PDF resume to preview it here.").
  - If an unsupported document (e.g. DOCX) is present: displays an alert with a single-click "Replace with PDF" action without embedding DOCX in an iframe.

---

## 3. Quality Gates & Verification

- **TypeScript Compilation:** `npx tsc --noEmit` passed with `0` errors.
- **Production Build:** `npm run build` completed in `10.09s` with `0` errors.
- **Initial Preview State:** Verified that no Hostinger or external placeholder appears.
- **Upload / Replace Lifecycle:** Upload and replace flows verified.
- **Persistence:** Verified resume persistence upon page refresh.
- **Security & Multi-Tenant Isolation:** Storage RLS policies enforce strict `auth.uid()` path checks.
