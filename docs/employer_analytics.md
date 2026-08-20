# KNOWTOHIRE — MODULE 02: JOB PORTAL & RECRUITMENT
## EMPLOYER RECRUITMENT ANALYTICS & HIRING FUNNEL SPECIFICATION

**Document Version:** 1.0.0  
**Module:** Module 02 — Task 08 (Employer Analytics & Hiring Funnel Aggregations)  
**Integrated Pages & Components:**
- [`/employer/analytics`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerAnalyticsPage.tsx) — Full Recruitment Performance Dashboard with Multi-Period Filters & Requisition Breakdown Table
- [`/employer`](file:///e:/Projects/KnowToHire/src/pages/employer/EmployerDashboardPage.tsx) — Employer Overview Dashboard with Live KPIs & Real-Time Funnel
- [`HiringKPIGrid`](file:///e:/Projects/KnowToHire/src/components/employer/HiringKPIGrid.tsx) — Reusable Operational KPI Cards (Active Jobs, Total Applicants, Interviews, Shortlisted)
- [`HiringFunnel`](file:///e:/Projects/KnowToHire/src/components/employer/HiringFunnel.tsx) — 6-Stage Progressive Hiring Conversion Funnel
- [`AnalyticsChart`](file:///e:/Projects/KnowToHire/src/components/employer/AnalyticsChart.tsx) — Responsive SVG Trend Bar Chart for Candidate Inflow  
**Backend Service:** [`src/services/analyticsService.ts`](file:///e:/Projects/KnowToHire/src/services/analyticsService.ts)  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

Task 08 connects the Employer Analytics and Hiring Funnel metrics to live Supabase backend data. All mock constants, hardcoded funnel numbers, and static trend arrays have been replaced with authenticated, company-scoped SQL aggregations.

---

## 2. Implemented Analytics Services

### 2.1 Recruitment Overview (`getRecruitmentOverview`)
Aggregates high-level recruitment KPIs scoped to the authenticated employer's company:
- `totalApplicants`: Total count of candidate applications received in the selected window.
- `activeJobs`: Total published job requisitions (`jobs.status = 'published'`).
- `interviewsTotal` & `interviewsScheduled`: Completed and upcoming interview rounds.
- `shortlistedCount`: Applications at `shortlisted` stage.
- `offersCount`: Applications at `offer` stage.
- `hiredCount`: Applications at `hired` stage.
- `avgTimeToHireDays`: Average duration from application submission to hire completion.
- `hireConversionRate`: Percentage of total applicants converted to hires.
- `interviewConversionRate`: Percentage of applicants progressing to interview or beyond.

### 2.2 Progressive Hiring Funnel (`getHiringFunnel`)
Calculates candidate volume across the 6 core recruitment stages:
1. `Applicants` (`new`): Total candidate intake.
2. `Screened` (`screening`): Applications progressing to recruiter screening.
3. `Shortlisted` (`shortlisted`): Selected candidates for interview loops.
4. `Interviews` (`interview`): Conducted technical and behavioral rounds.
5. `Offers` (`offer`): Employment offers extended.
6. `Hired` (`hired`): Successfully completed hires.

Calculates:
- `percentageOfTotal`: Share of top-of-funnel intake.
- `conversionFromPrevious`: Step-by-step conversion efficiency from the immediate preceding stage.

### 2.3 Candidate Inflow Dynamics (`getApplicantTrend`)
Generates time-bucketed applicant inflow points:
- **7 Days:** Daily discrete buckets.
- **30 Days:** Weekly rolling buckets (`Week 1` through `Week 4`).
- **90 Days / 6 Months / 12 Months:** Monthly aggregation buckets.

### 2.4 Time to Hire (`getTimeToHire`)
- **Metric Formula:** $\text{Duration} = \text{updated\_at} - \text{applied\_at}$ for all applications in `hired` stage.
- **Computed Indicators:**
  - Average time to hire (Days).
  - Median time to hire (Days).
  - Fastest completed hire.
  - Longest completed hire.
  - Total hires analyzed.

### 2.5 Requisition Performance Table (`getJobPerformance`)
Per-requisition recruitment breakdown:
- Job Title, Department, and Status badge.
- Application volume, shortlisted count, interviews conducted, and total hires.
- Calculated conversion percentage per opening.

### 2.6 Source Attribution Transparency
- Inspects database schema: source attribution / UTM tagging is currently disabled for candidate applications.
- Displays an honest notification card explaining that all candidate applications are direct platform applications.

---

## 3. Date Filtering & Query Constraints

Supported time ranges:
- `7days` (Last 7 days)
- `30days` (Last 30 days — default)
- `90days` (Last 90 days / Quarter)
- `6months` (Last 6 months / Half-year)
- `12months` (Last 12 months / Annual)
- `all` (All Time)

Date boundaries are evaluated on `applied_at >= startDate`.

---

## 4. Multi-Tenant Security & Isolation

- **Authoritative Identity:** `analyticsService` resolves `company_id` from `company_profiles` via `supabase.auth.getUser()`.
- **Database RLS Policies:**
  - `jobs_select_employer_own_company`
  - `job_applications_select_employer`
  - `interviews_select_employer`
- **Zero Cross-Tenant Leakage:** An employer never receives candidate metrics, application counts, or interview volume belonging to another organization.

---

## 5. Next Task

- **Module 02 — Task 09:** End-to-End Verification, Security Testing & Regression Certification across all public marketplace, candidate application, employer ATS, and analytics workflows.
