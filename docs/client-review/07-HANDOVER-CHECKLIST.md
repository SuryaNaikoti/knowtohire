# 07 — PROJECT HANDOVER & OPERATIONAL CHECKLIST

**Document Version:** 1.0.0  
**Date:** 10 November 2026  
**Project:** KnowToHire.com  
**Handover From:** Niche Synthesis Technologies  
**Handover To:** Dr. Rajeev Ranjan  

---

## 1. Executive Summary

This handover document provides a structured transition checklist, account ownership transfer protocols, administrative credentials inventory, and ongoing maintenance guidelines for KnowToHire.com.

> [!IMPORTANT]
> In accordance with application security best practices, **no raw secret keys, database master passwords, or private API tokens are written in this document**. A secure, end-to-end credential transfer procedure is defined in Section 3.

---

## 2. Infrastructure & Account Ownership Inventory

| Service / Platform | Role in Ecosystem | Current Account Holder | Target Account Holder | Transfer Protocol |
|---|---|---|---|---|
| **Domain Registrar** | DNS & domain records for `knowtohire.com` | Agency Account | Dr. Rajeev Ranjan | Initiate domain transfer authorization code (EPP) or invite Dr. Rajeev as DNS Administrator. |
| **Vercel** | Production Frontend Hosting & Edge Functions | Agency Team | Dr. Rajeev Ranjan | Transfer Vercel Project `knowtohire` to client's Vercel Team/Personal Account. |
| **Hostinger** | Specified Hosting Target in Proposal | Client Account | Dr. Rajeev Ranjan | Client to provide hPanel credentials if static/Node build migration is required. |
| **Supabase (Production)** | PostgreSQL Database, Auth & Storage (`roqbodprqmnwxdjsskgb`) | Agency Organization | Dr. Rajeev Ranjan | Go to Supabase Dashboard -> Project Settings -> General -> **Transfer Project** to Dr. Rajeev's email. |
| **Supabase (Staging)** | Staging Environment (`rjjmbuvsbxxlrxweslnv`) | Agency Organization | Dr. Rajeev Ranjan | Transfer Staging Project to client organization. |
| **Razorpay** | Payment Gateway (Merchant ID & Live Webhooks) | Agency Account | Dr. Rajeev Ranjan | Go to Razorpay Settings -> User Management -> Invite Dr. Rajeev as **Owner**, then transfer primary ownership. |
| **Google Cloud Console** | Google OAuth 2.0 Login (`knowtohire-auth`) | Agency Console | Dr. Rajeev Ranjan | Add Dr. Rajeev's Google Workspace / Gmail account as **Owner** in IAM & Admin. |
| **GitHub Repository** | Source Code & Version Control (`SuryaNaikoti/knowtohire`) | Agency Repository | Dr. Rajeev Ranjan | Transfer GitHub repository or grant Admin privileges to Dr. Rajeev's GitHub username. |

---

## 3. Environment Variable Inventory

Below is the complete inventory of environment variables required to run KnowToHire.com in production and local development.

### 3.1 Frontend Client Variables (Vite - Safe for Browser)
These variables are baked into the frontend bundle at build time:

```env
# Supabase Public API Endpoint
VITE_SUPABASE_URL=https://roqbodprqmnwxdjsskgb.supabase.co

# Supabase Anonymous Public Key (Row-Level Security enforces access)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay Public Key ID (Used by Razorpay Checkout script)
VITE_RAZORPAY_KEY_ID=rzp_live_...

# Platform Canonical Domain
VITE_SITE_URL=https://www.knowtohire.com
```

### 3.2 Backend Serverless Variables (Vercel Serverless / Edge Functions - STRICTLY SECRET)
These variables must **never** be exposed in client code:

```env
# Supabase Service Role Key (Admin Database Privileges - NEVER COMMIT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay Key Secret (Used for HMAC-SHA256 signature verification)
RAZORPAY_KEY_SECRET=[Client Secret provided securely]

# Razorpay Webhook Secret (Verifies webhook event origins)
RAZORPAY_WEBHOOK_SECRET=[Webhook Secret provided securely]

# SMTP / Transactional Email Credentials (Hostinger / Resend / Google Workspace)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=support@knowtohire.com
SMTP_PASSWORD=[Client Secret provided securely]
```

### 3.3 Secure Secret Transfer Protocol
To transfer sensitive secrets securely to Dr. Rajeev Ranjan without risk of email interception:
1. All secret values will be encrypted using an agreed password or shared via a temporary, self-destructing secret link service (e.g. 1Password Secret Link or Bitwarden Send).
2. The decryption passphrase will be communicated through an alternate verified channel (e.g., Signal or SMS to `+91 89195 18016`).

---

## 4. Super-Admin Access & Verification

- **Super-Admin Route:** `https://www.knowtohire.com/admin`
- **Super-Admin Capabilities:**
  - View all registered candidates and employer accounts.
  - Approve, reject, or feature submitted employer job listings.
  - Review on-demand custom requests (Templates, Research Documents, White Papers).
  - Manage Knowledge Hub articles and download audit logs.
- **Account Creation Procedure for Dr. Rajeev Ranjan:**
  1. Dr. Rajeev registers an account at `https://www.knowtohire.com/register`.
  2. In the Supabase SQL Editor, run:
     ```sql
     UPDATE public.profiles 
     SET role = 'admin' 
     WHERE email = '<dr_rajeev_registered_email>';
     ```
  3. Refresh the browser; the user profile will instantly receive Super Admin navigation and dashboard access.

---

## 5. Routine Operational & Maintenance Runbook

### 5.1 Applying Future Database Migrations
1. Open the Supabase Dashboard for project `roqbodprqmnwxdjsskgb`.
2. Navigate to **SQL Editor**.
3. Copy the contents of the target migration file (e.g., `supabase/migrations/20261110000000_add_featured_job_columns_and_safe_sorting.sql`).
4. Click **Run**.
5. Check table columns under **Table Editor -> jobs** to confirm that `is_featured`, `featured_start_date`, and `featured_end_date` are present.

### 5.2 Deploying Frontend Updates
1. Push committed changes to the GitHub repository:
   ```bash
   git push origin main
   ```
2. Vercel automatically detects commits on `main`, runs `npm run build`, and deploys the production build to `https://www.knowtohire.com` within 60 seconds.
3. If deploying manually via static files to Hostinger:
   ```bash
   npm run build
   ```
   Upload the entire contents of the `dist/` directory to the `public_html/` folder in Hostinger hPanel File Manager.

### 5.3 Database Backups
- Supabase automatically takes daily point-in-time recovery (PITR) backups.
- Manual backups can be downloaded anytime via Supabase Dashboard -> Database -> Backups.

---

## 6. Handover Acceptance Sign-Off

Upon receipt of the credentials transferred via the protocol in Section 3:

| Role | Name | Signature / Confirmation | Date |
|---|---|---|---|
| **Client / Owner** | Dr. Rajeev Ranjan | Pending Confirmation | ___ / ___ / 2026 |
| **Engineering Lead** | Niche Synthesis Technologies | Completed & Submitted | 10 / 11 / 2026 |

