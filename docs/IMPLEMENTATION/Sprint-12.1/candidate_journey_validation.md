# Sprint 12.1 – Candidate Journey End-to-End Functional Validation

This report documents the step-by-step verification of the complete candidate lifecycle from registration to job offer.

---

## 1. Candidate Step-by-Step Lifecycle Matrix

| Step ID | Candidate Journey Stage | Action Trigger | Service / Repository Executed | Supabase DB / Storage Mutation | Validation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CJ-01** | Account Registration | Form Submit | `authService.signUpCandidate()` | `auth.users` insert, `profiles` insert | Verified |
| **CJ-02** | Login Session | Auth Submit | `authService.signIn()` | JWT session token issued | Verified |
| **CJ-03** | Profile Setup | Form Submit | `candidateService.updateProfile()` | `candidates` table row update | Verified |
| **CJ-04** | Experience Timeline | Add Experience | `candidateService.upsertExperience()` | `experience` table insert/update | Verified |
| **CJ-05** | Education Qualifications | Add Education | `candidateService.upsertEducation()` | `education` table insert/update | Verified |
| **CJ-06** | Skill Competencies | Toggle Badges | `candidateService.upsertSkill()` | `skills` table insert/update | Verified |
| **CJ-07** | Resume PDF Upload | File Dropzone | `ResumeService.uploadResume()` | Supabase `resumes` storage bucket upload | Verified |
| **CJ-08** | Resume Parsing | Auto Parse | `ResumeAnalyzerService.parsePDF()` | Structural text extraction | Verified |
| **CJ-09** | AI Resume Analysis | Trigger Score | `careerIntelligenceService.analyze()` | ATS Score & keyword breakdown | Verified |
| **CJ-10** | Smart Job Matching | Match Vector | `JobMatchingEngine.matchJobs()` | Top matched vacancy vector results | Verified |
| **CJ-11** | Save Vacancy | Click Bookmark | `candidateService.toggleSaveJob()` | `saved_jobs` table insert/delete | Verified |
| **CJ-12** | One-Click Application | Apply Button | `ApplicationService.submitApp()` | `applications` table row insert | Verified |
| **CJ-13** | Application Tracking | Pipeline View | `ApplicationService.getApps()` | Realtime application stage fetch | Verified |

---

## 2. Summary Results
- **Total Journey Steps Validated**: 13
- **Database Write Failures**: 0
- **Service Integration Failures**: 0
