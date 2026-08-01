# Sprint 12.1 – Employer Journey End-to-End Functional Validation

This report documents the verification of employer onboarding, company registration, vacancy creation, applicant pipeline management, and hiring workflow.

---

## 1. Employer Step-by-Step Lifecycle Matrix

| Step ID | Employer Journey Stage | Action Trigger | Service / Repository Executed | Supabase DB / Storage Mutation | Validation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EJ-01** | Employer Registration | Form Submit | `authService.signUpEmployer()` | `auth.users` insert, `employers` insert | Verified |
| **EJ-02** | Company Setup | Profile Save | `employerService.upsertCompany()` | `companies` table insert/update | Verified |
| **EJ-03** | Company Logo Upload | File Dropzone | `employerService.uploadLogo()` | `company-logos` storage bucket | Verified |
| **EJ-04** | Vacancy Creation | Create Job Form | `jobsService.createJob()` | `jobs` table row insert | Verified |
| **EJ-05** | Publish Job Listing | Toggle Status | `jobsService.publishJob()` | `jobs.status` set to 'active' | Verified |
| **EJ-06** | Receive Applications | Pipeline View | `pipelineService.getApplications()` | Live application list fetch | Verified |
| **EJ-07** | AI Talent Scout | Search Filter | `talentScoutAdapter.discover()` | Vector candidate candidate matches | Verified |
| **EJ-08** | Shortlist Candidate | Stage Move | `pipelineService.updateStage()` | `applications.stage` set to 'shortlisted' | Verified |
| **EJ-09** | Interview Scheduling | Schedule Modal | `pipelineService.scheduleInterview()` | `interviews` table row insert | Verified |

---

## 2. Summary Results
- **Total Journey Steps Validated**: 9
- **Database Write Failures**: 0
- **Service Integration Failures**: 0
