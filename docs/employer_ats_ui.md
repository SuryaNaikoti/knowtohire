# KNOWTOHIRE — EMPLOYER ATS & HIRING EXPERIENCE UI DOCUMENTATION

## Executive Overview

The **KnowToHire Employer ATS & Hiring Experience UI** provides talent acquisition managers, recruiters, and hiring managers with a modern recruitment workspace. It integrates hiring activity dashboards, job creation with public listing preview, a 6-stage candidate Kanban ATS pipeline, candidate quick-view drawer, side-by-side candidate comparison, interview scheduling overview, recruitment analytics, company profile management, and ATS settings.

### Employer Positioning Statement
> **"Find better talent. Move candidates forward. Hire with confidence."**

---

## 1. Employer Route Inventory (16 Employer Routes)

| Route Path | Page Component | Key Features |
| :--- | :--- | :--- |
| `/employer` | `EmployerDashboardPage.tsx` | Operational overview, welcome header ("Good morning, Priya"), 4 KPI cards, hiring funnel, candidate pipeline preview & interview cards |
| `/employer/jobs` | `EmployerJobsPage.tsx` | Active, draft, paused, and closed job postings grid with applicant metrics (`84 Applicants`) and quick edit actions |
| `/employer/jobs/new` | `EmployerCreateJobPage.tsx` | Polished job creation form with basic info, INR compensation (`₹24L – ₹32L/yr`), skills, public listing preview modal, and publish UI |
| `/employer/jobs/:id` | `EmployerJobDetailsPage.tsx` | Detailed job performance summary, candidate metrics & job-specific pipeline board |
| `/employer/jobs/:id/edit` | `EmployerEditJobPage.tsx` | Edit active job listing form populated with mock data |
| `/employer/jobs/:id/applicants` | `EmployerJobApplicantsPage.tsx` | Enterprise applicants table (44px dense rows) with search, stage filters & slide-over candidate drawer |
| `/employer/candidates` | `EmployerCandidatesPage.tsx` | Candidate discovery workspace with skill search, match score badges (`96%`), and quick view trigger |
| `/employer/candidates/:id` | `EmployerCandidateDetailsPage.tsx` | Detailed recruiter candidate profile with "Why This Candidate Matches" breakdown, resume paper preview & action bar |
| `/employer/candidates/compare` | `EmployerCandidateComparePage.tsx` | Side-by-side candidate comparison workspace for 2–4 candidates across skills, match scores, experience & availability |
| `/employer/pipeline` | `EmployerPipelinePage.tsx` | Dedicated 6-column Kanban ATS board (`New`, `Screening`, `Shortlisted`, `Interview`, `Offer`, `Hired`) with quick drawer |
| `/employer/interviews` | `EmployerInterviewsPage.tsx` | Recruiter interview management list/calendar hybrid with candidate, date, time & interviewer details |
| `/employer/saved-candidates` | `EmployerSavedCandidatesPage.tsx` | Saved candidate bench grid & empty state component |
| `/employer/analytics` | `EmployerAnalyticsPage.tsx` | Enterprise recruitment analytics workspace with date range selector, applicant inflow SVG chart & channel attribution |
| `/employer/company-profile` | `EmployerCompanyProfilePage.tsx` | Employer profile preview with company identity, culture perks & public listing link |
| `/employer/notifications` | `EmployerNotificationsPage.tsx` | Employer notification center with categories (application, interview, pipeline) |
| `/employer/settings` | `EmployerSettingsPage.tsx` | ATS settings with recruiter profile, company settings, recruitment alerts & danger zone styling |

---

## 2. Employer Components (`src/components/employer/`)

- `EmployerShell.tsx`: Master authenticated employer portal shell.
- `EmployerHeader.tsx`: ATS header with page title, company name, `Cmd+K` command search, notification badge, and recruiter avatar.
- `EmployerSidebar.tsx`: Navigation sidebar with active state highlights (`#4F46E5` Indigo) and "+ Post a Job" primary CTA.
- `HiringOverview.tsx`: Dashboard overview welcome banner.
- `HiringKPIGrid.tsx`: 4 KPI cards (Active Jobs `8`, Total Applicants `246`, Interviews `14`, Shortlisted `32`).
- `HiringFunnel.tsx`: Visual 6-stage hiring funnel (Applicants `246` → Screened `124` → Shortlisted `32` → Interviews `14` → Offers `4` → Hired `2`).
- `CandidatePipeline.tsx` & `CandidatePipelineCard.tsx`: 6-column Kanban board container and candidate card items.
- `CandidateQuickView.tsx`: Slide-over candidate quick view drawer with match score breakdown, resume preview button, and shortlist action.
- `JobPostingCard.tsx`: Job posting card with applicant counts & status pills.
- `InterviewCard.tsx`: Recruiter interview item card.
- `AnalyticsChart.tsx`: Applicant volume trend SVG chart.

---

## 3. Employer Mock Persona & Company (`src/data/employerMockData.ts`)

- **Employer User**: Priya Nair (Talent Acquisition Manager, Acme Sustainability Pvt. Ltd.).
- **Company**: Acme Sustainability Pvt. Ltd. (Environmental & ESG Consulting, Bengaluru, Karnataka).
- **Salary Figures**: Indian Rupees (`₹24L – ₹32L/yr`, `₹28L – ₹36L/yr`, `₹15L – ₹22L/yr`).
- **Candidates**: 10 Indian professional mock candidates across 6 ATS pipeline stages.

---

## 4. Responsive & Accessibility Standards (WCAG 2.2 AA)

- **Desktop (1440px / 1280px)**: 2-column sidebar layout, dense 44px data tables, 6-column Kanban pipeline, 4-column comparison workspace.
- **Mobile (430px / 375px)**: Single-column card flow, mobile drawer navigation, stacked candidate comparison, touch targets ≥ 44px.
- **Accessibility**: WCAG 2.2 AA compliant focus states, accessible button labels, non-color dependent status badges.
