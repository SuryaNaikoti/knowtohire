# CANDIDATE APPLICATION TO EMPLOYER PORTAL — LIFECYCLE FIX REPORT

**Status:** Certified & Fixed  
**Date:** August 24, 2026  
**Target:** Candidate Job Application Submission -> Employer ATS Pipeline & Requisition View  

---

## 1. Problem Description & Root Cause

A critical production bug prevented candidate applications submitted via the Candidate Portal from appearing in the corresponding Employer Portal / ATS Pipeline.

### Root Causes Identified:
1. **Silent Fallback to Local Isolation:**
   - When database inserts faced constraint or RLS restrictions in demo/unlinked auth contexts, `applicationService.applyToJob` created mock demo IDs saved strictly to an isolated candidate storage key (`kth_candidate_applications_cache`) which the employer portal never queried.
2. **Missing Company Scoping on Employer Ingestion:**
   - `getCompanyApplicants` queried `job_applications` without explicitly filtering by the employer's `company_id`.
3. **Ghost Application Leakage:**
   - `getMyApplications` previously fell back to querying all existing database applications if none matched the current candidate ID, masking missing submissions.
4. **Duplicate Lock-Out:**
   - Duplicate checks were reading non-synchronized local cache keys, causing failed submissions to permanently block re-submission attempts.

---

## 2. Implemented Architecture & Solutions

### Fixed Files:
- [`src/services/applicationService.ts`](file:///e:/Projects/KnowToHire/src/services/applicationService.ts):
  - **Shared Store Synchronization:** Standardized unified store (`kth_demo_applications`) across both candidate and employer workflows.
  - **Company-ID Scoped Queries:** `getCompanyApplicants` and `getJobApplicants` explicitly scope records by `company_id` and `job_id`.
  - **Clean Application Ingestion:** Removed false fallbacks that loaded unrelated applications into candidate views.
  - **Proper Error Propagation:** Live Supabase errors are properly normalized and returned when not in demo mode.
- [`src/services/jobService.ts`](file:///e:/Projects/KnowToHire/src/services/jobService.ts):
  - **Employer Job Scoping:** Scoped `getEmployerJobs` with `authCtx.companyId` to guarantee tenant isolation between employers.

---

## 3. Verification & Validation

- **TypeScript Compilation:** `npx tsc --noEmit` exited with status `0` (0 errors).
- **Production Build:** `npm run build` completed successfully.
- **Candidate Submission Verification:** Candidate applies to a job -> application record created with full snapshot metadata.
- **Employer Visibility Verification:** Employer logging in views the application under the active pipeline and candidate applicant listings for that requisition.
- **Data Isolation:** Candidates only see their own applications; employers only see applications targeted to their company's requisitions.
