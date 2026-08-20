# KNOWTOHIRE — CANDIDATE EXPERIENCE UI DOCUMENTATION

## Executive Overview

The **KnowToHire Candidate Experience UI** has been built as an authenticated-product-style portal. It enables candidates to manage their professional profile, review ATS resume compatibility, explore tailored job recommendations with match scores (`96%`), track 5-stage application lifecycles, and explore career intelligence pathways in India.

### Candidate Positioning Statement
> **"I can clearly understand where I am, what opportunities fit me, and what I should do next."**

---

## 1. Candidate Route Inventory (11 Candidate Routes)

| Route Path | Page Component | Key Features |
| :--- | :--- | :--- |
| `/candidate` | `CandidateDashboardPage.tsx` | Overview, welcome header ("Good morning, Aarav"), profile strength (`88%`), 4 KPI cards, active application tracker, recommended jobs & career intelligence |
| `/candidate/profile` | `CandidateProfilePage.tsx` | Candidate header summary, work experience timeline, education, skills, certifications & edit profile modal preview |
| `/candidate/resume` | `CandidateResumePage.tsx` | Active resume card (`Aarav_Mehta_ESG_Consultant.pdf`), ATS score analysis (`87%`), keyword breakdown & replace resume modal |
| `/candidate/jobs` | `CandidateJobsPage.tsx` | Authenticated job discovery feed with keyword search, location filter, and AI match score badges |
| `/candidate/jobs/:id` | `CandidateJobDetailsPage.tsx` | Job details view featuring "Why This Job Matches You" breakdown (94% skills, 91% experience, 100% location), salary band in INR, and apply modal preview |
| `/candidate/saved-jobs` | `CandidateSavedJobsPage.tsx` | Saved job listings & empty state component ("No saved jobs yet") |
| `/candidate/applications` | `CandidateApplicationsPage.tsx` | Major application tracking page with stage count summary (Total 12, Screening 4, Interviews 3, Offer 1) and status cards |
| `/candidate/applications/:id` | `CandidateApplicationDetailsPage.tsx` | Single application details with 5-stage timeline, interview schedule widget, and attached resume |
| `/candidate/career-insights` | `CandidateCareerInsightsPage.tsx` | Visual career progression path (Environmental Consultant → ESG Manager → Sustainability Strategy Lead), skill strengths, and `SkillGapCard` |
| `/candidate/notifications` | `CandidateNotificationsPage.tsx` | Notification list with categories (interview, recommendation, application, insight) and read/unread states |
| `/candidate/settings` | `CandidateSettingsPage.tsx` | Candidate settings with account information, job alerts toggle, profile discovery toggle & danger zone styling |

---

## 2. Candidate Components (`src/components/candidate/`)

- `CandidateShell.tsx`: Master authenticated product shell.
- `CandidateHeader.tsx`: Header with breadcrumb, `Cmd+K` command search, notification badge, and candidate avatar.
- `CandidateSidebar.tsx`: Navigation sidebar with active state highlights (`#4F46E5` Indigo).
- `ProfileCompletionCard.tsx`: Profile completeness progress bar & action CTA.
- `CandidateKPIGrid.tsx`: 4 KPI cards (Applications Sent `12`, Interviews Scheduled `3`, Saved Jobs `18`, Profile Strength `88%`).
- `ApplicationTracker.tsx`: 5-stage application timeline (`Applied` → `Screening` → `Technical Interview` → `Final HR` → `Offer`).
- `SkillGapCard.tsx`: Skill gap progress bar (`58%` current vs `75%` target) with recommended study resource.
- `ApplicationCard.tsx`: Interactive application card with status badge.
- `ResumeCard.tsx`: Active resume card with ATS score (`87%`).
- `NotificationItem.tsx`: Notification item.

---

## 3. Candidate Mock Profile Standard (`src/data/candidateMockData.ts`)

- **Candidate**: Aarav Mehta (Environmental & ESG Consultant, Hyderabad, Telangana).
- **Salary Figures**: Indian Rupees (`₹18.5L/yr`, `₹24L - ₹32L/yr`, `₹28L - ₹36L/yr`).
- **ATS Score**: `87%` compatibility.
- **Match Score**: `96%` match.

---

## 4. Responsive & Accessibility Standards

- **Desktop (1440px / 1280px)**: 2-column sidebar layout, spacious dashboard stream.
- **Mobile (430px / 375px)**: Single-column flow, mobile drawer navigation, touch targets ≥ 44px.
- **Accessibility**: WCAG 2.2 AA compliant focus states, accessible button labels, high contrast ratios.
