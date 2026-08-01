# Security Audit Report

This report documents the security posture of the **KnowToHire** platform, reviewing authentication boundaries, data isolation, Row-Level Security (RLS) enforcement, input sanitization, and OWASP compliance.

---

## 🔒 Authentication & Role Authorization

- **Authentication Broker:** Auth is managed by Clerk/Supabase Auth, emitting JWTs checked at the gateway database level.
- **Role Isolation:** Checked via `AuthContext.tsx` on the client, and backed by DB schema rules.
  - Candidates are restricted to `/dashboard/candidate/*`.
  - Employers are restricted to `/dashboard/employer/*`.
  - Admins require role `'admin'` or `'super_admin'` to access `/dashboard/admin/*`.

---

## 🛡️ Row-Level Security (RLS) Verification
All tables have RLS policies enabled. We audited policies inside `20260630000001_rls_policies.sql` and found no recursion loops:
- `public.profiles`: Users can read any profile but can only update their own.
- `public.companies`: Anyone can view verified profiles. Only team members with `Admin` or `Recruiter` roles can update details.
- `public.jobs`: Public SELECT enabled for listing. Insert/update restricted to verified employers linking back to their company.
- `public.applications`: Candidates can insert/view their own applications. Employers can only view applications targeting jobs belonging to their company.

---

## 🛡️ Input Sanitization & XSS Protection
- **XSS Mitigation:** Content rendering (e.g. blog post pages, templates, portfolios, resume highlights) utilizes **DOMPurify** to clean rich text fields before rendering.
- **File Upload Protection:** Checked inside storage bucket policies. Files are verified against mime-type limits (PDF, JPG, PNG) and max sizes (5MB for images, 10MB for resumes) at the client boundary and locked down using Supabase Storage policies.

---

## 📋 OWASP Threat Matrix

| Risk ID | Vulnerability | Severity | Description & Evidence | Recommended Mitigation | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Missing Rate Limiting on Public Endpoints | **Medium** | Public search queries to `/jobs` or `/blog` have no backend rate-limiting middleware configured directly. | Defer rate-limiting to cloud hosting proxy (Cloudflare/Supabase Ingress rate limit controls). | Medium |
| **SEC-02** | RLS Recursion (Resolved) | **Low** | Historical RLS recursion loops resolved in `hotfix_rls_recursion.sql` using optimized subqueries. | Regular verification of RLS query execution times. | Low |
| **SEC-03** | Secrets Leak Protection | **Low** | Environment validation guards ensure no sensitive Supabase Service Role keys are exposed to client bundles. | Ensure `SUPABASE_SERVICE_ROLE_KEY` is strictly marked secret and never injected into frontend. | Low |
