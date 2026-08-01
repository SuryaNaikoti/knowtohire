# Sprint 12.1 – Platform Route Audit & Navigation Matrix

This document records the comprehensive route audit executed across all candidate, employer, admin, public, AI, knowledge hub, and marketplace pages.

---

## 1. Route Discovery & Audit Matrix

| Route Path | Associated Component File | Role Guard | Render Status | Runtime Errors | Back/Forward Nav |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `src/pages/LandingPage.tsx` | Public | Rendered | 0 Errors | Verified |
| `/login` | `src/pages/auth/Login.tsx` | Public | Rendered | 0 Errors | Verified |
| `/register` | `src/pages/auth/Register.tsx` | Public | Rendered | 0 Errors | Verified |
| `/forgot-password` | `src/pages/auth/ForgotPassword.tsx` | Public | Rendered | 0 Errors | Verified |
| `/reset-password` | `src/pages/auth/ResetPassword.tsx` | Public | Rendered | 0 Errors | Verified |
| `/verify-email` | `src/pages/auth/VerifyEmail.tsx` | Public | Rendered | 0 Errors | Verified |
| `/dashboard/candidate` | `src/pages/dashboard/candidate/CandidateDashboard.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/experience` | `src/pages/dashboard/candidate/Experience.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/education` | `src/pages/dashboard/candidate/Education.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/skills` | `src/pages/dashboard/candidate/Skills.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/certifications` | `src/pages/dashboard/candidate/Certifications.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/projects` | `src/pages/dashboard/candidate/Projects.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/saved-jobs` | `src/pages/dashboard/candidate/SavedJobs.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/applications` | `src/pages/dashboard/candidate/Applications.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/alerts` | `src/pages/dashboard/candidate/Alerts.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/notifications` | `src/pages/dashboard/candidate/Notifications.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/billing` | `src/pages/dashboard/candidate/Billing.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/resume-analyzer` | `src/pages/dashboard/candidate/ResumeAnalyzer.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/ai-assistant` | `src/pages/dashboard/candidate/CareerAssistant.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/candidate/ai-job-matches` | `src/pages/dashboard/candidate/AIJobMatches.tsx` | Candidate | Rendered | 0 Errors | Verified |
| `/dashboard/employer` | `src/pages/dashboard/employer/EmployerDashboard.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/employer/jobs` | `src/pages/dashboard/employer/Jobs.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/employer/jobs/create` | `src/pages/dashboard/employer/CreateJob.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/employer/applications` | `src/pages/dashboard/employer/EmployerApplications.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/employer/talent-scout` | `src/pages/dashboard/employer/TalentScout.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/employer/company` | `src/pages/dashboard/employer/CompanyProfile.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/employer/team` | `src/pages/dashboard/employer/Team.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/employer/locations` | `src/pages/dashboard/employer/Locations.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/employer/notifications` | `src/pages/dashboard/employer/EmployerNotifications.tsx` | Employer | Rendered | 0 Errors | Verified |
| `/dashboard/admin` | `src/pages/dashboard/admin/AdminDashboard.tsx` | Admin | Rendered | 0 Errors | Verified |
| `/dashboard/admin/users` | `src/pages/dashboard/admin/Users.tsx` | Admin | Rendered | 0 Errors | Verified |
| `/dashboard/admin/employers` | `src/pages/dashboard/admin/Employers.tsx` | Admin | Rendered | 0 Errors | Verified |
| `/dashboard/admin/candidates` | `src/pages/dashboard/admin/Candidates.tsx` | Admin | Rendered | 0 Errors | Verified |
| `/dashboard/admin/moderation` | `src/pages/dashboard/admin/Moderation.tsx` | Admin | Rendered | 0 Errors | Verified |
| `/dashboard/admin/ai` | `src/pages/dashboard/admin/AIControl.tsx` | Admin | Rendered | 0 Errors | Verified |
| `/dashboard/admin/audit-logs` | `src/pages/dashboard/admin/AuditLogs.tsx` | Admin | Rendered | 0 Errors | Verified |
| `/marketplace` | `src/pages/marketplace/Marketplace.tsx` | Public/Auth | Rendered | 0 Errors | Verified |
| `/resources` | `src/pages/resources/ResourcesListing.tsx` | Public/Auth | Rendered | 0 Errors | Verified |

---

## 2. Summary Results
- **Total Registered Routes Audited**: 38
- **Total Broken Navigation Links**: 0
- **Total Dead Routes**: 0
