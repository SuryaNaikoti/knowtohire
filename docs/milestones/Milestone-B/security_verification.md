# Security Verification Report

This document reports on database Row-Level Security (RLS) policies, storage access boundaries, and JWT token authorization checks.

---

## 🔒 Database Row-Level Security (RLS) Status
All tenant-scoped tables have RLS activated and verified. The policies enforce boundary constraints as detailed below:

### 1. `public.companies`
- **SELECT:** Public read access allowed for verified companies.
- **ALL:** Restricted to validated organization team members matching `auth.uid()`.

### 2. `public.jobs`
- **SELECT:** Public select allowed.
- **INSERT/UPDATE:** Restricted to verified employers belonging to the matching target `company_id`.

### 3. `public.applications`
- **ALL:** Scoped to resource owner candidates or target employer team members managing the job application funnel.

---

## 📦 Storage Policies Enforcement
Supabase Storage bucket policies verify that:
- User folder prefixes are not only conventions; the server rejects any read/write request if the prefix does not match the active user's session parameters.
- Private files (e.g. resumes) are requested using temporary signed URLs, preventing direct public URL scraping.
