# KNOWTOHIRE.COM — RECTIFICATION PLAN

**Version:** 2.0  
**Status:** Approved for Implementation & Verification  
**Author:** Full-Stack Engineering Lead  

---

## 1. RECTIFICATION OBJECTIVES & CONSTRAINTS

1. **Preserve Production Integrity:** No destructive SQL operations, table drops, or column removals. Existing candidate, employer, and job records must be preserved.
2. **Defensive Robustness:** Code must gracefully handle database variances between staging and production.
3. **Contract Alignment:** All verified issues classified as A (Defect), B (Incomplete), and C (Content/Configuration) are fixed in this implementation.
4. **Out-of-Scope Segregation:** Additional scope (D), Client Inputs (E), and Third-Party Dependencies (F) are formally documented for separate sign-off.

---

## 2. RECTIFICATION WORKSTREAMS

### Workstream 1: Database & API Resilience (Priority 1)
- **Action:** Deliver non-destructive SQL migration `20261110000000_add_featured_job_columns_and_safe_sorting.sql` to add `is_featured`, `featured_start_date`, `featured_end_date`, and `featured_duration_days` with indexes to `public.jobs`.
- **Defensive Fallback:** Update `src/services/jobService.ts` so that if `is_featured` is not found (error code `42703`), the service automatically retries without the column ordering rather than throwing an error.
- **Sanitized Errors:** Update `normalizeServiceError` in `src/services/types.ts` to swallow technical Postgres column/syntax codes and present a friendly visitor message.

### Workstream 2: Pricing & Payment Catalog Harmonization (Priority 1)
- **Action:** Synchronize `src/services/payment/authoritativePricing.ts` and `api/_serverPayment.ts`. Map production database template UUIDs (`018385a9-90c7-4a92-8382-803c89f3034c`, `3c92ea93-f7f3-4f20-95fb-2412e181f140`, `d1186a95-0bde-4662-9dbd-90472e135861`) and resource UUIDs to the authoritative catalog with exact prices (₹0, ₹12, ₹25).
- **Integrity Rule:** Client cannot alter price during checkout; server verifies the exact registered amount.

### Workstream 3: SEO, Canonical URLs & Social Sharing (Priority 1)
- **Action:** Standardize `index.html`, `public/robots.txt`, and `public/sitemap.xml` to `https://www.knowtohire.com`.
- **Metadata:** Add Open Graph and Twitter image tags pointing to a new 1200×630 branded asset (`/og-image.png`).
- **Domain Redirect:** Enforce redirect from `knowtohire.vercel.app` and `knowtohire-mu.vercel.app` to `https://www.knowtohire.com`.

### Workstream 4: Navigation, Routing & User Experience (Priority 2)
- **Action:** In `src/App.tsx`, implement intelligent route handlers for:
  - `/signup` -> Redirects to `/register`
  - `/dashboard` -> Dynamically routes authenticated candidates, employers, creators, and admins to their respective dashboards (or `/login` if guest).
  - `/post-job` -> Routes employers to `/employer/jobs/new` and guests to `/register?role=employer`.
- **Consistency:** Update header and footer "Post a Job" and "Find Talent" CTAs to use the `/post-job` route.
- **Wording:** Remove "admin portal" wording from `LoginPage.tsx`. Add required Terms and Privacy Policy acceptance checkbox to `RegisterPage.tsx`.

### Workstream 5: Domain Taxonomy & Content Realism (Priority 2)
- **Career Categories:** Harmonize `CareersPage.tsx`, `CategoryGrid.tsx`, and headers to the 8 contracted categories: General, Environmental, ESG, Sustainability, Patent, IPR, Research, Consulting.
- **Knowledge Hub:** Restructure categories in `knowledgeService.ts` and `KnowledgePage.tsx` to include Research Documents and White Papers. Replaced off-topic tech e-books with niche environmental and carbon market guides.
- **Template Categories:** Align categories to Resume, Legal, Business, and Compliance. Restrict the "ATS" badge exclusively to resume templates.
- **External Jobs:** Replace "Priority #" labels with "Curated Drive #".
- **Blog:** Calculate reading time dynamically based on word count. Tag posts to specific career domains. Make "Read Article" a real `<a>` link.

### Workstream 6: Contact & Legal Compliance (Priority 2)
- **Contact Info:** Update `ContactPage.tsx` and `RefundPage.tsx` with Goa registered office, `+91 89195 18016`, and `support@knowtohire.com`.
- **Typo Fix:** Correct "6:30 PM IS" to "6:30 PM IST" in `RefundPage.tsx`.
- **Pricing:** Harmonize "Employer Starter" badge and title, state GST applicability (+18% GST), and verify Enterprise sales button text.

