# KnowToHire — Row Level Security (RLS) & Access Governance Audit

## Security & Isolation Policies Overview

All Supabase PostgreSQL tables in the KnowToHire platform operate under Row-Level Security (RLS) policies ensuring strict privacy boundaries between candidate personal records, employer candidate pools, and public marketing assets.

---

## Table Policy Matrix

### 1. `profiles`
- **SELECT**: Authenticated users can view their own profile; employers can view candidate public profiles; administrators have full view access.
- **INSERT / UPDATE**: Users can only modify rows matching `auth.uid() = id`.
- **DELETE**: Restricted to administrators.

### 2. `jobs`
- **SELECT**: Any anonymous or authenticated user can view jobs where `status = 'published'`. Employers can view all jobs (including drafts and paused) matching `employer_id = auth.uid()` or their `company_id`.
- **INSERT**: Authenticated users with `role = 'employer'` or `role = 'admin'` and verified company association.
- **UPDATE / DELETE**: Restricted to the job owner recruiter or enterprise company admin.

### 3. `job_applications`
- **SELECT**: Candidates can only see applications where `candidate_id = auth.uid()`. Employers can only see applications submitted to their enterprise `company_id`.
- **INSERT**: Authenticated candidates applying with `candidate_id = auth.uid()`.
- **UPDATE**: Candidates can withdraw their application (`status = 'withdrawn'`); employers can update ATS pipeline `stage` and review notes.

### 4. `interviews`
- **SELECT**: Candidates can view scheduled interviews where `candidate_id = auth.uid()`. Employers can view interviews for their `company_id`.
- **INSERT / UPDATE**: Recruiter of the hiring company or administrator.

### 5. `saved_jobs` & `saved_candidates`
- **SELECT / INSERT / DELETE**: Strictly isolated to `auth.uid() = candidate_id` and `auth.uid() = employer_id` respectively.

### 6. `resources`, `templates`, `blog_posts`
- **SELECT**: Publicly readable.
- **INSERT / UPDATE / DELETE**: Restricted to platform administrators.

### 7. `resource_requests`
- **SELECT**: Request creator can view their submissions; administrators view all in moderation queue.
- **INSERT**: Authenticated users.
- **UPDATE**: Platform administrators update review status, notes, and attach deliverable resource IDs.

### 8. `notifications`
- **SELECT / UPDATE**: Strictly restricted to `auth.uid() = user_id`.

---

## Role Governance Architecture

```
                                  [SUPABASE AUTH]
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
             Candidate Role        Employer Role          Admin Role
             (Job Seekers)        (Enterprise ATS)       (Superuser)
                   │                     │                     │
          - Profile & Resume     - Post & Edit Jobs     - Platform KPIs
          - Apply to Jobs        - Talent Discovery     - User Moderation
          - Saved Jobs Bench     - ATS Kanban Pipeline  - Employer Verif.
          - Scheduled Interviews - Schedule Interviews  - Hub CMS
          - Content Requests     - Company Profile      - Request Queue
```
