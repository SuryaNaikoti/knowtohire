# KnowToHire – Sprint 5 Execution Plan

**Sprint:** 5 — Candidate Portal  
**Branch:** `sprint5-candidate-portal`  
**Base Commit:** `e07f72e`  
**Target Tag:** `v0.6-candidate-portal`  
**Prepared:** 2026-07-05  
**Repository:** https://github.com/SuryaNaikoti/knowtohire

---

## 🎯 Sprint Goal

> Complete the Candidate Portal and prepare Employer Portal integration.  
> At sprint end, every candidate dashboard page must read from and write to Supabase with zero mock data, be mobile responsive, and pass a production build.

---

## 📋 Feature Breakdown

---

### Feature 1 — Dashboard Overview

**Objective:**  
Replace all mock data in `CandidateKPIs` with live Supabase queries. Wire up real application counts, real profile views, and real CV download counts. Render an activity feed from `applications` table.

**Database Dependencies:**
- `applications` table — count by status per candidate
- `candidate_profiles` — resume_url presence for CV download flag
- `notifications` table — activity feed

**Existing Components:**
- [`CandidateDashboard.tsx`](file:///e:/data/Know%20to%20Hire/src/pages/dashboard/candidate/CandidateDashboard.tsx) — shell + KPI cards rendered
- [`dashboardService.getCandidateKPIs()`](file:///e:/data/Know%20to%20Hire/src/lib/services/dashboardService.ts#L32-L75) — calculates profileStrength live; `applications`, `cvDownloadsCount`, `profileViewsCount` are **mock hardcoded**
- [`ProfileCompletionMeter`](file:///e:/data/Know%20to%20Hire/src/components/dashboard/ProfileCompletionMeter.tsx) — pure display component, receives `percentage` prop ✅

**Missing / Gaps:**
- `applications` table query in `dashboardService` — currently returns `mockApplications[]`
- `cvDownloadsCount` and `profileViewsCount` — hardcoded as 19 and 142
- No `applications` table RLS query exists in `candidateService`
- No quick-action CTA buttons on dashboard (Apply, Browse, Upload Resume)

**API Requirements:**
```typescript
// Add to dashboardService.getCandidateKPIs():
const { count: appsCount } = await supabase
  .from('applications')
  .select('id', { count: 'exact', head: true })
  .eq('candidate_id', candidateId);

const { data: recentApps } = await supabase
  .from('applications')
  .select('id, status, created_at, jobs(title, companies(name))')
  .eq('candidate_id', candidateId)
  .order('created_at', { ascending: false })
  .limit(5);
```

**UI Requirements:**
- Active Applications card — live count from `applications`
- Recent Applications table — live data with status badges
- Quick action CTAs: "Browse Jobs", "Upload Resume", "Complete Profile"
- Empty state when no applications exist yet

**Acceptance Criteria:**
- [ ] KPI cards show live counts, not hardcoded values
- [ ] Applications table shows real data from DB or meaningful empty state
- [ ] profileStrength score matches actual DB state
- [ ] Page loads in under 2 seconds

**Testing Checklist:**
- [ ] New candidate with no apps → empty state shown, no errors
- [ ] Candidate with apps → table renders correctly
- [ ] profileStrength updates after adding a skill/experience in another tab

---

### Feature 2 — Profile Completion Meter

**Objective:**  
Make the profile completion meter accurately reflect the live Supabase state of every candidate section. Meter must recompute dynamically and display which sections are incomplete with direct navigation links.

**Database Dependencies:**
- `candidate_profiles` — bio, title, resume_url, desired_salary
- `candidate_skills` — count ≥ 1
- `candidate_experience` — count ≥ 1
- `candidate_education` — count ≥ 1
- `candidate_certifications` — count ≥ 1

**Existing Components:**
- [`ProfileCompletionMeter.tsx`](file:///e:/data/Know%20to%20Hire/src/components/dashboard/ProfileCompletionMeter.tsx) — SVG radial progress, receives `percentage` as prop
- [`dashboardService.getCandidateKPIs()`](file:///e:/data/Know%20to%20Hire/src/lib/services/dashboardService.ts#L43-L54) — scoring algorithm already correct (+20 bio, +20 resume, +10 skills, +20 exp, +20 edu, +10 certs)

**Missing / Gaps:**
- Meter shows only percentage; no breakdown of *which* sections are missing
- No "Complete Now →" navigation links per section
- Score algorithm doesn't account for `title` field (+5 bonus planned)

**API Requirements:**
- No new API needed — `getCandidateKPIs` already fetches all sections in parallel
- Add `missingFields: string[]` to `CandidateKPIs` interface

**UI Requirements:**
- Expand `ProfileCompletionMeter` to show a checklist of sections below the radial dial
- Each incomplete section shows "→ Complete" link to the relevant route
- Color coding: red (< 35%), orange (35–74%), green (≥ 75%)
- Animate progress when percentage changes

**Acceptance Criteria:**
- [ ] Meter accurately reflects real DB state on every load
- [ ] Missing sections listed with navigation links
- [ ] Adding a skill updates meter without full page reload (re-fetch KPIs)

**Testing Checklist:**
- [ ] Fresh user (0% completion) — all items listed as missing
- [ ] Adding bio → meter jumps to 20%
- [ ] Adding resume → meter jumps to 40%
- [ ] Fully complete profile → meter shows 100% and "Outstanding!" message

---

### Feature 3 — Resume Upload & Storage

**Objective:**  
Verify and harden the existing resume upload flow. Ensure Supabase Storage bucket `resumes` is configured correctly, upload progress is visible, file type validation enforces PDF/DOCX only, and the resume URL is persisted and retrievable.

**Database Dependencies:**
- `candidate_profiles.resume_url` — stores public URL after upload
- Supabase Storage bucket: `resumes` (must exist with public read policy)

**Existing Components:**
- [`ResumeUploader.tsx`](file:///e:/data/Know%20to%20Hire/src/components/dashboard/ResumeUploader.tsx) — upload UI exists (6.7 KB)
- [`candidateService.uploadResume()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L81-L108) — Supabase Storage upload + profile update ✅
- [`Portfolio.tsx`](file:///e:/data/Know%20to%20Hire/src/pages/dashboard/candidate/Portfolio.tsx#L184-L192) — renders `ResumeUploader` with candidateId and currentResumeUrl ✅

**Missing / Gaps:**
- Upload progress percentage not shown (no `onUploadProgress` hook)
- No file size validation enforced in UI (5 MB limit)
- No file type validation enforced (accept PDF/DOCX only)
- After upload, dashboard `cvDownloadsCount` still shows mock value
- No "Delete Resume" option

**API Requirements:**
```typescript
// Add delete resume to candidateService:
deleteResume: async (candidateId: string, filePath: string): Promise<boolean>

// Supabase Storage bucket policy must allow:
// SELECT for public (anon read)
// INSERT for authenticated users (own folder only)
// DELETE for authenticated users (own folder only)
```

**UI Requirements:**
- Progress bar during upload (0–100%)
- File validation error messages (wrong type, too large)
- "Delete Resume" button with confirmation dialog
- Resume preview link (open in new tab)
- File name and upload date displayed after successful upload

**Acceptance Criteria:**
- [ ] PDF upload succeeds and URL stored in DB
- [ ] File > 5MB rejected with clear error message
- [ ] Non-PDF/DOCX file rejected with clear error message
- [ ] Upload progress visible during upload
- [ ] Resume URL shows in Portfolio page after upload and on refresh

**Testing Checklist:**
- [ ] Upload valid PDF → success + URL persists after page reload
- [ ] Upload .exe file → rejected at UI level before any API call
- [ ] Upload 10MB PDF → rejected with size error
- [ ] Click "View Resume" → opens PDF in new tab

---

### Feature 4 — Candidate Profile Management

**Objective:**  
The Profile / Portfolio Hub (`Portfolio.tsx`) already handles title, bio, salary, and visibility. Validate it connects correctly to `candidate_profiles` table via Supabase (not localStorage fallback). Add avatar/photo upload support.

**Database Dependencies:**
- `candidate_profiles` — title, bio, desired_salary, currency, profile_visibility, avatar_url
- Supabase Storage bucket: `avatars` (new)

**Existing Components:**
- [`Portfolio.tsx`](file:///e:/data/Know%20to%20Hire/src/pages/dashboard/candidate/Portfolio.tsx) — title, bio, salary, visibility form ✅
- [`candidateService.getProfile()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L31-L60) — queries `candidate_profiles` via Supabase ✅
- [`candidateService.updateProfile()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L62-L78) — upsert to `candidate_profiles` ✅

**Missing / Gaps:**
- `avatar_url` field not in `CandidateProfile` type or form
- No avatar/photo upload component for candidates (only `LogoUploader` for employers)
- `candidate_profiles` table name: verify it matches schema (migration uses `candidates` table — **verify table name alignment**)
- `currency` field not editable in UI (hardcoded USD)

**API Requirements:**
```typescript
// Add to candidate.types.ts:
avatar_url?: string;

// Add to candidateService:
uploadAvatar: async (candidateId: string, file: File): Promise<string>
```

**UI Requirements:**
- Avatar upload circle with camera icon overlay
- Crop/preview before upload
- Currency selector dropdown (USD, INR, GBP, EUR)
- Character count on bio textarea (max 500)

**Acceptance Criteria:**
- [ ] Profile saves to Supabase, not localStorage
- [ ] Data persists across logout/login
- [ ] Avatar upload stores URL and shows on profile
- [ ] All fields validated (title required, bio required, salary > 0)

**Testing Checklist:**
- [ ] Save profile → logout → login → data still present
- [ ] Empty title → form validation error shown
- [ ] Avatar upload → shows in profile immediately
- [ ] Visibility change → confirm it's stored in DB

---

### Feature 5 — Skills Management

**Objective:**  
The Skills page and `SkillBadgeSelector` component are functionally complete. Validate Supabase connectivity, add skill edit (update years/level) capability, and add a "skills summary" count widget.

**Database Dependencies:**
- `candidate_skills` table — skill_name, years_of_experience, competency_level, candidate_id

**Existing Components:**
- [`Skills.tsx`](file:///e:/data/Know%20to%20Hire/src/pages/dashboard/candidate/Skills.tsx) — full page shell ✅
- [`SkillBadgeSelector.tsx`](file:///e:/data/Know%20to%20Hire/src/components/dashboard/SkillBadgeSelector.tsx) — add/delete skills UI ✅
- [`candidateService.getSkills()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L111-L127) — Supabase query ✅
- [`candidateService.addSkill()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L129-L147) — Supabase insert ✅
- [`candidateService.deleteSkill()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L149-L162) — Supabase delete ✅

**Missing / Gaps:**
- No `updateSkill()` method — cannot edit years or competency level after adding
- No skill count summary / statistics widget
- No duplicate skill prevention on Supabase path (only localStorage checks for duplicates)
- `SkillBadgeSelector` doesn't expose an edit mode

**API Requirements:**
```typescript
// Add to candidateService:
updateSkill: async (skillId: string, updates: Partial<CandidateSkill>): Promise<boolean>

// Add duplicate check on Supabase path:
const { data: existing } = await supabase
  .from('candidate_skills')
  .select('id')
  .eq('candidate_id', skill.candidate_id)
  .ilike('skill_name', skill.skill_name)
  .single();
```

**UI Requirements:**
- Inline edit: click a skill badge → opens edit popover for years/level
- Skill count summary: "12 Skills — 4 Expert, 6 Intermediate, 2 Beginner"
- Confirmation on delete (not silent)

**Acceptance Criteria:**
- [ ] Add skill → persists to Supabase after page reload
- [ ] Delete skill → removed from DB
- [ ] Duplicate skill rejected with error message
- [ ] Edit years/level updates DB

**Testing Checklist:**
- [ ] Add "React" at Expert 5 years → shows in list
- [ ] Reload page → skill still there (Supabase, not localStorage)
- [ ] Try adding "React" again → rejected
- [ ] Delete skill → gone after reload

---

### Feature 6 — Experience Management

**Objective:**  
The Experience page is fully built. Validate Supabase connectivity for upsert/delete and ensure the current-position toggle correctly nullifies `end_date`.

**Database Dependencies:**
- `candidate_experience` table — company_name, role_title, location, start_date, end_date, is_current, description, candidate_id

**Existing Components:**
- [`Experience.tsx`](file:///e:/data/Know%20to%20Hire/src/pages/dashboard/candidate/Experience.tsx) — full CRUD page (17.6 KB) ✅
- [`ExperienceForm.tsx`](file:///e:/data/Know%20to%20Hire/src/components/dashboard/ExperienceForm.tsx) — form component ✅
- [`candidateService.getExperience()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L165-L190) — Supabase query ✅
- [`candidateService.upsertExperience()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L192-L213) — Supabase upsert ✅
- [`candidateService.deleteExperience()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L215-L228) — Supabase delete ✅

**Missing / Gaps:**
- `is_current: true` should set `end_date = null` — verify this is enforced in upsert payload
- No date range validation (end_date must be after start_date)
- No sort order guarantee on UI (ordered by start_date DESC from DB, but not visually indicated)

**API Requirements:**
- No new API needed
- Add date validation before upsert call

**UI Requirements:**
- "Currently working here" checkbox visually hides end date field
- Date validation error messages ("End date must be after start date")
- Visual timeline sort indicator

**Acceptance Criteria:**
- [ ] Add experience → persists to Supabase
- [ ] Edit experience → updates in DB
- [ ] Delete experience → removed from DB
- [ ] is_current = true → end_date stored as null

**Testing Checklist:**
- [ ] Add current job (no end date) → saves correctly
- [ ] Add past job with end before start → validation error
- [ ] Edit existing entry → changes persist after reload
- [ ] Delete entry → gone after reload

---

### Feature 7 — Education Management

**Objective:**  
Validate Education CRUD is wired to Supabase. Surface education entries in a clean timeline card layout with edit/delete actions.

**Database Dependencies:**
- `candidate_education` table — institution, degree, field_of_study, start_date, end_date, description, candidate_id

**Existing Components:**
- [`EducationForm.tsx`](file:///e:/data/Know%20to%20Hire/src/components/dashboard/EducationForm.tsx) — form component ✅
- [`candidateService.getEducation()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L231-L255) ✅
- [`candidateService.upsertEducation()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L257-L278) ✅
- [`candidateService.deleteEducation()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L280-L293) ✅

**Missing / Gaps:**
- **No dedicated Education page** — `EducationForm.tsx` exists as a component but there is no `/dashboard/candidate/education` page yet. Must be created.
- Education is not accessible from dashboard navigation (App.tsx routing)

**API Requirements:**
- No new API needed — all service methods exist

**UI Requirements (new page required):**
```
src/pages/dashboard/candidate/Education.tsx  ← NEW FILE
```
- Timeline card layout per entry
- Add/Edit via modal using `EducationForm`
- Delete with confirmation
- Empty state with "Add your first education" CTA

**Acceptance Criteria:**
- [ ] Education page accessible from dashboard nav
- [ ] Add entry → persists to Supabase
- [ ] Edit entry → updates in DB
- [ ] Delete entry → removed

**Testing Checklist:**
- [ ] Add BSc Computer Science → shows in list after reload
- [ ] Edit degree name → updates correctly
- [ ] Delete entry → gone after reload

---

### Feature 8 — Certifications Management

**Objective:**  
Same pattern as Education. Validate Supabase CRUD for certifications. Create a dedicated Certifications page surfacing credential URL verification links.

**Database Dependencies:**
- `candidate_certifications` — name, issuing_organization, issue_date, expiration_date, credential_id, credential_url, candidate_id

**Existing Components:**
- [`CertificationForm.tsx`](file:///e:/data/Know%20to%20Hire/src/components/dashboard/CertificationForm.tsx) — form component ✅
- [`candidateService.getCertifications()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L296-L320) ✅
- [`candidateService.upsertCertification()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L322-L343) ✅
- [`candidateService.deleteCertification()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L345-L358) ✅

**Missing / Gaps:**
- **No dedicated Certifications page** — must be created
- No expiry date warning (e.g., "Expires in 30 days")
- Credential URL not surfaced as a clickable verify link

**New File Required:**
```
src/pages/dashboard/candidate/Certifications.tsx  ← NEW FILE
```

**UI Requirements:**
- Card per certification with issuer logo placeholder, dates, expiry badge
- "Verify" button linking to `credential_url` (external tab)
- Expiry warning badge if expiration_date < 60 days from today
- Empty state with "Add Certification" CTA

**Acceptance Criteria:**
- [ ] Certifications page accessible from nav
- [ ] Add cert → persists to Supabase
- [ ] Verify link → opens credential_url in new tab
- [ ] Expiry warning shows for near-expiry certs

**Testing Checklist:**
- [ ] Add cert with past expiry → "Expired" badge shown
- [ ] Add cert with future expiry → no warning
- [ ] Verify link → opens correctly
- [ ] Delete cert → removed from DB

---

### Feature 9 — Projects Portfolio

**Objective:**  
Create a dedicated Projects section allowing candidates to showcase personal/professional projects with title, description, tech stack, live URL, and GitHub link.

**Database Dependencies:**
- `candidate_projects` table — **does NOT currently exist in schema**
- Requires new migration OR use `candidate_profiles.portfolio_url` as simple placeholder for now
- **Decision:** Create `candidate_projects` table via new migration (Phase 1 prerequisite)

**Existing Components:**
- None — entirely new feature

**Missing Components (all new):**
```
src/pages/dashboard/candidate/Projects.tsx       ← NEW
src/components/dashboard/ProjectForm.tsx         ← NEW
src/lib/services/projectsService.ts             ← NEW (or extend candidateService)
supabase/migrations/20260705000005_candidate_projects.sql  ← NEW
```

**API Requirements:**
```typescript
// New table:
candidate_projects (
  id uuid primary key,
  candidate_id uuid references candidates(id),
  title text not null,
  description text,
  tech_stack text[],           -- array of tech names
  live_url text,
  github_url text,
  thumbnail_url text,
  is_featured boolean default false,
  created_at timestamptz
)

// New service methods:
getProjects(candidateId)
upsertProject(project)
deleteProject(candidateId, projectId)
uploadProjectThumbnail(candidateId, file)
```

**UI Requirements:**
- Grid card layout with project thumbnail
- Tech stack shown as small badges
- "Live Demo" and "GitHub" action buttons
- "Feature" toggle for pinning top 3 projects
- Thumbnail upload via Supabase Storage bucket `project-thumbnails`

**Acceptance Criteria:**
- [ ] Can add project with all fields
- [ ] Tech stack saves as array
- [ ] Live/GitHub URLs open correctly
- [ ] Featured projects shown at top

**Testing Checklist:**
- [ ] Add project → persists after reload
- [ ] Upload thumbnail → shown in card
- [ ] Feature project → appears first in list
- [ ] Delete project → removed

---

### Feature 10 — Saved Jobs

**Objective:**  
The `SavedJobs.tsx` page is structurally complete. Wire the "Apply for Position" button (currently shows an alert) to launch the full job application flow.

**Database Dependencies:**
- `saved_jobs` table — candidate_id, job_id
- `applications` table — candidate_id, job_id, status, cover_letter, created_at

**Existing Components:**
- [`SavedJobs.tsx`](file:///e:/data/Know%20to%20Hire/src/pages/dashboard/candidate/SavedJobs.tsx) — full listing + detail modal ✅
- [`jobsService.getSavedJobs()`](file:///e:/data/Know%20to%20Hire/src/lib/services/jobsService.ts) — ✅
- [`jobsService.toggleSaveJob()`](file:///e:/data/Know%20to%20Hire/src/lib/services/jobsService.ts) — ✅
- "Apply for Position" button → currently `alert('Applications module is scheduled for Sprint 5.')` ❌

**Missing / Gaps:**
- Job application submission flow — `applyToJob()` not in `candidateService`
- Cover letter textarea in application modal
- Duplicate application check (prevent double-apply)
- Application confirmation success state

**API Requirements:**
```typescript
// Add to candidateService (or jobsService):
applyToJob: async (candidateId: string, jobId: string, coverLetter?: string): Promise<boolean>
hasApplied: async (candidateId: string, jobId: string): Promise<boolean>

// Supabase:
const { error } = await supabase.from('applications').insert({
  candidate_id: candidateId,
  job_id: jobId,
  cover_letter: coverLetter,
  status: 'applied'
});
```

**UI Requirements:**
- "Apply" button → opens application modal with cover letter textarea
- Cover letter optional (500 char limit)
- After apply: button changes to "Applied ✓" with success state
- Duplicate check: if already applied, button shows "Already Applied"
- Dispatch `ApplicationSubmitted` notification via `notificationService`

**Acceptance Criteria:**
- [ ] Apply button submits to `applications` table
- [ ] After apply → button state changes to "Applied"
- [ ] Cannot apply to same job twice
- [ ] Notification dispatched on successful application

**Testing Checklist:**
- [ ] Apply to job → appears in DB applications table
- [ ] Apply again → blocked with "Already Applied" message
- [ ] Notification received in notification center
- [ ] Cover letter saved in DB

---

### Feature 11 — Job Alerts

**Objective:**  
Create a simple job alert preferences system allowing candidates to set keyword, domain, employment type, and location type filters that define their "ideal job match" profile.

**Database Dependencies:**
- `job_alerts` table — **does NOT currently exist**
- Requires new migration

**New Migration Required:**
```sql
-- supabase/migrations/20260705000006_job_alerts.sql
CREATE TABLE job_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  keywords text[],
  career_domain text,
  employment_type text,
  location_type text,
  min_salary integer,
  frequency text DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates manage own alerts" ON job_alerts
  USING (candidate_id = auth.uid());
```

**New Files Required:**
```
src/pages/dashboard/candidate/JobAlerts.tsx     ← NEW
src/lib/services/alertsService.ts              ← NEW
```

**UI Requirements:**
- Simple form: keywords (tags input), domain dropdown, employment type, location type, salary floor, frequency
- Toggle alerts on/off
- Empty state with benefits of alerts

**Acceptance Criteria:**
- [ ] Save alert preferences → persists to DB
- [ ] Toggle active/inactive works
- [ ] Alert page accessible from nav

**Testing Checklist:**
- [ ] Create alert → reload → still present
- [ ] Deactivate alert → is_active = false in DB

---

### Feature 12 — Notification Center

**Objective:**  
Build a Notification Center page that renders all notifications for the logged-in candidate. Wire to `notificationService.getNotifications()` and `markAsRead()`. Add a badge count in the dashboard header.

**Database Dependencies:**
- `notifications` table — id, recipient_id, event_type, title, body, is_read, link_url, created_at

**Existing Components:**
- [`notificationService.ts`](file:///e:/data/Know%20to%20Hire/src/lib/services/notificationService.ts) — full CRUD (dispatchNotification, getNotifications, markAsRead) ✅
- No page or header badge exists yet

**Missing / Gaps:**
- No `Notifications.tsx` page
- No notification badge/bell in `DashboardLayout` header
- No "mark all as read" function in `notificationService`
- No pagination (could be long list)

**New Files Required:**
```
src/pages/dashboard/candidate/Notifications.tsx  ← NEW
```

**API Requirements:**
```typescript
// Add to notificationService:
markAllAsRead: async (recipientId: string): Promise<boolean>
getUnreadCount: async (recipientId: string): Promise<number>
```

**UI Requirements:**
- Bell icon in DashboardLayout header with unread count badge (red dot)
- Notifications page: list of notifications grouped by "Today", "This Week", "Older"
- Unread notifications visually distinguished (bold text, blue dot)
- "Mark All as Read" button
- Click notification → navigate to `linkUrl` if present
- Empty state: "You're all caught up!"

**Acceptance Criteria:**
- [ ] Unread badge visible in header when notifications exist
- [ ] Clicking notification marks it as read
- [ ] Mark All Read → all notifications updated in DB
- [ ] Notification dispatched when applying to a job (from Feature 10)

**Testing Checklist:**
- [ ] Apply to job → notification appears in list
- [ ] Click notification → marked as read
- [ ] Mark All Read → badge count goes to 0
- [ ] No notifications → empty state shown

---

### Feature 13 — Profile Visibility Settings

**Objective:**  
The visibility toggle already exists in `Portfolio.tsx`. Add a dedicated "Privacy & Visibility" section with more granular controls and a public profile preview link.

**Database Dependencies:**
- `candidate_profiles.profile_visibility` — 'public' | 'private' | 'employers-only'

**Existing Components:**
- [`Portfolio.tsx`](file:///e:/data/Know%20to%20Hire/src/pages/dashboard/candidate/Portfolio.tsx#L139-L147) — visibility dropdown already exists ✅
- [`candidateService.updateProfile()`](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts#L62-L78) — handles visibility field ✅

**Missing / Gaps:**
- No public profile URL — `/profile/:candidateId` route not defined
- No "Preview Profile" button (how employers see the candidate)
- No granular control over which sections are visible

**UI Requirements:**
- "Preview as Employer" link that opens a read-only view of the candidate profile
- Visibility selector with explanatory text per option
- Section-level toggles (future enhancement — note as out of scope for Sprint 5)

**Acceptance Criteria:**
- [ ] Visibility change saves to DB
- [ ] Public profile route renders read-only candidate data
- [ ] Private profile redirects unauthorized viewers

**Testing Checklist:**
- [ ] Set to private → accessing public URL redirects
- [ ] Set to public → profile renders for unauthenticated user
- [ ] Set to employers-only → only logged-in employers can view

---

### Feature 14 — Mobile Responsiveness

**Objective:**  
Audit every candidate dashboard page for mobile breakpoints (375px, 768px). Fix any layout overflows, unresponsive modals, or broken grid layouts on small screens.

**Scope:** All pages in `src/pages/dashboard/candidate/` and all components in `src/components/dashboard/`

**Common Patterns to Check:**
- Grid layouts must collapse to single column on mobile (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Modals must be full-screen on mobile (max-h, overflow-y-auto)
- Tables must scroll horizontally on mobile (overflow-x-auto wrapper)
- Filter sidebars must be collapsible on mobile
- Buttons must be full-width on mobile (`w-full sm:w-auto`)
- Font sizes must not overflow containers

**Acceptance Criteria:**
- [ ] All pages render without horizontal scroll on 375px
- [ ] All modals are usable on mobile
- [ ] All tables scroll horizontally if needed
- [ ] Filter sidebar collapsible on mobile

**Testing Checklist:**
- [ ] Chrome DevTools 375px (iPhone SE) — no overflow
- [ ] Chrome DevTools 768px (iPad) — proper 2-col layout
- [ ] Touch targets ≥ 44px for all buttons

---

### Feature 15 — End-to-End Testing

**Objective:**  
Manually verify the complete candidate journey from registration to job application with zero errors. Test with a fresh Supabase account.

**Test Flows:**
1. Register new user → select Candidate role → complete onboarding
2. Complete entire profile: bio, title, salary, avatar, resume
3. Add 3+ skills, 2+ experiences, 1 education, 1 certification, 1 project
4. Browse jobs → save 3 jobs → apply to 1 job
5. Check notification center — application notification present
6. Verify profile completion meter at 100%
7. Run `npm run build` — zero errors
8. Check browser DevTools — zero console errors

---

## 🏗️ Dependency Order & Phased Implementation

### Phase 1 — Database & Service Foundation
*Must complete before any UI work. No UI changes in this phase.*

| # | Task | Files | Estimated Time |
|---|------|-------|----------------|
| 1.1 | Create `candidate_projects` migration | `supabase/migrations/20260705000005_candidate_projects.sql` | 30 min |
| 1.2 | Create `job_alerts` migration | `supabase/migrations/20260705000006_job_alerts.sql` | 30 min |
| 1.3 | Apply migrations to Supabase project | Supabase Dashboard | 15 min |
| 1.4 | Add `updateSkill()` to candidateService | `candidateService.ts` | 30 min |
| 1.5 | Add `applyToJob()` + `hasApplied()` to candidateService | `candidateService.ts` | 45 min |
| 1.6 | Add `markAllAsRead()` + `getUnreadCount()` to notificationService | `notificationService.ts` | 30 min |
| 1.7 | Create `projectsService.ts` with full CRUD | `src/lib/services/projectsService.ts` | 60 min |
| 1.8 | Create `alertsService.ts` | `src/lib/services/alertsService.ts` | 45 min |
| 1.9 | Add `avatar_url` to `CandidateProfile` type + uploadAvatar() | `candidate.types.ts`, `candidateService.ts` | 30 min |
| 1.10 | Wire real applications data in `dashboardService.getCandidateKPIs()` | `dashboardService.ts` | 60 min |

**Phase 1 Total:** ~6 hours

---

### Phase 2 — Core Pages (High Value, Low Dependency)
*Pages that enhance existing flows or are missing pages for existing services.*

| # | Task | Files | Estimated Time |
|---|------|-------|----------------|
| 2.1 | Harden Dashboard — replace mock data | `CandidateDashboard.tsx`, `dashboardService.ts` | 2 hr |
| 2.2 | Harden Resume Upload — add validation, progress, delete | `ResumeUploader.tsx`, `candidateService.ts` | 2 hr |
| 2.3 | Create `Education.tsx` page | `src/pages/dashboard/candidate/Education.tsx` | 2 hr |
| 2.4 | Create `Certifications.tsx` page | `src/pages/dashboard/candidate/Certifications.tsx` | 2 hr |
| 2.5 | Add notification bell + unread badge to DashboardLayout | `DashboardLayout.tsx` | 1 hr |
| 2.6 | Create `Notifications.tsx` page | `src/pages/dashboard/candidate/Notifications.tsx` | 2 hr |
| 2.7 | Wire "Apply for Position" in Jobs + SavedJobs modals | `Jobs.tsx`, `SavedJobs.tsx` | 2 hr |
| 2.8 | Update `App.tsx` routing for new pages | `App.tsx` | 30 min |
| 2.9 | Update `ProfileCompletionMeter` with section breakdown | `ProfileCompletionMeter.tsx` | 1.5 hr |

**Phase 2 Total:** ~15 hours

---

### Phase 3 — New Features & Polish
*Brand new features plus final polish and verification.*

| # | Task | Files | Estimated Time |
|---|------|-------|----------------|
| 3.1 | Create `Projects.tsx` page + `ProjectForm.tsx` component | `Projects.tsx`, `ProjectForm.tsx` | 4 hr |
| 3.2 | Create `JobAlerts.tsx` page | `JobAlerts.tsx` | 2 hr |
| 3.3 | Avatar upload in Portfolio | `Portfolio.tsx`, `candidateService.ts` | 2 hr |
| 3.4 | Public profile route `/profile/:candidateId` | New public page | 2 hr |
| 3.5 | Add `updateSkill()` UI — inline edit in SkillBadgeSelector | `SkillBadgeSelector.tsx` | 1.5 hr |
| 3.6 | Mobile responsiveness audit + fixes | All candidate pages | 3 hr |
| 3.7 | End-to-end testing pass | — | 2 hr |
| 3.8 | Fix any issues found in E2E testing | Various | 2 hr |
| 3.9 | `npm run build` → fix all TypeScript/lint errors | Various | 1 hr |
| 3.10 | Commit, push, tag v0.6-candidate-portal | Git | 30 min |

**Phase 3 Total:** ~20 hours

---

## ✅ Definition of Done

A Sprint 5 feature is **Done** only when ALL of the following pass:

| Criterion | How to Verify |
|-----------|---------------|
| ✅ Zero TypeScript errors | `npx tsc --noEmit` — zero output |
| ✅ Zero ESLint errors | `npm run lint` — zero errors, zero warnings |
| ✅ Zero console errors | Browser DevTools → Console tab — no red errors |
| ✅ Zero RLS errors | Supabase Dashboard → Logs — no 403/401 errors from app |
| ✅ Production build passes | `npm run build` — completes without errors |
| ✅ Mobile responsive | Chrome DevTools 375px, 768px, 1280px — no overflow |
| ✅ GitHub push completed | `git push origin sprint5-candidate-portal` — success |
| ✅ Documentation updated | `docs/sprints/sprint5_kickoff.md` — checkboxes ticked |

---

## ⚠️ Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `candidate_profiles` table name mismatch vs schema | 🔴 High | 🔴 High | Verify with Supabase SQL editor before Phase 1 starts |
| Supabase Storage buckets not created | 🔴 High | 🔴 High | Create `resumes`, `avatars`, `project-thumbnails` buckets in dashboard before coding |
| TypeScript strict mode errors on new types | 🟡 Medium | 🟡 Medium | Run `tsc --noEmit` after every new file |
| `candidate_projects` migration conflict | 🟡 Medium | 🟡 Medium | Test migration locally first |

### Database Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| RLS policy blocks candidate from own data | 🟡 Medium | 🔴 High | Test every new table's RLS with a real auth session |
| Schema mismatch (type alias vs actual table name) | 🔴 High | 🔴 High | Cross-reference candidateService queries with actual Supabase table names |
| Missing `notifications` table in Supabase | 🟡 Medium | 🟡 Medium | Verify table exists; notificationService gracefully falls back to localStorage |
| `applications` table foreign key constraint errors | 🟡 Medium | 🔴 High | Ensure `job_id` references `jobs.id` and candidate exists in `candidates` |

### UX Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Modal stack on mobile too small | 🟡 Medium | 🟡 Medium | Test all modals at 375px before final release |
| Long loading states frustrating users | 🟡 Medium | 🟡 Medium | All pages must have skeleton loaders, not blank screens |
| Profile completion formula not intuitive | 🟡 Low | 🟡 Medium | Add tooltip explaining what adds % points |

### Deployment Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Build fails due to unused imports in new files | 🟡 Medium | 🟢 Low | ESLint auto-fix before build |
| Supabase free tier row limit hit during testing | 🟢 Low | 🟡 Medium | Monitor Dashboard; delete test data after each test session |

---

## 📅 Estimated 5-Day Timeline

### Day 1 — Database Foundation & Service Layer
**Goal:** Phase 1 complete. All new migrations applied. All service methods added.

| Time | Task |
|------|------|
| 09:00–09:30 | Verify Supabase table names vs service queries (CRITICAL first step) |
| 09:30–10:00 | Create Supabase Storage buckets: `resumes`, `avatars`, `project-thumbnails` |
| 10:00–10:30 | Write + apply `candidate_projects` migration |
| 10:30–11:00 | Write + apply `job_alerts` migration |
| 11:00–12:00 | Add `applyToJob()` + `hasApplied()` to `candidateService` |
| 13:00–13:30 | Add `updateSkill()` to `candidateService` |
| 13:30–14:00 | Add `markAllAsRead()` + `getUnreadCount()` to `notificationService` |
| 14:00–15:00 | Create `projectsService.ts` with CRUD + uploadThumbnail |
| 15:00–16:00 | Create `alertsService.ts` |
| 16:00–17:00 | Wire real applications into `dashboardService.getCandidateKPIs()` |
| 17:00–17:30 | Run `tsc --noEmit` — fix all type errors |
| **EOD** | Git commit: `feat: Phase 1 - service layer complete` |

---

### Day 2 — Core Existing Pages (Dashboard, Resume, Skills, Experience)
**Goal:** Existing pages hardened and fully Supabase-connected.

| Time | Task |
|------|------|
| 09:00–11:00 | Harden `CandidateDashboard.tsx` — real data, quick actions |
| 11:00–13:00 | Harden `ResumeUploader.tsx` — validation, progress, delete |
| 13:00–14:00 | Update `ProfileCompletionMeter` — section breakdown + links |
| 14:00–15:00 | Verify Skills page — add edit mode, duplicate check |
| 15:00–16:00 | Verify Experience page — date validation, is_current fix |
| 16:00–17:00 | Verify Portfolio/Profile — confirm Supabase (not localStorage) |
| 17:00–17:30 | `npm run build` — fix errors |
| **EOD** | Git commit: `feat: Phase 2a - core pages hardened` |

---

### Day 3 — New Missing Pages (Education, Certifications, Notifications)
**Goal:** Three new pages created and fully functional.

| Time | Task |
|------|------|
| 09:00–11:00 | Create `Education.tsx` page (full CRUD) |
| 11:00–13:00 | Create `Certifications.tsx` page (full CRUD + expiry warning) |
| 13:00–14:00 | Add notification bell + badge to `DashboardLayout` |
| 14:00–16:00 | Create `Notifications.tsx` page |
| 16:00–16:30 | Wire "Apply" button in `Jobs.tsx` and `SavedJobs.tsx` |
| 16:30–17:00 | Update `App.tsx` routing for all new pages |
| 17:00–17:30 | `npm run build` — fix errors |
| **EOD** | Git commit: `feat: Phase 2b - education, certifications, notifications` |

---

### Day 4 — New Features (Projects, Job Alerts, Avatar, Public Profile)
**Goal:** Phase 3 new features complete.

| Time | Task |
|------|------|
| 09:00–10:00 | Create `ProjectForm.tsx` component |
| 10:00–13:00 | Create `Projects.tsx` page (full CRUD + thumbnail upload) |
| 13:00–15:00 | Create `JobAlerts.tsx` page |
| 15:00–16:00 | Add avatar upload to `Portfolio.tsx` |
| 16:00–17:00 | Create public profile route `/profile/:candidateId` |
| 17:00–17:30 | `npm run build` — fix errors |
| **EOD** | Git commit: `feat: Phase 3 - projects, alerts, avatar, public profile` |

---

### Day 5 — Polish, Mobile, E2E Testing & Release
**Goal:** Sprint 5 complete. Tag v0.6-candidate-portal pushed.

| Time | Task |
|------|------|
| 09:00–12:00 | Mobile responsiveness audit — all candidate pages at 375px + 768px |
| 12:00–14:00 | End-to-end test: fresh account registration → full profile → apply to job |
| 14:00–15:00 | Fix any issues found in E2E |
| 15:00–15:30 | `npm run build` — must pass clean |
| 15:30–16:00 | `npx tsc --noEmit` + `npm run lint` — zero errors |
| 16:00–16:30 | Final Git commit: `feat: Sprint 5 complete - Candidate Portal operational` |
| 16:30–17:00 | Push, merge to main, tag `v0.6-candidate-portal` |
| **EOD** | 🎉 Sprint 5 complete |

---

## 🔗 File Reference Map

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/dashboard/candidate/Education.tsx` | Education CRUD page |
| `src/pages/dashboard/candidate/Certifications.tsx` | Certifications CRUD page |
| `src/pages/dashboard/candidate/Notifications.tsx` | Notification center page |
| `src/pages/dashboard/candidate/Projects.tsx` | Projects portfolio page |
| `src/pages/dashboard/candidate/JobAlerts.tsx` | Job alerts preferences page |
| `src/components/dashboard/ProjectForm.tsx` | Project add/edit form |
| `src/lib/services/projectsService.ts` | Projects CRUD service |
| `src/lib/services/alertsService.ts` | Job alerts service |
| `supabase/migrations/20260705000005_candidate_projects.sql` | Projects table migration |
| `supabase/migrations/20260705000006_job_alerts.sql` | Job alerts table migration |

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/services/candidateService.ts` | +updateSkill, +applyToJob, +hasApplied, +uploadAvatar |
| `src/lib/services/notificationService.ts` | +markAllAsRead, +getUnreadCount |
| `src/lib/services/dashboardService.ts` | Replace mock applications with live query |
| `src/types/candidate.types.ts` | +avatar_url to CandidateProfile |
| `src/components/dashboard/ProfileCompletionMeter.tsx` | +section breakdown |
| `src/components/dashboard/ResumeUploader.tsx` | +validation, +progress, +delete |
| `src/components/dashboard/SkillBadgeSelector.tsx` | +edit mode |
| `src/components/layout/DashboardLayout.tsx` | +notification bell badge |
| `src/pages/dashboard/candidate/Portfolio.tsx` | +avatar upload |
| `src/pages/dashboard/candidate/Jobs.tsx` | +apply flow |
| `src/pages/dashboard/candidate/SavedJobs.tsx` | +apply flow |
| `src/App.tsx` | +routes for all new pages |

---

*Execution Plan prepared by Antigravity AI — KnowToHire Sprint 5*
