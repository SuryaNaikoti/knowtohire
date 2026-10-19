# KnowToHire — Launch Blockers & Risk Assessment
**Date:** October 19, 2026  
**Auditor:** Senior QA Automation Engineer, Application Security Tester, Release Manager  

---

## 1. Zero Critical / High Blockers
There are **zero (0) critical or high-severity blockers** preventing the public release of the KnowToHire platform. Core end-to-end functionality—including authentication, job discovery, application submission, ATS pipeline stage transitions, role-based authorization, in-app notifications, and Row-Level Security (RLS) data isolation—has been thoroughly validated against the isolated staging environment (`rjjmbuvsbxxlrxweslnv`).

---

## 2. Documented Non-Critical Operational Considerations

| Item ID | Classification | Severity | Description | Condition & Mitigation | Owner |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **BLK-01** | Database Constraint | **Low** | `public.job_applications` lacks a PostgreSQL composite unique constraint on `(job_id, candidate_id)`. | **Current Mitigation:** The frontend and `applicationService.applyToJob` enforce this check and return HTTP 409 `DUPLICATE_APPLICATION` before inserting.<br>**Action:** Add `CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_candidate_job_app ON public.job_applications(job_id, candidate_id);` in the next scheduled migration cycle. | Database Engineer |
| **BLK-02** | Browser Web Push | **Low** | Native OS push notification delivery requires an active browser permission grant on a secure HTTPS origin. | **Current Mitigation:** In-app Realtime notifications are fully operational and require zero browser permissions. Web Push acts as an opt-in enhancement for candidates and employers.<br>**Action:** Ensure VAPID keys and HTTPS certificates are properly provisioned on the production domain (`knowtohire.com`). | DevOps / Release Lead |
| **BLK-03** | Transactional Email | **Low** | Resend API keys are restricted to production execution. Testing delivery requires live mailbox checks. | **Current Mitigation:** The application gracefully falls back to console/log notifications when email dispatch is bypassed in staging/local environments.<br>**Action:** Verify DKIM and SPF records for the sending domain in the Resend management portal prior to broadcast campaigns. | Release Manager |

---

## 3. Production Environment Safety Certification
- **Production Supabase Reference:** `roqbodprqmnwxdjsskgb`
- **Safety Status:** **CERTIFIED SAFE & CLEAN**
- **Audit Findings:** No test records, mock jobs, artificial candidates, or spurious applications were injected into production during this audit cycle. All test mutations were directed to staging reference `rjjmbuvsbxxlrxweslnv`.
