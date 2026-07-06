# Google OAuth E2E Test Report

**Generated:** 2026-07-06  
**Status:** 🟢 PASSED  

## 1. Candidate OAuth Journey
- **Google Sign-up:** Clerk redirects to Google, returns a valid auth token, and creates a user session.
- **Supabase Integration:** Trigger automatically inserts profile record to `profiles` table.
- **Onboarding:** Selection of Candidate role registers correct attributes.
- **Resume Upload & AI Services:** Successfully uploaded files and executed resume checks, job matches, and interview simulator queries under the OAuth profile.

## 2. Employer OAuth Journey
- **Role Selection:** Registers Employer role.
- **Company Profile:** Successfully links company details to user ID.
- **Jobs & Orders:** Created job postings and purchased developer subscriptions under the OAuth session.

## 3. Admin OAuth Journey
- **Role Elevation:** Manually elevated profile role to `super_admin` in `profiles`.
- **Admin CMS & Logs:** Fully accessible. Telemetry metrics show active requests.
