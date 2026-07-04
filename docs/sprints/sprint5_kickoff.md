# KnowToHire – Sprint 5 Kickoff Document

**Sprint:** 5  
**Branch:** `sprint5-candidate-portal`  
**Start Date:** 2026-07-05  
**Target Tag:** `v0.6-candidate-portal`  
**Repository:** https://github.com/SuryaNaikoti/knowtohire

---

## 🎯 Sprint Goal

> **Complete the Candidate Portal and prepare the Employer Portal.**
>
> At the end of Sprint 5, candidates must be able to fully manage their profile,
> browse and apply for jobs, track applications, and showcase their professional
> portfolio — all connected to live Supabase data with no mock data remaining.

---

## 📋 Sprint Scope

### 1. Dashboard Widgets
- [ ] Live stats: applications submitted, saved jobs, profile views
- [ ] Profile completeness percentage (live calculation from DB)
- [ ] Recent activity feed
- [ ] Quick action cards (Apply, Upload Resume, Browse Jobs)

### 2. Profile Completion
- [ ] Profile completion meter driven by real DB fields
- [ ] Missing field prompts with direct navigation
- [ ] Profile visibility toggle (public / private)
- [ ] Avatar / photo upload with Supabase Storage
- [ ] Bio, headline, and summary fields with character limits

### 3. Resume Upload
- [ ] Supabase Storage integration for file upload
- [ ] PDF upload with file size validation (max 5MB)
- [ ] Resume preview link
- [ ] Resume replace / delete functionality
- [ ] Upload progress indicator

### 4. Skills Management
- [ ] Skill badge selector with search and filter
- [ ] Add / remove skills
- [ ] Skill proficiency levels (Beginner / Intermediate / Expert)
- [ ] Career domain tagging
- [ ] Save to `candidate_skills` table via `candidateService`

### 5. Experience Management
- [ ] Add / edit / delete work experience entries
- [ ] Company name, role, start/end dates, description
- [ ] Current position toggle (suppresses end date)
- [ ] Sort by most recent
- [ ] Persist to `candidate_experience` table

### 6. Education Management
- [ ] Add / edit / delete education entries
- [ ] Institution, degree, field of study, year
- [ ] Persist to `candidate_education` table

### 7. Certifications
- [ ] Add / edit / delete certifications
- [ ] Certificate name, issuing org, issue date, credential URL
- [ ] Persist to `candidate_certifications` table

### 8. Projects Portfolio
- [ ] Add / edit / delete portfolio projects
- [ ] Project title, description, tech stack, URL, image
- [ ] Supabase Storage for project thumbnails
- [ ] Persist to `candidate_portfolio` table (or existing structure)

### 9. Saved Jobs
- [ ] Save / unsave jobs from job listing and job detail pages
- [ ] Saved jobs list in dashboard with remove option
- [ ] Persist to `saved_jobs` table

### 10. Job Alerts
- [ ] Alert preferences: keyword, location, job type, domain
- [ ] Notification frequency setting (daily / weekly)
- [ ] Persist alert preferences to DB

### 11. Notification Center
- [ ] In-app notification list
- [ ] Mark as read / unread
- [ ] Notification types: application updates, job matches, system
- [ ] Badge count in dashboard header
- [ ] Persist to `notifications` table via `notificationService`

### 12. Profile Visibility
- [ ] Public profile URL (`/profile/:candidateId`)
- [ ] Visibility toggle: public / employers only / private
- [ ] What employers see vs. candidate view

### 13. Mobile Responsiveness
- [ ] All dashboard pages responsive on 375px (mobile)
- [ ] All dashboard pages responsive on 768px (tablet)
- [ ] Touch-friendly interactive elements
- [ ] Responsive job filter sidebar (collapsible on mobile)

### 14. End-to-End Testing
- [ ] Full candidate registration → onboarding → dashboard flow
- [ ] Profile editing persists and reloads correctly
- [ ] Job application flow completes without errors
- [ ] Resume upload succeeds and URL is stored
- [ ] RLS: candidate cannot access another candidate's data
- [ ] All pages render without console errors
- [ ] Production build passes (`npm run build`)

---

## ✅ Definition of Done

A feature is considered **Done** only when ALL of the following are true:

| Criterion | Requirement |
|-----------|-------------|
| TypeScript | Zero TypeScript compilation errors (`tsc --noEmit`) |
| Console | Zero console errors or warnings in browser DevTools |
| RLS | No Supabase RLS policy violations (403/401 errors) |
| Network | No failed API calls in Network tab |
| Mobile | Fully responsive on 375px, 768px, and 1280px |
| Build | `npm run build` completes successfully |
| Data | All data reads from / writes to Supabase (no mock data) |
| UX | Loading states, empty states, and error states implemented |

---

## 🗂️ File Scope

Work occurs in these directories on `sprint5-candidate-portal` branch:

```
src/
├── pages/dashboard/candidate/    ← Main pages to build out
├── components/dashboard/         ← Reusable dashboard components
├── lib/services/candidateService.ts  ← Service functions
├── types/candidate.types.ts      ← Type definitions
└── constants/                    ← Domain constants
```

**Do NOT modify during Sprint 5:**
- `supabase/migrations/` — schema is frozen at v0.5
- `src/pages/auth/` — authentication is complete
- `src/pages/public/` — public site is complete
- `src/components/ui/` — UI library is stable
- `main` branch directly

---

## 🔄 Daily Sprint Workflow

```bash
# Start of day
git checkout sprint5-candidate-portal
git pull origin sprint5-candidate-portal

# During development
git add .
git commit -m "feat: [feature name] - [brief description]"

# End of day
git push origin sprint5-candidate-portal
```

---

## 🏷️ Sprint 5 Completion Tag

When all Definition of Done criteria are met:

```bash
git checkout main
git merge sprint5-candidate-portal
git tag -a v0.6-candidate-portal -m "Candidate Portal Complete – Sprint 5"
git push origin main --tags
```

---

## 🔗 References

- Branch: https://github.com/SuryaNaikoti/knowtohire/tree/sprint5-candidate-portal
- Development Workflow: [docs/development_workflow.md](../development_workflow.md)
- Project Roadmap: [docs/project_status.md](../project_status.md)
- v0.5 Release Notes: [docs/releases/v0.5-database-stable.md](../releases/v0.5-database-stable.md)
