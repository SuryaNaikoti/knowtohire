# KNOWTOHIRE — MODULE 02: JOB PORTAL & RECRUITMENT
## CANDIDATE APPLICATIONS & SAVED JOBS INTEGRATION SPECIFICATION

**Document Version:** 1.0.0  
**Module:** Module 02 — Task 05 (Candidate Applications & Saved Jobs Integration)  
**Integrated Candidate Pages & Components:**
- [`/candidate/jobs`](file:///e:/Projects/KnowToHire/src/pages/candidate/CandidateJobsPage.tsx) — Candidate Job Discovery Feed & Real-time Bookmarking
- [`/candidate/jobs/:id`](file:///e:/Projects/KnowToHire/src/pages/candidate/CandidateJobDetailsPage.tsx) — Candidate Job Details with Dynamic Apply / Already Applied states
- [`/candidate/saved-jobs`](file:///e:/Projects/KnowToHire/src/pages/candidate/CandidateSavedJobsPage.tsx) — Candidate Bookmarked Opportunities
- [`/candidate/applications`](file:///e:/Projects/KnowToHire/src/pages/candidate/CandidateApplicationsPage.tsx) — Candidate Application Pipeline & Stage Summaries
- [`/candidate/applications/:id`](file:///e:/Projects/KnowToHire/src/pages/candidate/CandidateApplicationDetailsPage.tsx) — Application Stage Tracker, Status History, Scheduled Interviews & Withdrawal Workflow
- [`/candidate`](file:///e:/Projects/KnowToHire/src/pages/candidate/CandidateDashboardPage.tsx) — Candidate Overview with Live KPIs and Active Application Banner
- [`ApplyModal`](file:///e:/Projects/KnowToHire/src/components/candidate/ApplyModal.tsx) — One-click Application Modal with Snapshotting and Duplicate Prevention
- [`ApplicationCard`](file:///e:/Projects/KnowToHire/src/components/candidate/ApplicationCard.tsx) — Real-time Application Card with Stage Badges  
**Backend Services Used:**
- [`src/services/jobService.ts`](file:///e:/Projects/KnowToHire/src/services/jobService.ts)
- [`src/services/applicationService.ts`](file:///e:/Projects/KnowToHire/src/services/applicationService.ts)
- [`src/services/savedJobService.ts`](file:///e:/Projects/KnowToHire/src/services/savedJobService.ts)
- [`src/services/interviewService.ts`](file:///e:/Projects/KnowToHire/src/services/interviewService.ts)  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

Task 05 integrates the entire Candidate job search, bookmarking, application submission, application tracking, interview visibility, and application withdrawal workflows with Supabase. All mock data dependencies in the Candidate portal have been replaced with live PostgreSQL database queries mediated by `applicationService`, `savedJobService`, and `jobService`.

---

## 2. Workflows & Features

### 2.1 Job Application Workflow (`ApplyModal`)
1. **Prerequisites & Eligibility:** Candidate must have an active session with role `'candidate'`. The target job must have `status = 'published'`.
2. **Snapshot Creation:** Point-in-time snapshot of candidate's profile (`full_name`, `email`, `phone`, `headline`, `skills`, `experience`, `education`) is created at submission time and persisted into `job_applications.candidate_snapshot` so subsequent profile edits do not alter historical records.
3. **Database Insertion:** Records candidate application in `job_applications` with initial `stage = 'new'`.
4. **Audit Trail Logging:** PostgreSQL trigger `trigger_log_application_status` automatically records the initial stage entry in `application_status_history`.
5. **Success Experience:** Shows confirmation dialogue with a direct CTA to navigate to `/candidate/applications/:id`.

### 2.2 Duplicate Application Prevention
- **Frontend Prevention:** Before rendering the Apply button, `applicationService.hasCandidateApplied(jobId)` checks if a submission already exists. If true, the button is replaced with "Already Applied (View)" linking directly to the application tracker.
- **Database Unique Constraint:** `job_applications` enforces `UNIQUE (job_id, candidate_id)`. Any concurrent race condition is trapped and converted into a normalized `DUPLICATE_APPLICATION` service error.

### 2.3 Saved Jobs & Bookmarking
- **Toggle Action:** Candidates click the bookmark icon on any `JobCard` or details page. Calls `savedJobService.saveJob(jobId)` or `savedJobService.unsaveJob(jobId)`.
- **Candidate Saved Jobs (`/candidate/saved-jobs`):** Displays all bookmarked requisitions. Unsaving removes the item from the list with optimistic UI updates.
- **Unique Constraint:** `saved_jobs` table enforces `UNIQUE (candidate_id, job_id)`.

### 2.4 Application Tracking (`/candidate/applications` & `/candidate/applications/:id`)
- **Stage Badges:** Real database stage mapping:
  - `new` → `Applied` (Indigo)
  - `screening` → `Under Review` (Cyan)
  - `shortlisted` → `Shortlisted` (Emerald)
  - `interview` → `Interview Round` (Indigo)
  - `offer` → `Offer Extended` (Emerald)
  - `hired` → `Hired` (Emerald)
  - `rejected` → `Archived` (Slate)
  - `withdrawn` → `Withdrawn` (Slate)
- **Lifecycle Timeline:** Built dynamically from `application_status_history` displaying exact stage transitions and timestamps.
- **Scheduled Interviews:** Queries `interviews` table for scheduled technical or HR rounds and displays date, time, and meeting link.

### 2.5 Application Withdrawal Workflow
- Candidate clicks "Withdraw Application" from `/candidate/applications/:id`.
- Requires explicit confirmation via modal.
- Calls `applicationService.withdrawApplication(applicationId)` setting `stage = 'withdrawn'` and `withdrawn_at = NOW()`.
- RLS policy `job_applications_update_candidate` permits candidates to update their own applications *only* when changing stage to `withdrawn`.

---

## 3. Security & Row Level Security (RLS) Boundaries

| Entity | RLS Policy | Security Boundary |
| :--- | :--- | :--- |
| `saved_jobs` | `saved_jobs_select_candidate` / `saved_jobs_insert_candidate` / `saved_jobs_delete_candidate` | Candidates can ONLY select, insert, and delete their own bookmarks (`candidate_id = auth.uid()`). |
| `job_applications` | `job_applications_select_candidate` / `job_applications_insert_candidate` / `job_applications_update_candidate` | Candidates can ONLY view their own applications, submit for themselves, and mutate stage exclusively to `'withdrawn'`. |
| `application_status_history` | `history_select_candidate` | Candidates can view audit logs only for applications belonging to their profile. |
| `interviews` | `interviews_select_candidate` | Candidates can view interview rounds only where `candidate_id = auth.uid()`. |

---

## 4. Next Task

- **Module 02 — Task 06:** Employer Job Lifecycle Management (`/employer/jobs`, `/employer/jobs/new`, `/employer/jobs/:id/edit`, and Draft / Publish / Pause / Close / Reopen state machine transitions).
