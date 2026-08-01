# Infrastructure & Database Audit Report

This report presents an architectural inspection of the **Supabase** infrastructure configuration, database indexes, table constraints, triggers, and storage buckets.

---

## ⚡ Supabase Services Configuration

### 1. Postgres Database & Core Objects
The database structure is composed of versioned SQL files synced via Supabase. All migrations from `init_schema` (2026-06-30) up to the recent `sprint10_scale_tenancy` (2026-07-06) compile cleanly.

#### Verified Foreign Keys & Constraints
- `public.profiles` references `auth.users(id)` with cascading deletes.
- `public.candidates` and `public.employers` maintain cascading primary-key links to `public.profiles(id)`.
- `public.jobs` links to `public.companies(id)`.
- `public.applications` links to `public.jobs(id)` and `public.candidates(id)`.
- `public.company_team_members` ensures organization boundary mapping.

#### Database Indexes & GIN Indexes
- **FTS (Full-Text Search) Indexes:** Composite indexes exist on the search parameters of `jobs`, `blog_posts`, `resources`, `templates`, and `lead_magnets`.
- **Sprint 10 GIN Indexes:** Composite GIN indexes are deployed for JSONB settings filtering:
  - `idx_companies_theme_config ON public.companies USING gin (theme_config)`
  - `idx_companies_settings ON public.companies USING gin (settings)`

### 2. Storage Buckets & Policies
Three primary buckets exist within the Supabase Storage system:
1. **`resumes` Bucket:** Private bucket for candidate resume uploads.
   - *Access Rule:* Restricted to resource owners. Candidates can only read/write their own directory prefix.
2. **`portfolios` Bucket:** Public/Private bucket for candidate portfolio assets.
   - *Access Rule:* Candidate can upload. Public can read if assets are marked public.
3. **`logos` Bucket:** Public bucket containing employer logos and workspace banner images.
   - *Access Rule:* Restricted write permission to team members with role `'Admin'` or `'Recruiter'` matching the respective `company_id`.

---

## 🔄 Triggers & RPC Functions
The database relies on 3 critical trigger procedures:
- `trg_create_profile_on_signup`: Automatically generates a user entry in `public.profiles` upon Clerk/Supabase Auth confirmation.
- `trg_application_state_change`: Added in Sprint 10 to auto-generate `automation_events` upon change of state.
- `increment_blog_post_view_count`: An atomic RPC function to handle concurrent blog view tracking.

---

## 🛠️ Environment Configurations & Scaling Limits
- **pgBouncer Integration:** Configured in Transaction Pool mode (Port 6543) to pool connection threads for high-frequency queries.
- **pg_cron / Scheduled Routine Checks:** Standard shared cloud instances do not support pg_cron by default. To stay portable, we recommend running maintenance tasks (VACUUM and ANALYZE routines) using Supabase Scheduled Edge Functions or GitHub Actions Cron schedules.
- **Extensions Enabled:** `uuid-ossp`, `pgcrypto`, `vector`, and `pg_trgm`.
