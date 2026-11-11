# 04 — CLIENT INPUT & CHANGE REQUEST SPECIFICATION

**Document Version:** 1.0.0  
**Date:** 10 November 2026  
**Project:** KnowToHire.com  
**Client:** Dr. Rajeev Ranjan  
**Agency:** Niche Synthesis Technologies  

---

## 1. Executive Summary

This document separates items requiring **Dr. Rajeev Ranjan’s formal inputs/credentials** from items that represent **out-of-scope functional additions (Change Requests)** under the signed KnowToHire Development Proposal (contract value ₹78,000 net, Modules 1–8).

- **Section 2 (Client Input Required):** High-priority operational, legal, and configuration inputs needed from the client to finalize production configuration. No additional engineering fees apply to these inputs.
- **Section 3 (Formal Change Requests):** Explicit new feature requests raised in Dr. Rajeev's review report that exceed the contractual scope. Each request includes an architectural impact assessment, estimated engineering effort, and recommended fee structure.

---

## 2. Items Requiring Client Confirmation & Input

The following items are blocked or held in placeholder status pending official confirmation from Dr. Rajeev Ranjan:

| Item # | Area / Topic | Current State / Issue | Required Action / Confirmation from Client | Blocking Impact |
|---|---|---|---|---|
| **CI-01** | **Official Legal Entity Name & Registered Address** | Contact and Refund pages previously displayed an unauthorized Bengaluru address. Updated to "Registered Office: Goa, India". | Provide the exact registered corporate/LLP/proprietorship entity name, full registered office address, and CIN/LLPIN (if applicable) for the footer, Contact Us, and Terms of Service. | Legal compliance of platform policies and footer copyright. |
| **CI-02** | **Official Customer Care Contacts** | Support email displayed is `support@knowtohire.com`. Support phone displayed is `+91 89195 18016`. | 1. Confirm that `support@knowtohire.com` is configured and monitored in Google Workspace / Hostinger Mail.<br>2. Confirm whether `+91 89195 18016` is the permanent public customer helpline. | Customer communications and inquiries. |
| **CI-03** | **Hostinger Shared Hosting Credentials** | Project is currently hosted on Vercel (`knowtohire-mu.vercel.app` & custom domain `www.knowtohire.com`). Proposal mentioned deployment on client's Hostinger. | Provide Hostinger control panel (hPanel) access or SSH/FTP credentials if migration from Vercel to Hostinger Node/static container is required. | Production deployment target handover. |
| **CI-04** | **Additional Domain Registrations (.in, .org, .net)** | Proposal contracted deliverable is specifically `knowtohire.com`. Review report requested securing `.in`, `.org`, and `.net`. | Confirm if client has purchased or wishes the agency to purchase `knowtohire.in`, `knowtohire.org`, and `knowtohire.net`. Provide registrar DNS access to set up 301 permanent redirects to `www.knowtohire.com`. | Domain ownership & redirect setup. |
| **CI-05** | **Live Razorpay Account Ownership Handover** | Application is integrated with Razorpay (`rzp_live_...`). Admin credentials currently reside with agency. | Provide Dr. Rajeev Ranjan's email address registered with Razorpay to initiate full Merchant Ownership transfer in the Razorpay Dashboard. | Direct payout and merchant KYC compliance. |
| **CI-06** | **International Payment Gateway (Stripe / Wise)** | Razorpay is fully active for INR payments. Review report requested Stripe and Wise international support. | Provide Stripe Live Publishable & Secret Keys, or Wise API credentials, if international card acceptance in USD/EUR is requested. | International payment enablement (see CR-02). |
| **CI-07** | **Authoritative Template & Guide Pricing Confirmation** | Templates in Supabase were seeded at ₹0, ₹12, ₹25. Code had ₹499–₹1,299. Code has now been harmonized to database values. | Review and confirm the definitive retail pricing table for all 6 digital templates and 4 career guides before production public sales launch. | Pricing display and billing amounts. |
| **CI-08** | **Author Names & Attribution Permissions** | Review report flagged that articles/guides should only carry names Dr. Rajeev has authorized. | Supply list of authorized author names, titles, and bio photographs for Knowledge Hub guides and Blog articles. | Content compliance and copyright integrity. |

---

## 3. Formal Change Requests (Out-of-Scope Enhancements)

The following modules were requested in the Review Report but fall outside the contracted Scope of Work defined in the KnowToHire Proposal (₹78,000 net, Modules 1–8). We offer the following modular implementation packages:

