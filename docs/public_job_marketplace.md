# KNOWTOHIRE — MODULE 02: JOB PORTAL & RECRUITMENT
## PUBLIC JOB MARKETPLACE SUPABASE INTEGRATION SPECIFICATION

**Document Version:** 1.0.0  
**Module:** Module 02 — Task 04 (Public Marketplace Integration)  
**Integrated Pages:**
- [`/jobs`](file:///e:/Projects/KnowToHire/src/pages/public/JobsPage.tsx) — Main Public Job Discovery & Search Feed
- [`/jobs/:id`](file:///e:/Projects/KnowToHire/src/pages/public/JobDetailsPage.tsx) — Single Requisition Public Detail & Overview View
- [`/careers`](file:///e:/Projects/KnowToHire/src/pages/public/CareersPage.tsx) — Career Specialization Domains Hub
- [`FeaturedJobs`](file:///e:/Projects/KnowToHire/src/components/public/FeaturedJobs.tsx) — Homepage Featured Verified Listings Component  
**Shared Card Component:** [`src/components/cards/JobCard.tsx`](file:///e:/Projects/KnowToHire/src/components/cards/JobCard.tsx)  
**Backend Service:** [`src/services/jobService.ts`](file:///e:/Projects/KnowToHire/src/services/jobService.ts)  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

Task 04 connects the public-facing Job Marketplace and Career discovery surfaces to live Supabase backend data through `jobService`. All static mock data arrays have been replaced with real database queries while preserving the finalized visual design, Manrope typography, and animations.

---

## 2. Public Route Integrations

### 2.1 Jobs Marketplace Feed (`/jobs`)
- **Service Operation:** `jobService.getPublishedJobs(filters)`
- **Search & Filters:**
  - Keyword search (searches `title`, `department`, `description` via PostgreSQL `ilike` / `or`).
  - City / State location selector (`Bengaluru`, `Hyderabad`, `Mumbai`, `Delhi NCR`, `Pune`, `Chennai`, `Kolkata`).
  - Employment type selector (`full_time`, `hybrid`, `contract`, `part_time`, `internship`).
  - Sort ordering (`latest`, `salary_high`, `salary_low`, `deadline`).
- **URL Parameter Synchronization:**
  - Real-time synchronization of filter states with browser search parameters (`/jobs?q=ESG&location=Hyderabad&type=full_time&sort=salary_high&page=1`).
  - Deep-linking and shareable search URLs.
- **Loading State:** 6 pulse skeleton cards preserving the 3-column responsive layout.
- **Empty State:** Clean illustrated card with a "Clear All Filters" reset trigger when 0 results are returned.
- **Error Handling:** Integrated `Alert variant="error"` displaying sanitized messages and a **Retry** action button.
- **Pagination:** Responsive pagination controls displaying current page and total available pages.

---

### 2.2 Job Details Page (`/jobs/:id`)
- **Service Operation:** `jobService.getPublishedJobById(jobId)`
- **Data Display:**
  - Real job title, enterprise company name, location, and verified badges.
  - Formatted INR salary band (`formatINR`).
  - Key responsibilities, qualifications, required skills tags, and benefits pills.
  - Enterprise summary sidebar (department, category, location, experience level, posted date, application deadline).
- **Public Access:** Accessible by unauthenticated public users and authenticated users alike.
- **Non-Existent / Unpublished Handling:** Renders a clean "Position Not Found" state with a "Browse All Jobs" fallback action.
- **Apply Action Boundary:** Opens informative dialog instructing user to sign in to submit candidate profile (full one-click application submission connects in Task 05).

---

### 2.3 Careers Domains Page (`/careers`)
- Direct links from category cards (`ESG & Sustainability`, `Renewable Energy`, etc.) route directly to `/jobs?category=<Domain>` to filter the public marketplace feed by that specialization.

---

### 2.4 Homepage Featured Openings (`FeaturedJobs.tsx`)
- Fetches the top 6 most recent published jobs dynamically via `jobService.getPublishedJobs({ pageSize: 6, sort_by: 'latest' })` with loading skeleton fallbacks.

---

## 3. Security & Governance Verification

1. **Only Published Jobs Visible:** Every public query enforces `status = 'published'` at the service layer and via database RLS (`jobs_select_public_published`). Draft, paused, and closed requisitions are never accessible to public users.
2. **Zero Service-Role Keys:** All requests execute through standard Supabase anon/session tokens.
3. **No Direct Supabase Calls in UI:** All interactions are strictly mediated by `jobService`.
4. **No UI Regression:** Approved design system, Manrope typography hierarchy, and interactive card hover transitions are 100% preserved.

---

## 4. Next Task

- **Module 02 — Task 05:** Candidate Applications & Saved Jobs Integration (one-click `ApplyModal` with resume attachment, duplicate application prevention, application tracker at `/candidate/applications`, and bookmark sync at `/candidate/saved-jobs`).
