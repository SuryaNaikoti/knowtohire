# 06 — PRODUCTION RELEASE & MIGRATION CHECKLIST (COMPREHENSIVE)

**Document Version:** 2.0.0 (Pre-Release Operational Protocol)  
**Date:** 10 November 2026  
**Auditor / Release Lead:** DeepMind Antigravity  
**Production Target:** `https://www.knowtohire.com` (Vercel) | Supabase: `roqbodprqmnwxdjsskgb`  
**Staging Target:** Supabase: `rjjmbuvsbxxlrxweslnv`  

---

## 1. Executive Summary & Production Guardrail

> [!CAUTION]
> **STRICT RELEASE RULE:** No action in this checklist—no database migration, git commit, push, or Vercel deployment—shall be executed without explicit written authorization from Dr. Rajeev Ranjan / the project owner.

This protocol provides the exact operational steps for:
1. Restoring the staging Supabase project and validating migrations in staging first.
2. Taking a production database safety snapshot and executing the production migration with verification queries and rollback scripts.
3. Committing and pushing the exact 40 staged files to GitHub to trigger Vercel deployment.
4. Executing the post-launch smoke test suite across all 9 critical user journeys.
5. Managing outstanding client and international payment dependencies.

---

## 2. Staging Restoration & Migration Procedure (Project Owner Guide)

Because project `rjjmbuvsbxxlrxweslnv` (`knowtohire-staging`) is currently in `INACTIVE` (paused) state on the Supabase free-tier, CLI execution over network sockets is blocked. The project owner must restore the project via the web dashboard:

