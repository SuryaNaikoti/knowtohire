# KnowToHire — Route Audit & RBAC Protection Matrix

## Complete Route Verification Map

| Route URL | Guard Type | Allowed Roles | Target Page Component | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Public | All | `HomePage` | Verified |
| `/jobs` | Public | All | `JobsPage` | Verified |
| `/jobs/:id` | Public | All | `JobDetailsPage` | Verified |
| `/careers` | Public | All | `CareersPage` | Verified |
| `/knowledge` | Public | All | `KnowledgePage` | Verified |
| `/knowledge/:id` | Public | All | `ResourceDetailsPage` | Verified |
| `/templates` | Public | All | `TemplatesPage` | Verified |
| `/templates/:id` | Public | All | `TemplateDetailsPage` | Verified |
| `/blog` | Public | All | `BlogPage` | Verified |
| `/blog/:slug` | Public | All | `BlogDetailsPage` | Verified |
| `/pricing` | Public | All | `PricingPage` | Verified |
| `/about` | Public | All | `AboutPage` | Verified |
| `/contact` | Public | All | `ContactPage` | Verified |
| `/privacy` | Public | All | `PrivacyPage` | Verified |
| `/terms` | Public | All | `TermsPage` | Verified |
| `/login` | Guest Only | Unauthenticated | `LoginPage` | Verified |
| `/register` | Guest Only | Unauthenticated | `RegisterPage` | Verified |
| `/forgot-password` | Guest Only | Unauthenticated | `ForgotPasswordPage` | Verified |
| `/reset-password` | Public | All | `ResetPasswordPage` | Verified |
| `/verify-email` | Public | All | `VerifyEmailPage` | Verified |
| `/auth/callback` | Public | All | `AuthCallbackPage` | Verified |
| `/onboarding/candidate` | Protected + RoleGuard | `candidate` | `CandidateOnboardingPage` | Verified |
| `/onboarding/employer` | Protected + RoleGuard | `employer` | `EmployerOnboardingPage` | Verified |
| `/candidate` | Protected + RoleGuard | `candidate` | `CandidateDashboardPage` | Verified |
| `/candidate/profile` | Protected + RoleGuard | `candidate` | `CandidateProfilePage` | Verified |
| `/candidate/resume` | Protected + RoleGuard | `candidate` | `CandidateResumePage` | Verified |
| `/candidate/jobs` | Protected + RoleGuard | `candidate` | `CandidateJobsPage` | Verified |
| `/candidate/jobs/:id` | Protected + RoleGuard | `candidate` | `CandidateJobDetailsPage` | Verified |
| `/candidate/saved-jobs` | Protected + RoleGuard | `candidate` | `CandidateSavedJobsPage` | Verified |
| `/candidate/applications`| Protected + RoleGuard | `candidate` | `CandidateApplicationsPage` | Verified |
| `/candidate/applications/:id` | Protected + RoleGuard | `candidate` | `CandidateApplicationDetailsPage` | Verified |
| `/candidate/interviews` | Protected + RoleGuard | `candidate` | `CandidateInterviewsPage` | Verified |
| `/candidate/career-insights` | Protected + RoleGuard | `candidate` | `CandidateCareerInsightsPage` | Verified |
| `/candidate/requests` | Protected + RoleGuard | `candidate` | `CandidateRequestsPage` | Verified |
| `/candidate/notifications` | Protected + RoleGuard | `candidate` | `CandidateNotificationsPage` | Verified |
| `/candidate/settings` | Protected + RoleGuard | `candidate` | `CandidateSettingsPage` | Verified |
| `/employer` | Protected + RoleGuard | `employer` | `EmployerDashboardPage` | Verified |
| `/employer/jobs` | Protected + RoleGuard | `employer` | `EmployerJobsPage` | Verified |
| `/employer/jobs/new` | Protected + RoleGuard | `employer` | `EmployerCreateJobPage` | Verified |
| `/employer/jobs/:id` | Protected + RoleGuard | `employer` | `EmployerJobDetailsPage` | Verified |
| `/employer/jobs/:id/edit` | Protected + RoleGuard | `employer` | `EmployerEditJobPage` | Verified |
| `/employer/jobs/:id/applicants` | Protected + RoleGuard | `employer` | `EmployerJobApplicantsPage` | Verified |
| `/employer/candidates` | Protected + RoleGuard | `employer` | `EmployerCandidatesPage` | Verified |
| `/employer/candidates/:id` | Protected + RoleGuard | `employer` | `EmployerCandidateDetailsPage` | Verified |
| `/employer/candidates/compare` | Protected + RoleGuard | `employer` | `EmployerCandidateComparePage` | Verified |
| `/employer/pipeline` | Protected + RoleGuard | `employer` | `EmployerPipelinePage` | Verified |
| `/employer/interviews` | Protected + RoleGuard | `employer` | `EmployerInterviewsPage` | Verified |
| `/employer/saved-candidates` | Protected + RoleGuard | `employer` | `EmployerSavedCandidatesPage` | Verified |
| `/employer/analytics` | Protected + RoleGuard | `employer` | `EmployerAnalyticsPage` | Verified |
| `/employer/company-profile` | Protected + RoleGuard | `employer` | `EmployerCompanyProfilePage` | Verified |
| `/employer/notifications` | Protected + RoleGuard | `employer` | `EmployerNotificationsPage` | Verified |
| `/employer/settings` | Protected + RoleGuard | `employer` | `EmployerSettingsPage` | Verified |
| `/admin` | Protected + RoleGuard | `admin` | `AdminDashboardPage` | Verified |
| `/admin/users` | Protected + RoleGuard | `admin` | `AdminUsersPage` | Verified |
| `/admin/employers` | Protected + RoleGuard | `admin` | `AdminEmployersPage` | Verified |
| `/admin/jobs` | Protected + RoleGuard | `admin` | `AdminJobsPage` | Verified |
| `/admin/resources` | Protected + RoleGuard | `admin` | `AdminResourcesPage` | Verified |
| `/admin/templates` | Protected + RoleGuard | `admin` | `AdminTemplatesPage` | Verified |
| `/admin/requests` | Protected + RoleGuard | `admin` | `AdminRequestsPage` | Verified |
| `/admin/blog` | Protected + RoleGuard | `admin` | `AdminBlogPage` | Verified |
