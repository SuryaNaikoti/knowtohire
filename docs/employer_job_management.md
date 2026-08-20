# KNOWTOHIRE — MODULE 02: JOB PORTAL & RECRUITMENT
## EMPLOYER JOB LIFECYCLE MANAGEMENT SPECIFICATION

**Document Version:** 1.0.0  
**Module:** Module 02 — Task 06 (Employer Job Lifecycle Management)  
**Integrated Employer Pages & Components:**
- [`/employer/jobs`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerJobsPage.tsx) — Employer Requisitions Dashboard with Live Lifecycle Action Controls
- [`/employer/jobs/new`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerCreateJobPage.tsx) — Multi-step Job Creation Form (Draft vs. Publish)
- [`/employer/jobs/:id`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerJobDetailsPage.tsx) — Requisition Inspection & Performance View
- [`/employer/jobs/:id/edit`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerEditJobPage.tsx) — Job Requisition Edit Form with Pre-filled Live Values
- [`JobPostingCard`](file:///e:/Projects/KnowToHire/src/components/employer/JobPostingCard.tsx) — Interactive Requisition Card with State-Specific Action Buttons  
**Backend Service Used:** [`src/services/jobService.ts`](file:///e:/Projects/KnowToHire/src/services/jobService.ts)  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

Task 06 connects the complete Employer Job Management and requisition lifecycle workflow to the Supabase backend. Employers can now create, edit, save as draft, publish, pause, resume, close, reopen, and permanently delete drafts using `jobService`. All database Row Level Security policies and enterprise verification triggers remain authoritative.

---

## 2. Requisition Lifecycle State Machine

```
               ┌───────────────┐
               │     DRAFT     │
               └───────┬───────┘
                       │ (Publish)
                       ▼
┌───────────────┐ (Pause)  ┌───────────────┐ (Close)  ┌───────────────┐
│    PAUSED     │ ◄─────── │   PUBLISHED   │ ───────► │    CLOSED     │
└───────┬───────┘          └───────────────┘          └───────┬───────┘
        │ (Resume)                 ▲                          │ (Reopen)
        └──────────────────────────┴──────────────────────────┘
```

### Lifecycle Rules:
1. **Draft:**
   - Default initial state when saving a work-in-progress opening (`status = 'draft'`).
   - Drafts are **invisible** to public searches, candidate feeds, and unauthenticated visitors.
   - Employer actions: **Edit**, **Publish Job**, **Delete Draft**.
2. **Published:**
   - Active opening (`status = 'published'`).
   - Requires verified company status via database trigger `trigger_verify_company_before_publishing`.
   - Discoverable on `/jobs`, `/careers`, and public search feeds.
   - Employer actions: **Edit**, **Pause**, **Close**, **View Applicants**.
3. **Paused:**
   - Temporarily paused requisition (`status = 'paused'`).
   - Applications are suspended; removed from public search feeds.
   - Employer actions: **Edit**, **Resume (Publish)**, **Close**.
4. **Closed:**
   - Terminated requisition (`status = 'closed'`).
   - Removed from public feeds; historic applications remain archived in ATS pipeline.
   - Employer actions: **Reopen (Publish)**, **View Applicants**.

---

## 3. Enterprise Verification & Governance Boundary

- **Company Verification Rule:** Publishing a requisition is guarded at the database level by PostgreSQL trigger `trigger_verify_company_before_publishing`.
- **Unverified Handling:** If an employer attempts to publish while their company's verification status is `pending` or `rejected`, the backend rejects the transaction with error code `422 Unprocessable Entity` (`UNVERIFIED_COMPANY`).
- **User Experience:** The frontend displays a sanitized message explaining that the enterprise must complete compliance verification before openings become public, allowing the employer to safely maintain the opening as a **Draft**.

---

## 4. Multi-Tenant Isolation & RLS Security

| Operation | RLS Policy | Security Boundary |
| :--- | :--- | :--- |
| `jobs` SELECT | `jobs_select_employer_own_company` | Employers can only query requisitions where `company_id` matches their own verified organization. |
| `jobs` INSERT | `jobs_insert_employer` | New requisitions automatically assign `created_by = auth.uid()` and employer's linked `company_id`. |
| `jobs` UPDATE | `jobs_update_employer` | Employers can only mutate requisitions belonging to their organization. |
| `jobs` DELETE | `jobs_delete_employer_draft` | Employers can only delete requisitions in `'draft'` status belonging to their organization. |

---

## 5. Next Task

- **Module 02 — Task 07:** Employer Applicants, ATS Kanban Pipeline & Interview Scheduling (`/employer/pipeline`, `/employer/jobs/:id/applicants`, `/employer/interviews`, and ATS stage movement `New` → `Screening` → `Shortlisted` → `Interview` → `Offer` → `Hired` / `Rejected`).