### Step 2.1: Restore Staging Project via Dashboard
1. Log in to the [Supabase Dashboard](https://app.supabase.com).
2. Locate project `knowtohire-staging` (Ref: `rjjmbuvsbxxlrxweslnv`).
3. Click the banner prompt: **Restore Project** (or **Unpause Project**).
4. Wait 2–3 minutes until the project status changes from `INACTIVE` to `ACTIVE_HEALTHY`.

### Step 2.2: Apply Migration to Staging First
1. Open the **SQL Editor** in the staging Supabase project.
2. Paste the contents of `supabase/migrations/20261110000000_add_featured_job_columns_and_safe_sorting.sql`:
   ```sql
   DO $$
   BEGIN
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'is_featured'
       ) THEN
           ALTER TABLE public.jobs ADD COLUMN is_featured BOOLEAN DEFAULT false;
       END IF;

       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'featured_start_date'
       ) THEN
           ALTER TABLE public.jobs ADD COLUMN featured_start_date TIMESTAMPTZ DEFAULT NULL;
       END IF;

       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'featured_end_date'
       ) THEN
           ALTER TABLE public.jobs ADD COLUMN featured_end_date TIMESTAMPTZ DEFAULT NULL;
       END IF;

       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'featured_duration_days'
       ) THEN
           ALTER TABLE public.jobs ADD COLUMN featured_duration_days INTEGER DEFAULT NULL;
       END IF;
   END $$;

   CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON public.jobs(is_featured);
   CREATE INDEX IF NOT EXISTS idx_jobs_featured_lookup ON public.jobs(is_featured, status, published_at DESC);
   ```
3. Click **Run**.
4. Run verification queries in staging SQL Editor:
   ```sql
   -- Confirm columns exist
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'jobs' AND column_name IN ('is_featured', 'featured_start_date', 'featured_end_date', 'featured_duration_days');

   -- Confirm existing jobs remain intact
   SELECT count(*), status FROM public.jobs GROUP BY status;
   ```

---

## 3. Production Backup & Migration Execution Protocol

### Step 3.1: Pre-Migration Safety Snapshot (Production)
1. Log in to the [Supabase Dashboard](https://app.supabase.com) and select production project `roqbodprqmnwxdjsskgb` (`knowtohire-development`).
2. Navigate to **Database** -> **Backups**.
3. Verify that the latest daily automatic backup is available, or click **Take Backup Now** to capture an immediate pre-release point-in-time snapshot.

### Step 3.2: Execute Migration on Production Supabase
1. Navigate to **SQL Editor** in production project `roqbodprqmnwxdjsskgb`.
2. Paste the exact contents of `supabase/migrations/20261110000000_add_featured_job_columns_and_safe_sorting.sql`.
3. Click **Run**.

### Step 3.3: Post-Migration Verification Queries (Production)
Execute the following verification query in the SQL Editor immediately after running the migration:
```sql
-- 1. Check all four added columns and defaults
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'jobs' 
  AND column_name IN ('is_featured', 'featured_start_date', 'featured_end_date', 'featured_duration_days');

-- 2. Verify all existing job records are preserved (Expect exact same count as pre-migration)
SELECT count(*) AS total_jobs, 
       count(is_featured) AS jobs_with_featured_flag,
       count(*) FILTER (WHERE is_featured = false) AS default_false_count
FROM public.jobs;

-- 3. Verify active indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'jobs' 
  AND indexname IN ('idx_jobs_is_featured', 'idx_jobs_featured_lookup');
```
*Expected Result:* All columns present with `is_featured` defaulting to `false`; `total_jobs` exactly matches pre-migration count; both indexes active.

### Step 3.4: Emergency Rollback Procedure (If Required)
If any unexpected database error occurs, execute this rollback script in the Supabase SQL Editor:
```sql
ALTER TABLE public.jobs DROP COLUMN IF EXISTS is_featured CASCADE;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS featured_start_date CASCADE;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS featured_end_date CASCADE;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS featured_duration_days CASCADE;
DROP INDEX IF EXISTS public.idx_jobs_is_featured;
DROP INDEX IF EXISTS public.idx_jobs_featured_lookup;
```
*Note:* The frontend application code in `jobService.ts` contains an automatic fallback that catches missing `is_featured` columns and continues to serve jobs ordered by `published_at DESC`, guaranteeing zero end-user downtime even during rollback.

---

## 4. Final Deployment Sequence (GitHub & Vercel)

### Step 4.1: Confirm Staged Files
Verify that the exact 40 paths are staged in Git:
```bash
git status --short
```
*Verification:* Confirm 40 files staged (no secrets, no scratch scripts, 0 unstaged modifications).

### Step 4.2: Commit Staged Rectifications
```bash
git commit -m "fix(release): complete contractual audit rectification and pre-launch hardening"
```

### Step 4.3: Push to GitHub Remote
```bash
git push origin main
```

### Step 4.4: Vercel Production Deployment Monitoring
1. Vercel automatically detects the push to `main` for repository `SuryaNaikoti/knowtohire`.
2. Open the [Vercel Dashboard](https://vercel.com) -> project `knowtohire`.
3. Monitor build logs:
   - Check: `tsc && vite build` succeeds.
   - Check: Edge functions build and bundle cleanly.
4. Verify deployment state transitions to **Ready** at `https://www.knowtohire.com`.

---

## 5. Post-Deployment Production Smoke-Test Suite

Execute these 9 tests immediately upon production deployment:

| Test # | Target Route / Action | Test Procedure | Expected Outcome | Verification Status |
|---|---|---|---|:---:|
| **SMK-01** | `https://www.knowtohire.com/` | Open in incognito browser window. Check browser DevTools console. | Page renders in < 2s. No 400/500 errors. Category grid displays 8 contracted verticals. | Ready to test |
| **SMK-02** | `/jobs` | Browse job listings; apply category filters. | Job cards load with title, company, salary, and location. Fallback and featured ordering function cleanly. | Ready to test |
| **SMK-03** | `/signup` & `/register` | Visit `/signup` URL directly. Inspect registration form. | Redirects seamlessly to `/register`. Mandatory Terms & Privacy checkbox is present and halts submission if unchecked. | Ready to test |
| **SMK-04** | `/knowledge` | Browse guides; filter by Research Documents and White Papers. | Green Economy and IPR guides display. Kubernetes/AWS e-books are absent. Search bar filters guides dynamically. | Ready to test |
| **SMK-05** | `/templates` | Browse templates across categories. | Categories display Resume, Legal, Business, Compliance. "Verified ATS" badge displays exclusively on Resume templates. | Ready to test |
| **SMK-06** | `/blog` | View blog posts and click "Read Article" on cards. | Opens article detail view or target source in new tab. Dynamic reading times (~200 wpm) are displayed. | Ready to test |
| **SMK-07** | `/contact` & `/refund` | Review Contact and Refund policy pages. | Office coordinates display Registered Office: Goa, India with `(Pending client corporate confirmation)` disclaimers. | Ready to test |
| **SMK-08** | Canonical Tag & SEO | View page source (`Ctrl+U`) on homepage. | `<link rel="canonical" href="https://www.knowtohire.com/">` is present. No references to `knowtohire-mu.vercel.app`. | Ready to test |
| **SMK-09** | Razorpay Modal | Click "Get Started" on an Employer plan or paid template. | Razorpay Checkout modal opens with correct INR price and "+ 18% GST" disclosure. | Ready to test |

---

## 6. Client Dependencies & International Gateway Clarification Register

The following items are documented in [`05-CLIENT-DEPENDENCY-REGISTER.md`](file:///E:/Projects/KnowToHire/docs/client-review/05-CLIENT-DEPENDENCY-REGISTER.md) awaiting client input:

1. **Registered Corporate Entity & Goa Address:** Exact legal entity name and full street address in Goa for Terms and Contact pages.
2. **Support Phone & Email Confirmation:** Verify that `+91 89195 18016` is the permanent public helpline and `support@knowtohire.com` is actively monitored.
3. **Stripe Eligibility & Account Status:** The business is in India where Stripe requires an invitation for merchant account onboarding. Stripe integration is pending client invitation and credentials. The working domestic Razorpay gateway is **not** defective.
4. **Wise Discrepancy Clarification:** The kickoff document specifies Wise as the primary international collection method, while the proposal mentions Stripe or Razorpay. Client clarification is requested on whether Wise bank transfer instructions or Stripe account onboarding is preferred.
5. **Template & Guide Pricing Sign-Off:** Confirm whether database seed prices (₹0, ₹12, ₹25) or commercial prices (₹499, ₹799, ₹1299) should be loaded into production before public sales.

---

## 7. Final Production Guardrail Confirmation

- **Production Database Modifications:** **NONE (0 executed)**
- **Git Commits Executed:** **NONE (0 executed)**
- **Git Pushes Executed:** **NONE (0 executed)**
- **Production Deployments Executed:** **NONE (0 executed)**

All files remain cleanly staged in Git. Standing by for your explicit release approval.
