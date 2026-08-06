# KnowToHire Version 1.0 — Client Handover Package & Deployment Manual

> **Document Type:** Production Handover & Deployment Manual  
> **Platform Version:** Version 1.0 (Production Release Candidate 1)  
> **Target:** Client Operations, Technical Lead, and DevOps Teams  
> **Status:** 🟢 Approved Handover Package  
> **Date:** August 5, 2026  

---

## 1. Deployment Guide

### 1.1 Infrastructure Requirements
* **Hosting Platform:** Vercel / Netlify / Cloudflare Pages / AWS S3 + CloudFront
* **Node.js Environment:** Node.js `v20.x` or `v22.x`
* **Database & BaaS:** Supabase Managed Cloud (PostgreSQL 15+)

### 1.2 Step-by-Step Production Deployment Flow

1. **Clone Repository:**
   ```bash
   git clone https://github.com/SuryaNaikoti/knowtohire.git
   cd knowtohire
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` or populate platform environment variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

4. **Execute Production Build:**
   ```bash
   npm run build
   ```
   *Output directory:* `dist/`

5. **Deploy Artifacts:**
   Upload the contents of `dist/` to your static web hosting platform and configure single-page app (SPA) fallback rewriting all paths to `index.html`.

---

## 2. Environment Variables Checklist

- [x] `VITE_SUPABASE_URL`: Fully qualified Supabase project URL (`https://<project-ref>.supabase.co`).
- [x] `VITE_SUPABASE_ANON_KEY`: Public anonymous API key with RLS enforcement.
- [x] `VITE_ENABLE_AI_FEATURES`: Set to `true` (enables `AIService` scoring & resume evaluation).
- [x] `VITE_APP_URL`: Base application URL (`https://knowtohire.com`).

---

## 3. Supabase Configuration Checklist

- [x] **Database Migrations:** Run all 17 SQL migrations located in `supabase/migrations/` sequentially.
- [x] **Row Level Security (RLS):** Verify RLS is enabled across `profiles`, `candidates`, `employers`, `jobs`, `applications`, `resources`, `templates`, `blog_posts`, `audit_logs`.
- [x] **Storage Buckets:** Create the following public storage buckets in Supabase Storage:
  - `resumes` (PDF, DOCX upload for candidates)
  - `logos` (PNG, JPG company logo uploads for employers)
  - `templates` (Resume & Cover Letter downloadable assets)
- [x] **Auth Triggers:** Confirm `on_auth_user_created` trigger is active for auto-provisioning `profiles`.

---

## 4. Domain Configuration Checklist

- [x] Add custom domain `knowtohire.com` and `www.knowtohire.com` in DNS management.
- [x] Set `CNAME` or `A` records pointing to hosting provider (e.g., Vercel/Cloudflare).
- [x] Confirm SSL/TLS certificate auto-renewal is active (HTTPS enforced).
- [x] Update Site URL & Additional Redirect URLs in Supabase Auth $\rightarrow$ URL Configuration (`https://knowtohire.com/auth/callback`).

---

## 5. Email Configuration Checklist

- [x] Enable SMTP provider (SendGrid, Resend, or AWS SES) in Supabase Auth settings.
- [x] Configure sender email address (`noreply@knowtohire.com`).
- [x] Set custom email templates for:
  - Email Verification / Signup Confirmation
  - Password Reset Request
  - Application Status Update Alert

---

## 6. Razorpay Configuration Checklist

- [x] Register Razorpay Merchant Account.
- [x] Obtain `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- [x] Add Webhook endpoint in Razorpay Dashboard: `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`.
- [x] Listen for events: `order.paid`, `payment.failed`, `subscription.activated`.

---

## 7. Maintenance Guide & Backup Strategy

### 7.1 Database Backup Strategy
* **Automated Daily Backups:** Managed by Supabase Cloud with 7-day Point-In-Time-Recovery (PITR).
* **Manual Backup Procedure:**
  ```bash
  npx supabase db dump -f backup_$(date +%Y%m%d).sql --clean
  ```

### 7.2 Security & Compliance Auditing
* Perform weekly reviews of `audit_logs` table via Admin Dashboard.
* Monitor failed login attempts and rate limiting thresholds.

---

## 8. Version 2 Backlog Summary

Refer to [VERSION_2_BACKLOG.md](file:///e:/data/Know%20to%20Hire/VERSION_2_BACKLOG.md) for full deferred items:
- Enterprise Multi-Tenancy Architecture (V2-001)
- Generative AI Mock Interview Simulator (V2-002)
- Recruiter Active Sourcing CRM (V2-003)
- Client-Side Telemetry Event Buffer (V2-004)
- AI Vector Reranking Engine (V2-006)
- Native Drag-and-Drop Kanban (V2-008)
