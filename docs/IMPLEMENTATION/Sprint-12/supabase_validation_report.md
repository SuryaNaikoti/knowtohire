# Sprint 12.0 – Supabase Database & Infrastructure Validation Report

This report documents the verification of Supabase schema definitions, database indexes, file storage buckets, and real-time triggers.

---

## 1. Supabase Schema & Foreign Key Constraints
- **Tables Verified**: `candidates`, `employers`, `jobs`, `applications`, `resumes`, `skills`, `experience`, `education`, `certifications`, `audit_logs`.
- **Foreign Keys**: Cascade delete behavior configured for candidate and employer profile dependencies.

---

## 2. Storage Buckets & Policies
- **`resumes` Bucket**: Private bucket configured with authenticated candidate access policies. MIME type restricted to `.pdf` and `.docx`.
- **`company-logos` Bucket**: Public bucket with employer update policies.
- **`marketplace-assets` Bucket**: Public bucket with admin write access.

---

## 3. Realtime Subscription Triggers
- Realtime listener active for notification center and candidate application stage updates.
