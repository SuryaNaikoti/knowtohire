# Deployment Checklist

Step-by-step checklist to prepare the production server environment.

---

## 1. Environment Variables Configuration
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_PROVIDER_KEY`
- `VITE_ANALYTICS_WRITE_KEY`

---

## 2. Database & Storage Steps
- Run Postgres migrations.
- Initialize `resumes` bucket with public read restriction.
- Audit active RLS policies.

---

## 3. Rollback & Backups Strategy
- Create automated database snapshots before deploy.
- Roll back to last successful asset hash on bundler failures.
