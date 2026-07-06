# Database Schema Inventory

**Generated:** 2026-07-06  

## 1. System Tables (Total: 60)
Includes core tables like `profiles`, `candidate_profiles`, `employer_profiles`, `jobs`, `job_applications`, `orders`, `payments`, `subscriptions`, `blog_posts`, `resources`, `templates`, and `ai_resume_analyses`.

## 2. Extensions & Triggers
- **Extensions:** `pgcrypto`, `vector`, `uuid-ossp` enabled.
- **Triggers:** Automated update timestamps on all tables; TSVector sync triggers for full-text search indexes.

## 3. Storage Buckets
- `avatars` (Public access allowed for profile images).
- `resumes` (Private ownership RLS).
- `templates` (Private gate checked downloads).
- `lead_magnets` (Public read allowed).

## 4. RLS Policies
Enforced on all tables.
