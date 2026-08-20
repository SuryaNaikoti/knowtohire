# KNOWTOHIRE — MODULE 02: JOB PORTAL & RECRUITMENT
## DATABASE SCHEMA, SECURITY & RLS SPECIFICATION

**Document Version:** 1.0.0  
**Migration File:** [`supabase/migrations/20260815000000_job_portal_and_recruitment_schema.sql`](file:///e:/Projects/KnowToHire/supabase/migrations/20260815000000_job_portal_and_recruitment_schema.sql)  
**TypeScript Types:** [`src/types/database.ts`](file:///e:/Projects/KnowToHire/src/types/database.ts)  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

This specification documents the complete PostgreSQL / Supabase database architecture for **Module 02 — Job Portal & Recruitment**. It defines the entity data models, idempotent PostgreSQL enums, database-level unique constraints, audit trail automation, business validation triggers, and multi-tenant Row Level Security (RLS) policies.

---

## 2. PostgreSQL Enums

| Enum Name | Controlled Values | Purpose |
| :--- | :--- | :--- |
| `job_status` | `'draft'`, `'published'`, `'paused'`, `'closed'` | Job posting lifecycle governance. |
| `employment_type` | `'full_time'`, `'part_time'`, `'contract'`, `'hybrid'`, `'internship'` | Contractual employment classification. |
| `work_mode` | `'on_site'`, `'hybrid'`, `'remote'` | Physical workplace location mode. |
| `experience_level` | `'fresher'`, `'associate'`, `'mid_level'`, `'senior'`, `'lead'`, `'executive'` | Candidate seniority requirement. |
| `application_stage` | `'new'`, `'screening'`, `'shortlisted'`, `'interview'`, `'offer'`, `'hired'`, `'rejected'`, `'withdrawn'` | ATS recruitment pipeline stages. |
| `interview_type` | `'hr_screening'`, `'technical_deep_dive'`, `'case_study'`, `'executive_review'` | Interview assessment categorization. |
| `interview_status` | `'scheduled'`, `'completed'`, `'cancelled'`, `'rescheduled'` | Scheduled interview operational state. |

---

## 3. Database Table Definitions

### 3.1 `public.jobs`
Multi-tenant job requisitions created by authorized employers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique job identifier. |
| `company_id` | `UUID` | `NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE` | Employer's enterprise organization. |
| `created_by` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT` | Recruiter profile who created the posting. |
| `title` | `TEXT` | `NOT NULL` | Job role title. |
| `department` | `TEXT` | `NOT NULL` | Business division or department. |
| `category` | `TEXT` | `NOT NULL` | Domain specialization (e.g. ESG, Solar). |
| `description` | `TEXT` | `NOT NULL` | Overview and company summary. |
| `responsibilities`| `TEXT[]` | `NOT NULL DEFAULT '{}'` | Key job duties. |
| `requirements` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Essential qualifications. |
| `skills` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Targeted skills (GIN-indexed). |
| `benefits` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Perks & corporate benefits. |
| `employment_type`| `employment_type`| `NOT NULL DEFAULT 'full_time'` | Work type enum. |
| `work_mode` | `work_mode` | `NOT NULL DEFAULT 'hybrid'` | Hybrid, Remote, or On-site. |
| `experience_level`|`experience_level`| `NOT NULL DEFAULT 'mid_level'` | Required seniority. |
| `location` | `TEXT` | `NOT NULL` | City and State in India. |
| `state_code` | `TEXT` | Optional | 2-letter state code (`KA`, `TS`, `MH`). |
| `is_remote` | `BOOLEAN` | `NOT NULL DEFAULT false` | Remote flag. |
| `min_salary_inr` | `NUMERIC(12,2)` | `NOT NULL CHECK (min_salary_inr >= 0)` | Lower salary limit in ₹. |
| `max_salary_inr` | `NUMERIC(12,2)` | `NOT NULL CHECK (max_salary_inr >= min_salary_inr)` | Upper salary limit in ₹. |
| `salary_currency`| `TEXT` | `NOT NULL DEFAULT 'INR'` | Currency code. |
| `status` | `job_status` | `NOT NULL DEFAULT 'draft'` | Current posting status. |
| `is_verified` | `BOOLEAN` | `NOT NULL DEFAULT false` | Admin verification badge flag. |
| `application_deadline` | `TIMESTAMPTZ` | Optional | Requisition closing date. |
| `published_at` | `TIMESTAMPTZ` | Optional | Timestamp when status changed to published. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Automatically maintained timestamp. |

---

### 3.2 `public.job_applications`
Candidate job application submissions with duplicate prevention.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique application ID. |
| `job_id` | `UUID` | `NOT NULL REFERENCES jobs(id) ON DELETE CASCADE` | Target job requisition. |
| `candidate_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Applying candidate. |
| `company_id` | `UUID` | `NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE` | Target hiring enterprise. |
| `stage` | `application_stage` | `NOT NULL DEFAULT 'new'` | ATS funnel stage. |
| `resume_url` | `TEXT` | `NOT NULL` | Attached resume link. |
| `cover_letter` | `TEXT` | Optional | Candidate personal statement. |
| `candidate_snapshot` | `JSONB` | `NOT NULL DEFAULT '{}'` | Frozen snapshot of candidate profile. |
| `employer_notes` | `TEXT` | Optional | Private recruiter evaluation notes. |
| `rejection_reason` | `TEXT` | Optional | Reason for application rejection. |
| `employer_rating` | `INTEGER` | `CHECK (employer_rating BETWEEN 1 AND 5)` | Recruiter candidate rating (1-5). |
| `applied_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Application submission timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record update timestamp. |
| `withdrawn_at` | `TIMESTAMPTZ` | Optional | Timestamp if withdrawn by candidate. |

**Unique Constraint:** `CONSTRAINT unique_candidate_job_application UNIQUE(job_id, candidate_id)` prevents duplicate applications even under concurrent race conditions.

---

### 3.3 `public.saved_jobs`
Candidate saved job bookmarks.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique bookmark ID. |
| `candidate_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Bookmark owner. |
| `job_id` | `UUID` | `NOT NULL REFERENCES jobs(id) ON DELETE CASCADE` | Bookmarked job. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Saved timestamp. |

**Unique Constraint:** `CONSTRAINT unique_candidate_saved_job UNIQUE(candidate_id, job_id)`.

---

### 3.4 `public.application_status_history`
Immutable audit log tracking all application status transitions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Audit record ID. |
| `application_id` | `UUID` | `NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE` | Linked application. |
| `from_stage` | `application_stage` | Nullable on initial insert | Previous ATS stage. |
| `to_stage` | `application_stage` | `NOT NULL` | New ATS stage. |
| `changed_by` | `UUID` | `REFERENCES profiles(id) ON DELETE SET NULL` | Actor profile ID. |
| `note` | `TEXT` | Optional | Contextual transition note. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Event timestamp. |

---

### 3.5 `public.interviews`
Interview scheduling integrated with applications and ATS.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique interview ID. |
| `application_id` | `UUID` | `NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE` | Target application. |
| `job_id` | `UUID` | `NOT NULL REFERENCES jobs(id) ON DELETE CASCADE` | Associated job. |
| `company_id` | `UUID` | `NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE` | Company hosting interview. |
| `candidate_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Interviewed candidate. |
| `created_by` | `UUID` | `REFERENCES profiles(id) ON DELETE SET NULL` | Scheduling recruiter. |
| `interview_type` | `interview_type` | `NOT NULL DEFAULT 'technical_deep_dive'` | Type of interview round. |
| `title` | `TEXT` | `NOT NULL` | Round title. |
| `scheduled_start` | `TIMESTAMPTZ` | `NOT NULL` | Scheduled start time. |
| `scheduled_end` | `TIMESTAMPTZ` | Optional | Scheduled end time. |
| `meeting_link` | `TEXT` | Optional | Video meeting link. |
| `location` | `TEXT` | Optional | Physical location if on-site. |
| `status` | `interview_status` | `NOT NULL DEFAULT 'scheduled'` | Interview status. |
| `notes` | `TEXT` | Optional | Recruiter/interviewer notes. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Created timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Updated timestamp. |

---

### 3.6 `public.saved_candidates`
Employer talent bookmarks.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique saved candidate ID. |
| `company_id` | `UUID` | `NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE` | Bookmark owner company. |
| `employer_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Recruiter who saved candidate. |
| `candidate_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Saved candidate profile. |
| `notes` | `TEXT` | Optional | Private notes on talent. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Created timestamp. |

**Unique Constraint:** `CONSTRAINT unique_company_saved_candidate UNIQUE(company_id, candidate_id)`.

---

## 4. Automated Business Governance & Triggers

1. **`handle_application_stage_change()` Trigger:**
   - Automatically logs an entry into `application_status_history` on initial application submission (`from_stage = NULL, to_stage = 'new'`) and on any subsequent `stage` modification.
2. **`validate_job_application_eligibility()` Trigger:**
   - Verifies before INSERT that the referenced job exists and has `status = 'published'`. Automatically enforces `company_id` integrity.
3. **`validate_job_publishing_governance()` Trigger:**
   - Validates that the recruiter belongs to the posting company and prevents publishing unless `company_profiles.verification_status IN ('verified', 'pending_review')`. Automatically sets `published_at = NOW()` upon publishing.

---

## 5. Row Level Security (RLS) Policies Summary

| Table | Operation | Target Role | Condition / Security Rule |
| :--- | :--- | :--- | :--- |
| `jobs` | `SELECT` | Public / Anon | `status = 'published'` |
| `jobs` | `SELECT` | Authenticated Employer | Employer belongs to `company_id`. |
| `jobs` | `INSERT / UPDATE / DELETE` | Authenticated Employer | Recruiter `created_by = auth.uid()` and belongs to `company_id`. |
| `jobs` | `ALL` | Authenticated Admin | `profiles.role = 'admin'` |
| `job_applications` | `SELECT` | Candidate | `candidate_id = auth.uid()` |
| `job_applications` | `INSERT` | Candidate | `candidate_id = auth.uid()` and candidate role. |
| `job_applications` | `UPDATE` | Candidate | Can only set `stage = 'withdrawn'`. |
| `job_applications` | `SELECT / UPDATE` | Employer | Employer belongs to `company_id`. |
| `saved_jobs` | `ALL` | Candidate | `candidate_id = auth.uid()`. |
| `application_status_history` | `SELECT` | Candidate | Candidate owns the parent application. |
| `application_status_history` | `SELECT` | Employer | Employer belongs to parent application's `company_id`. |
| `interviews` | `SELECT` | Candidate | `candidate_id = auth.uid()`. |
| `interviews` | `ALL` | Employer | Employer belongs to `company_id`. |
| `saved_candidates` | `ALL` | Employer | Employer belongs to `company_id`. |