### Change Request CR-01: Single Paid Job-Posting (Pay-Per-Job Workflow)

- **Description:** Implement a standalone, single-job posting checkout flow allowing employers to publish a single verified job listing without purchasing an ongoing monthly or annual employer subscription plan.
- **Architectural Impact:**
  - Create new database table `job_posting_orders` and link to `jobs.payment_status`.
  - Implement Razorpay checkout modal triggered during job creation.
  - Implement serverless webhook (`/api/verify-job-payment`) to transition job from `draft_payment_pending` to `active` upon signature validation.
  - Add invoice generation and download for single-job transactions in the Employer Dashboard.
- **Estimated Effort:** 16 Engineering Hours
- **Proposed Cost:** ₹14,000 + GST
- **Timeline:** 4 business days upon approval

---

### Change Request CR-02: Multi-Currency International Payment Gateway (Stripe & Wise)

- **Description:** Expand the payment subsystem to support dynamic currency conversion, multi-currency pricing (USD, EUR, GBP), and integration with Stripe Elements and Wise API alongside existing Razorpay INR gateway.
- **Architectural Impact:**
  - Implement gateway abstraction layer in frontend and serverless backend (`src/services/payment/gatewayManager.ts`).
  - Integrate Stripe SDK (`@stripe/stripe-js`) and serverless intent generation (`/api/create-stripe-intent`).
  - Implement webhook handlers for `payment_intent.succeeded` with cryptographic signature verification.
  - Update `user_purchases` schema to store currency code, exchange rate snapshot, and foreign transaction IDs.
- **Estimated Effort:** 24 Engineering Hours
- **Proposed Cost:** ₹22,000 + GST
- **Timeline:** 5 business days upon receipt of client Stripe credentials

---

### Change Request CR-03: Advanced Financial & Operational Analytics Suite

- **Description:** Deliver comprehensive super-admin reporting dashboards with interactive revenue breakdown (MRR, ARR, template sales), failed transaction recovery logs, cohort analysis, and automated CSV/XLSX export.
- **Architectural Impact:**
  - Create materialized views or secure aggregate SQL functions in PostgreSQL for revenue metrics, transaction success rates, and user registration cohorts.
  - Build interactive charting UI using Recharts in Super Admin Dashboard (`/admin/analytics`).
  - Implement CSV/Excel export service for finance and audit trails.
- **Estimated Effort:** 28 Engineering Hours
- **Proposed Cost:** ₹25,000 + GST
- **Timeline:** 6 business days upon approval

---

### Change Request CR-04: Next.js Server-Side Rendering (SSR) Architecture Migration

- **Description:** Migrate the existing Single-Page Application (Vite + React) to Next.js 14 (App Router) to achieve 100% server-side HTML rendering for dynamic job listings, candidate public profiles, and search-engine indexation.
- **Architectural Impact:**
  - Full codebase reorganization into Next.js App Router structure.
  - Conversion of client state management and Supabase client calls into Next.js Server Components and Server Actions.
  - Reconfiguration of Vercel build pipelines, edge caching headers, and dynamic OpenGraph image generation.
- **Estimated Effort:** 60 Engineering Hours
- **Proposed Cost:** ₹55,000 + GST
- **Timeline:** 12 business days upon approval

---

## 4. Summary Table of Change Requests

| CR # | Title | Scope Type | Estimated Effort | Fixed Fee (INR) | Prerequisite Client Input |
|---|---|---|---|---|---|
| **CR-01** | Single Paid Job-Posting (Pay-Per-Job) | Additional Scope | 16 Hours | ₹14,000 | Pricing decision per job post |
| **CR-02** | Stripe & Wise International Payments | Additional Scope | 24 Hours | ₹22,000 | Stripe Live Keys / Wise API |
| **CR-03** | Advanced Financial Analytics Dashboard | Additional Scope | 28 Hours | ₹25,000 | Metric reporting requirements |
| **CR-04** | Next.js Server-Side Rendering Rewrite | Architectural Migration | 60 Hours | ₹55,000 | Production cutover window approval |

---

## 5. Next Steps for Sign-Off

1. **Client Action:** Dr. Rajeev Ranjan to review Section 2 and reply with inputs for **CI-01 through CI-08**.
2. **Change Request Authorization:** Indicate whether any of CR-01 through CR-04 should be commissioned immediately or scheduled as a Phase 2 roadmap milestone.
3. **Warranty Scope:** All verified defects and configuration items under Section 2 are covered under our agreed commitment and will be finalized at zero additional cost upon receipt of inputs.

