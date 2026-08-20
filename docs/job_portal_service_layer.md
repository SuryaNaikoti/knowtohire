# KNOWTOHIRE — MODULE 02: JOB PORTAL & RECRUITMENT
## FRONTEND SERVICE LAYER ARCHITECTURE SPECIFICATION

**Document Version:** 1.0.0  
**Service Entry Point:** [`src/services/index.ts`](file:///e:/Projects/KnowToHire/src/services/index.ts)  
**TypeScript Types:** [`src/services/types.ts`](file:///e:/Projects/KnowToHire/src/services/types.ts)  
**Status:** IMPLEMENTED & VERIFIED (Task 03 Complete)  
**UI Integration Notice:** *UI integration is strictly deferred to subsequent tasks (Tasks 04–08). Existing mock data and UI pages remain unchanged during this phase.*

---

## 1. Executive Overview

The KnowToHire Frontend Service Layer provides a single, strongly-typed, secure abstraction over Supabase database operations. It completely isolates React UI components from raw SQL queries, direct table manipulations, and backend error strings.

### Core Architectural Pillars:
1. **Single Client Abstraction:** All services strictly import the anon/authenticated client from [`@/lib/supabase`](file:///e:/Projects/KnowToHire/src/lib/supabase.ts). Zero service-role keys exist in client code.
2. **Strict Row Level Security (RLS) Dependency:** The frontend never decides whether an employer or candidate is authorized to access a record; Supabase RLS enforces multi-tenant boundaries at the database engine level.
3. **Structured Error Normalization:** Database exceptions (duplicate constraints, RLS violations, unverified company publishing triggers) are converted into user-friendly `ServiceError` objects with standardized codes and HTTP-like status codes.
4. **Predictable Pagination:** All list operations return `{ data, count, page, pageSize, totalPages }` for seamless pagination binding.

---

## 2. Services Breakdown

### 2.1 `jobService` ([`src/services/jobService.ts`](file:///e:/Projects/KnowToHire/src/services/jobService.ts))

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `getPublishedJobs` | `filters?: JobFilters` | `Promise<ServiceResult<PaginatedResult<Job>>>` | Queries published jobs with multi-facet filters (keyword, location, state, category, work mode, experience, salary) and pagination. |
| `getPublishedJobById` | `jobId: string` | `Promise<ServiceResult<Job>>` | Retrieves a single published job by UUID with embedded company details. |
| `getEmployerJobs` | `filters?: { status?: JobStatus; page?: number; pageSize?: number }` | `Promise<ServiceResult<PaginatedResult<Job>>>` | Retrieves all requisitions (draft, published, paused, closed) for the employer's company. |
| `getEmployerJobById` | `jobId: string` | `Promise<ServiceResult<Job>>` | Retrieves any requisition belonging to the employer's company by ID. |
| `createJob` | `input: JobCreateInput` | `Promise<ServiceResult<Job>>` | Inserts a new job requisition. Sets `created_by = auth.uid()` and validates publishing governance. |
| `updateJob` | `jobId: string, input: JobUpdateInput` | `Promise<ServiceResult<Job>>` | Mutates requisition details or salary bands. |
| `publishJob` | `jobId: string` | `Promise<ServiceResult<Job>>` | Transitions status to `'published'` and updates `published_at`. |
| `pauseJob` | `jobId: string` | `Promise<ServiceResult<Job>>` | Transitions status to `'paused'`. |
| `closeJob` | `jobId: string` | `Promise<ServiceResult<Job>>` | Transitions status to `'closed'`. |
| `reopenJob` | `jobId: string` | `Promise<ServiceResult<Job>>` | Re-activates a paused/closed position to `'published'`. |
| `deleteDraftJob` | `jobId: string` | `Promise<ServiceResult<boolean>>` | Permanently removes an unpublished draft requisition. |

---

### 2.2 `applicationService` ([`src/services/applicationService.ts`](file:///e:/Projects/KnowToHire/src/services/applicationService.ts))

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `applyToJob` | `input: ApplicationSubmitInput` | `Promise<ServiceResult<JobApplication>>` | Submits a candidate application. Snapshots candidate profile at point of submission. Prevents duplicate submissions. |
| `hasCandidateApplied` | `jobId: string` | `Promise<ServiceResult<boolean>>` | Checks whether the authenticated candidate has already applied to the given job. |
| `getMyApplications` | `none` | `Promise<ServiceResult<JobApplication[]>>` | Fetches all applications submitted by the logged-in candidate with joined job & company details. |
| `getMyApplicationById`| `applicationId: string` | `Promise<ServiceResult<JobApplication>>` | Retrieves detailed application state for candidate application tracker. |
| `withdrawApplication` | `applicationId: string` | `Promise<ServiceResult<JobApplication>>` | Candidate sets `stage = 'withdrawn'` and records `withdrawn_at` timestamp. |
| `getJobApplicants` | `jobId: string, filters?: ApplicationFilters` | `Promise<ServiceResult<PaginatedResult<JobApplication>>>` | Employer ATS retrieves applicant list for a specific requisition with stage filters. |
| `getCompanyApplicants`| `filters?: ApplicationFilters` | `Promise<ServiceResult<PaginatedResult<JobApplication>>>` | Employer Candidate Pipeline retrieves all applicants across all company job postings. |
| `getEmployerApplicationById` | `applicationId: string` | `Promise<ServiceResult<JobApplication>>` | Detailed applicant inspection for recruiter slide-over drawer and evaluation view. |
| `updateApplicationStage`| `applicationId: string, stage: ApplicationStage, reason?: string` | `Promise<ServiceResult<JobApplication>>` | Advances candidate through ATS pipeline. Automatically logs audit trail via trigger. |
| `updateEmployerNotes` | `applicationId: string, notes: string, rating?: number` | `Promise<ServiceResult<JobApplication>>` | Saves private recruiter rating (1–5) and evaluation notes. |
| `getApplicationStatusHistory` | `applicationId: string` | `Promise<ServiceResult<ApplicationStatusHistory[]>>` | Retrieves the immutable stage timeline history. |

---

### 2.3 `savedJobService` ([`src/services/savedJobService.ts`](file:///e:/Projects/KnowToHire/src/services/savedJobService.ts))

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `saveJob` | `jobId: string` | `Promise<ServiceResult<SavedJob>>` | Saves a job bookmark for the authenticated candidate. |
| `unsaveJob` | `jobId: string` | `Promise<ServiceResult<boolean>>` | Deletes a job bookmark for the authenticated candidate. |
| `getMySavedJobs` | `none` | `Promise<ServiceResult<SavedJob[]>>` | Retrieves all active saved jobs for `/candidate/saved-jobs`. |
| `isJobSaved` | `jobId: string` | `Promise<ServiceResult<boolean>>` | Checks bookmark state for active bookmark button rendering. |

---

### 2.4 `interviewService` ([`src/services/interviewService.ts`](file:///e:/Projects/KnowToHire/src/services/interviewService.ts))

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `getMyInterviews` | `none` | `Promise<ServiceResult<Interview[]>>` | Candidate retrieves upcoming and past scheduled interviews. |
| `getEmployerInterviews`| `none` | `Promise<ServiceResult<Interview[]>>` | Employer ATS retrieves company interview schedules. |
| `getInterviewById` | `interviewId: string` | `Promise<ServiceResult<Interview>>` | Detailed interview round information. |
| `scheduleInterview` | `input: InterviewCreateInput` | `Promise<ServiceResult<Interview>>` | Creates a scheduled interview linked to application, candidate, and company. |
| `updateInterview` | `interviewId: string, input: InterviewUpdateInput` | `Promise<ServiceResult<Interview>>` | Updates meeting link, time, notes, or status. |
| `cancelInterview` | `interviewId: string` | `Promise<ServiceResult<Interview>>` | Marks interview status as `'cancelled'`. |

---

### 2.5 `savedCandidateService` ([`src/services/savedCandidateService.ts`](file:///e:/Projects/KnowToHire/src/services/savedCandidateService.ts))

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `saveCandidate` | `candidateId: string, notes?: string` | `Promise<ServiceResult<SavedCandidate>>` | Bookmarks a candidate profile for the employer's organization. |
| `unsaveCandidate` | `candidateId: string` | `Promise<ServiceResult<boolean>>` | Removes candidate from company bookmarks. |
| `getMySavedCandidates`| `none` | `Promise<ServiceResult<SavedCandidate[]>>` | Retrieves all saved candidates for `/employer/saved-candidates`. |
| `isCandidateSaved` | `candidateId: string` | `Promise<ServiceResult<boolean>>` | Verifies candidate bookmark status for quick-action buttons. |

---

## 3. Error Normalization Architecture

Every service call catches exceptions and processes them through `normalizeServiceError()`:

```typescript
export function normalizeServiceError(err: unknown): ServiceError {
  // 1. Duplicate Unique Constraint Violation -> Clean user error
  if (code === '23505' || message.includes('unique_candidate_job_application')) {
    return {
      message: 'You have already submitted an application for this job posting.',
      code: 'DUPLICATE_APPLICATION',
      status: 409,
    };
  }

  // 2. RLS Permission Violations -> 403 Forbidden
  if (code === '42501' || message.includes('permission denied')) {
    return {
      message: 'Unauthorized operation. You do not have permission to perform this action.',
      code: 'FORBIDDEN',
      status: 403,
    };
  }

  // 3. Trigger Governance Check -> 422 Unprocessable Entity
  if (message.includes('Company verification is required')) {
    return {
      message: 'Your enterprise must be verified before job openings can be published publicly.',
      code: 'UNVERIFIED_COMPANY',
      status: 422,
    };
  }

  // 4. Safe Sanitized Fallback
  return {
    message: message || 'A database request error occurred.',
    code: code || 'DATABASE_ERROR',
    status: 500,
  };
}
```

---

## 4. Usage Examples (For Subsequent UI Tasks)

### Example 1: Loading Public Jobs with Filters
```typescript
import { jobService } from '@/services';

const { data, error } = await jobService.getPublishedJobs({
  keyword: 'ESG',
  location: 'Bengaluru',
  employment_type: 'full_time',
  page: 1,
  pageSize: 12,
});

if (error) {
  console.error(error.message);
} else {
  console.log(data.data); // Job[]
  console.log(data.totalPages); // number
}
```

### Example 2: Submitting an Application
```typescript
import { applicationService } from '@/services';

const { data, error } = await applicationService.applyToJob({
  job_id: 'job-uuid',
  resume_url: 'https://...',
  cover_letter: 'I am excited to apply...',
});

if (error) {
  // Gracefully handles DUPLICATE_APPLICATION or JOB_NOT_PUBLISHED
  alert(error.message);
}
```

### Example 3: Advancing Candidate Stage in ATS
```typescript
import { applicationService } from '@/services';

const { data, error } = await applicationService.updateApplicationStage(
  'application-uuid',
  'interview'
);
```

---

## 5. Security & Isolation Verification

- **Anon / User Key:** All calls execute under the user's active Supabase session.
- **No Role Forgery:** `auth.uid()` is derived on the server via JWT tokens.
- **Multi-Tenant Protection:** `company_id` filters are validated by database RLS rules.
- **Zero UI Regression:** Task 03 establishes backend communication APIs without touching existing mock data in active UI pages.
