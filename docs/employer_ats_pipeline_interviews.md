# KNOWTOHIRE — MODULE 02: JOB PORTAL & RECRUITMENT
## EMPLOYER ATS PIPELINE, APPLICANTS & INTERVIEW SCHEDULING SPECIFICATION

**Document Version:** 1.0.0  
**Module:** Module 02 — Task 07 (Employer Applicants, ATS Pipeline & Interview Scheduling)  
**Integrated Employer Pages & Components:**
- [`/employer/jobs/:id/applicants`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerJobApplicantsPage.tsx) — Enterprise Applicants Table & Mobile Card Stack with Live Filters
- [`/employer/pipeline`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerPipelinePage.tsx) — 6-Stage ATS Kanban Board with Requisition Filtering
- [`/employer/interviews`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerInterviewsPage.tsx) — Interview Operations Hub (Scheduled, Completed, Cancelled)
- [`/employer/saved-candidates`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerSavedCandidatesPage.tsx) — Enterprise Talent Bench
- [`CandidateQuickView`](file:///e:/Projects/KnowToHire/src/components/employer/CandidateQuickView.tsx) — Slide-over Drawer for Candidate Inspection, Stage Transition, Recruiter Notes & Ratings
- [`ScheduleInterviewModal`](file:///e:/Projects/KnowToHire/src/components/employer/ScheduleInterviewModal.tsx) — Comprehensive Interview Scheduling Modal
- [`CandidatePipeline`](file:///e:/Projects/KnowToHire/src/components/employer/CandidatePipeline.tsx) & [`CandidatePipelineCard`](file:///e:/Projects/KnowToHire/src/components/employer/CandidatePipelineCard.tsx) — ATS Pipeline Kanban Components  
**Backend Services Used:**
- [`src/services/applicationService.ts`](file:///e:/Projects/KnowToHire/src/services/applicationService.ts)
- [`src/services/interviewService.ts`](file:///e:/Projects/KnowToHire/src/services/interviewService.ts)
- [`src/services/savedCandidateService.ts`](file:///e:/Projects/KnowToHire/src/services/savedCandidateService.ts)
- [`src/services/jobService.ts`](file:///e:/Projects/KnowToHire/src/services/jobService.ts)  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

Task 07 delivers the end-to-end recruiter workflow for applicant screening, Kanban pipeline stage advancement, private evaluation notes, star ratings, interview scheduling, and talent bookmarking. All operations are backed by Supabase with multi-tenant RLS isolation and automated audit logging.

---

## 2. Implemented Workflows & Features

### 2.1 Requisition Applicants Table (`/employer/jobs/:id/applicants`)
- **Live Applicants Query:** Calls `applicationService.getJobApplicants(jobId, { stage, page, pageSize })`.
- **Search & Stage Filters:** Real-time search across candidate names, headlines, and stage filters (`new`, `screening`, `shortlisted`, `interview`, `offer`, `hired`, `rejected`).
- **Responsive Layout:** Enterprise data table on desktop with candidate avatar initials, location, stage badges, and recruiter ratings; responsive card stack on mobile.
- **Drawer Interaction:** Clicking any row or action opens `CandidateQuickView`.

### 2.2 ATS Kanban Pipeline (`/employer/pipeline`)
- **Multi-Requisition Query:** Loads all applications belonging to the employer's organization via `applicationService.getCompanyApplicants()`.
- **Active Kanban Columns (6 Stages):**
  1. `NEW` (`new`): Newly submitted candidate applications.
  2. `SCREENING` (`screening`): Under initial review.
  3. `SHORTLISTED` (`shortlisted`): Selected for hiring manager review.
  4. `INTERVIEW` (`interview`): Scheduled or conducting assessment rounds.
  5. `OFFER` (`offer`): Offer extended.
  6. `HIRED` (`hired`): Offer accepted and hired.
- **Archive Columns:** Toggle to view `Not Selected` (`rejected`) and `Withdrawn` (`withdrawn`).
- **Stage Movement:** Calls `applicationService.updateApplicationStage(applicationId, newStage)` with automated audit trail generation via PostgreSQL trigger `trigger_log_application_status`.

### 2.3 Recruiter Evaluation Notes & Rating
- **Private Notes:** Recruiters can write private assessment notes stored in `job_applications.employer_notes`.
- **1–5 Star Rating:** Recruiters record numerical quality scores (`1` to `5`) in `job_applications.employer_rating`.
- **Privacy & Security:** Notes and ratings are completely hidden from candidate queries by database RLS and column permissions.

### 2.4 Interview Scheduling & Operations (`/employer/interviews`)
- **Schedule Modal:** Recruiter selects date, start/end time, interview format (`technical_deep_dive`, `cultural_fit`, `executive_round`, `hr_screening`), meeting link, location, and internal notes.
- **Automatic Stage Synchronization:** Scheduling an interview for a candidate in `new`, `screening`, or `shortlisted` automatically advances the application to the `interview` stage.
- **Operations Controls:** Recruiters can mark rounds as **Completed**, **Cancel** sessions, or join video meetings via deep link.

### 2.5 Talent Bench (`/employer/saved-candidates`)
- **Saved Candidates:** Queries `saved_candidates` table linked to employer's `company_id`.
- **Quick Bench Management:** Standout candidates can be added/removed from the bench across the ATS pipeline.

---

## 3. Security & Multi-Tenant Isolation

| Entity / Action | Enforced RLS Policy | Security Boundary |
| :--- | :--- | :--- |
| `job_applications` SELECT / UPDATE | `job_applications_select_employer` / `job_applications_update_employer` | Employers can only query and advance applications submitted to jobs belonging to their `company_id`. |
| `interviews` INSERT / UPDATE / SELECT | `interviews_select_employer` / `interviews_insert_employer` / `interviews_update_employer` | Interview scheduling is strictly restricted to company requisitions. |
| `saved_candidates` SELECT / INSERT / DELETE | `saved_candidates_select_employer` / `saved_candidates_insert_employer` / `saved_candidates_delete_employer` | Talent bench is isolated per employer organization. |
| `application_status_history` SELECT | `history_select_employer` | Employers can only inspect audit history for their own candidate pipeline. |

---

## 4. Next Task

- **Module 02 — Task 08:** Employer Analytics & Hiring Funnel Aggregations (live SQL aggregations for time-to-hire, funnel conversion rates, applicant demographics, and source analytics).
