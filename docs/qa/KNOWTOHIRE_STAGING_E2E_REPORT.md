# KnowToHire — Staging End-to-End Verification Report
**Date:** October 19, 2026  
**Auditor / Roles:** Senior QA Automation Engineer, Application Security Tester, Release Manager  
**Platform URL:** `http://localhost:5173` / `https://www.knowtohire.com`  
**Staging Supabase Reference:** `rjjmbuvsbxxlrxweslnv` (`knowtohire-staging`, `ap-southeast-1`, Postgres 17)  
**Production Supabase Reference (PROTECTED - Zero writes):** `roqbodprqmnwxdjsskgb`  
**Git Head Commit:** `31bfbf9` (with working tree enhancements)  
**Build Artifacts:** `tsc && vite build` passed cleanly (15.59s, zero type/lint errors)

---

## 1. Executive Summary & Audit Preflight
This audit was performed in accordance with strict production safety rules. **Zero test data was created, mutated, or deleted in the production environment (`roqbodprqmnwxdjsskgb`)**. All dynamic cross-role tests, entity insertions, stage transitions, and schema synchronizations were directed exclusively to the isolated staging project (`rjjmbuvsbxxlrxweslnv`).

### Target Environment Verification
- **Staging URL:** `https://rjjmbuvsbxxlrxweslnv.supabase.co`
- **Migration Status:** Fully synced. Migration `20261020000000_inapp_and_push_notifications.sql` was applied to staging via `supabase db push`.
- **Preflight Safeguard:** Hard assertion enforced in [`scripts/verify_staging_cross_role_workflow.ts`](file:///E:/Projects/KnowToHire/scripts/verify_staging_cross_role_workflow.ts) that aborts immediately if any connection string contains `roqbodprqmnwxdjsskgb`.

---

## 2. Test Execution & Evidence Matrix

| Test ID | Scenario & Role | Assertions & Mechanism | Actual Result | Status | Safe Evidence |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TS-01-NOTIF** | Public Navbar (Anonymous) | RLS & DOM selector `#notification-bell` | Bell absent from public DOM; unauthenticated access prevented | **PASS** | [`public_homepage_no_bell_1792381331969.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/public_homepage_no_bell_1792381331969.png) |
| **TS-01-NOTIF-AUTH** | Candidate Portal (Candidate) | Dropdown click, unread badge, Realtime bell | Flyout rendered; items listed; empty/state rendered | **PASS** | [`candidate_notifications_dropdown_open_1792381337213.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/candidate_notifications_dropdown_open_1792381337213.png) |
| **TS-02-CURATED-DRIVES**| Curated External Drives (Public) | External link cards, outbound target validation | Drive cards render with functional outbound redirection | **PASS** | [`curated_drives_listing_1792381342335.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/curated_drives_listing_1792381342335.png) |
| **TS-03-FILTER-EMPLOYMENT**| Job Search Filter (Public) | Select `Full-time`, assert DOM card tags. Select negative `Internship` filter. | Returned 4 full-time cards. Negative filter returned 0 cards and clean empty state. | **PASS** | [`filter_full_time_verified_1792384449830.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/filter_full_time_verified_1792384449830.png) |
| **TS-04-SORT-RECENCY** | Job Search Sort (Public) | Toggle sort order: Salary (High to Low) vs Salary (Low to High) vs Recent | Correct DOM card re-ordering. Max salary ₹4,500,000 top card verified on high-to-low. | **PASS** | [`sort_salary_desc_verified_1792384457002.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/sort_salary_desc_verified_1792384457002.png) |
| **ROLE-01-CANDIDATE** | Candidate Profile & Dashboard | Auth session, stats cards, profile navigation | Dashboard rendered with active session; profile tabs loaded | **PASS** | [`candidate_profile_view_1792381366151.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/candidate_profile_view_1792381366151.png) |
| **ROLE-02-EMPLOYER** | Employer ATS Dashboard | Employer login, enterprise linkage, ATS Kanban | Corporate profile verified; Kanban columns rendered | **PASS** | [`employer_dashboard_view_1792381372668.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/employer_dashboard_view_1792381372668.png) |
| **ROLE-03-CREATOR** | Creator Studio & Terms | Creator auth, 70% commission terms display | Creator Studio loaded with revenue-share agreement active | **PASS** | [`creator_studio_view_1792381381615.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/creator_studio_view_1792381381615.png) |
| **ROLE-04-ADMIN** | Admin Notifications Broadcast | Admin RBAC check, broadcast compose form | Broadcast center accessible only by supportk2h@gmail.com | **PASS** | [`admin_broadcast_center_1792381388061.png`](file:///E:/Projects/KnowToHire/docs/qa/evidence/screenshots/admin_broadcast_center_1792381388061.png) |
| **STAGING-XROLE-01** | Full ATS Cross-Role Lifecycle | Candidate applies $\rightarrow$ Employer advances stage $\rightarrow$ Candidate sees update | Full 9-step cycle executed in staging; verified status persistence | **PASS** | [`staging_cross_role_workflow_results.json`](file:///E:/Projects/KnowToHire/docs/qa/evidence/staging_cross_role_workflow_results.json) |
| **STAGING-RLS-02** | Multi-Tenant Data Boundary | Unrelated user queries protected application | Supabase RLS returns 0 records for read and blocks unauthorized mutation | **PASS** | [`staging_cross_role_workflow_results.json`](file:///E:/Projects/KnowToHire/docs/qa/evidence/staging_cross_role_workflow_results.json) |
| **APP-DUP-01** | Duplicate Application Guard | Re-submission of application for same requisition | Enforced at Application Layer (`409 DUPLICATE_APPLICATION`). Database lacks unique index. | **CONDITIONAL** | [`src/services/applicationService.ts`](file:///E:/Projects/KnowToHire/src/services/applicationService.ts#L237-L256) |

---

## 3. Dedicated Staging Cross-Role ATS Verification Run
A full automated cross-role lifecycle run was performed using [`scripts/verify_staging_cross_role_workflow.ts`](file:///E:/Projects/KnowToHire/scripts/verify_staging_cross_role_workflow.ts).

### Step-by-Step Staging Verification Details
1. **Test Accounts Provisioning:** Dedicated test users `staging_cand_...@k2h.test` and `staging_emp_...@k2h.test` provisioned in Supabase auth along with a verified staging company entity (`company_profiles`).
2. **Requisition Publication:** Employer client authenticated with Supabase session and successfully created a verified job opening (`Senior ESG & Climate Lead`).
3. **Candidate Submission:** Candidate client authenticated with Supabase session and submitted an application linked to the published job.
4. **Duplicate Application Defense:**
   - Candidate attempted immediate re-submission.
   - Handled via `applicationService.applyToJob` returning HTTP 409 `DUPLICATE_APPLICATION`.
   - *Audit finding:* At the raw PostgreSQL layer, `public.job_applications` does not possess a `UNIQUE (job_id, candidate_id)` constraint. The frontend and application service safeguard users from duplicate submissions, but an operational recommendation is made to add the database constraint in an upcoming migration.
5. **Employer Stage Advancement:** Employer retrieved the candidate's application from their ATS pipeline and updated stage from `new` to `shortlisted`.
6. **Candidate Status Persistence:** Candidate re-fetched their application record and asserted that `stage === 'shortlisted'` persisted cleanly.
7. **Cross-Tenant Privacy Boundary (RLS):** An unrelated third-party staging account attempted to query and tamper with the application. Supabase RLS blocked all unauthorized access (null read, 0 rows modified).
8. **Notification Delivery & State Transition:** In-app notification created for candidate, fetched via authenticated candidate client, and transitioned `is_read: false` $\rightarrow$ `is_read: true`.
9. **Automated Clean-up:** All ephemeral test entities (notifications, applications, jobs, company profiles, user accounts) were deleted from the staging database.

---

## 4. Subsystem Audits

### A. Notifications & Web Push
- **In-App Flyout & Realtime:** Verified functional across candidate, employer, creator, and admin shells. Subscribed via Supabase Realtime channel `public:notifications:user_id=eq.{id}`.
- **Web Push (VAPID):** Client-side service worker registration (`/sw.js`) and subscription UI are implemented.
  - *Limitation:* Native OS push delivery requires interactive browser permission grant from end users on secure HTTPS origins; cannot be triggered headlessly without mocked browser push endpoints.

### B. Payment Infrastructure (Razorpay)
- **Architecture:** Client uses Razorpay Standard Checkout SDK.
- **Security Check:** Serverless webhook and order verification routines validated in test suite (`scripts/test_hardened_payment_security.ts`).
- **Production Safety:** Real financial transactions avoided. Test mode credentials active.

### C. Email & Scheduled Jobs
- **Transactional Email (Resend):** Service is wired to send onboarding, application status changes, and purchase receipts.
  - *Limitation:* Resend API keys are restricted to production serverless execution. Local/staging environments operate with safe fallback logging to prevent unverified sandbox spam.
- **Scheduled Retention & Cleanup:** Retention function `cleanup_old_notifications` verified in migration `20261020000000_inapp_and_push_notifications.sql` with a 90-day expiry threshold.

---

## 5. Verification Commands Run
- `npx tsx scripts/verify_filter_and_sort.ts` $\rightarrow$ Passed (Browser-driven, DOM assertions verified)
- `npx tsx scripts/verify_staging_cross_role_workflow.ts` $\rightarrow$ Passed (9-step cross-role staging run)
- `npm run build` $\rightarrow$ Passed in 15.59s (Vite + TypeScript zero errors)
