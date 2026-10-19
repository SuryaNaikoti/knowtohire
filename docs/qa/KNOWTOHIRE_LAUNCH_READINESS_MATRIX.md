# KnowToHire — Launch Readiness Matrix
**Date:** October 19, 2026  
**Evaluation Scope:** Candidate, Employer, Creator, Admin Portals, Security, ATS, Payments, and Notifications  

| Domain / Journey | Target Environment | Scope Status | Genuine Verification Evidence | Launch Readiness |
| :--- | :--- | :---: | :--- | :---: |
| **Candidate Portal** | Local / Staging | Complete | Profile, dashboard, job search, application history, notification bell verified | **READY** |
| **Employer Portal** | Local / Staging | Complete | Enterprise linkage, ATS Kanban board, pipeline stage transitions verified | **READY** |
| **Creator Portal** | Local / Staging | Complete | Creator studio, 70% commission revenue-share terms, template management verified | **READY** |
| **Admin Operations** | Local / Staging | Complete | Super admin auth, broadcast notification center, audience filtering verified | **READY** |
| **Job Search & Filtering** | Local / Browser | Complete | Full-Time filter returned 4 cards. Negative Internship filter returned 0 cards & empty state. | **READY** |
| **Job Sorting & Order** | Local / Browser | Complete | Deterministic sorting by salary descending, salary ascending, and recency confirmed. | **READY** |
| **Cross-Role ATS Cycle** | Staging (`rjjmbuvs...`) | Complete | Candidate applies $\rightarrow$ Employer shortlists $\rightarrow$ Candidate sees update $\rightarrow$ Notification created & read | **READY** |
| **Row Level Security (RLS)** | Staging (`rjjmbuvs...`) | Complete | Unrelated accounts completely blocked from viewing or mutating cross-tenant records | **READY** |
| **In-App Notifications** | Staging / Local | Complete | Supabase Realtime subscription, unread badge increment, flyout display, and mark-as-read | **READY** |
| **Native Web Push** | Client HTTPS | Operational | Service worker registration (`/sw.js`) active; requires manual user OS prompt grant | **CONDITIONAL** |
| **Duplicate Application Defense**| Staging / Local | Operational | Enforced via `applicationService.ts` (409 Conflict); DB composite unique index recommended | **CONDITIONAL** |
| **Payment Gateway** | Razorpay Test Mode | Verified | Standard Checkout integration, signature verification, and idempotency tests passed | **READY** |
| **Transactional Email** | Production Serverless | Operational | Wired to Resend API; test sandbox delivery dependent on verified domain DNS | **CONDITIONAL** |
| **Production Build & Bundle** | CI / Local | Complete | `tsc && vite build` built in 15.59s with zero TypeScript or bundling errors | **READY** |

---

## Metric Breakdown
- **Total Evaluated Workflows:** 14
- **Fully Verified & Ready:** 11
- **Operational with Documented Conditions:** 3 (Web Push interactive prompt, DB-level duplicate index, Email DNS sandbox)
- **Blocked / Broken Workflows:** 0
- **Critical / High Severity Security Bugs:** 0
