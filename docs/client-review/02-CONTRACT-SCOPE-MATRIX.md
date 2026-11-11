# 02 — CONTRACT SCOPE & RECONCILIATION MATRIX (REVISED)

**Document Version:** 2.0.0 (Post-Validation Reconciled Edition)  
**Date:** 10 November 2026  
**Author:** DeepMind Antigravity  
**Authoritative Baseline:**
1. *PROPOSAL FOR DEVELOPMENT OF KNOWTOHIRE.COM* (Surya Naikoti / Niche Synthesis Technologies, Net: ₹78,000, 11 Pages)
2. *DETAILED PROJECT REPORT (DPR) LEARNANDHIRE.COM* (Product Vision Document)
3. *Project Kickoff & Milestone Plan*

---

## 1. Executive Summary & Contractual Reconciliation

This matrix establishes the definitive boundary between **Contracted Obligations** (under the signed ₹78,000 KnowToHire proposal) and **Additional / Future Enhancements**.

### Key Reconciliations in Version 2.0:
- **Payment Gateways & International Collections Discrepancy (Module 8, Page 5 & Kickoff):**
  - **Proposal Text (Module 8, Page 5):** *"Integrated Payment Methods: Razorpay - Indian Payment (or) Stripe - For Global Transactions. Supports: Indian Payments, International Payments."*
  - **Kickoff Document Text:** Mentions Wise as the primary international collection method.
  - **Contractual Reconciliation & Status:**
    - **Razorpay:** Contracted Indian payment gateway. Fully implemented, active, and verified. Working integration must not be altered.
    - **Stripe:** Contracted international payment method in the Proposal. However, the business is based in India where Stripe requires an invitation for account onboarding. Stripe is therefore **PENDING CLIENT ELIGIBILITY & CREDENTIALS (E)**, rather than a defect of the working Razorpay gateway.
    - **Wise Discrepancy:** The kickoff document explicitly identifies Wise for international collections while the proposal names Razorpay or Stripe. This discrepancy is formally recorded for client clarification. Wise is **NOT** classified as an unapproved feature or silently dismissed; it is held as a **CONTRACT DISCREPANCY REQUIRING CLIENT CLARIFICATION (E)**.
- **Research Documents & White Papers (Module 3 & Module 5, Pages 3–4):** Explicitly contracted under Module 3 (Knowledge Hub categories) and Module 5 (On-Demand requests). Their previous absence was a **CONTRACTED — DEFECT / INCOMPLETE**. Now implemented.
- **Blog Platform (Module 6, Page 5):** Explicitly contracted (Categories, SEO-friendly articles, search). Fully rectified.
- **Admin Reporting (Module 1, Page 2):** Platform Monitoring and User/Employer/Job/Application Management were contracted. Advanced MRR financial forecasting dashboards remain **ADDITIONAL SCOPE (D)**.
- **Premium Job Listings & Pay-Per-Job:**
  - Premium/Featured Jobs: **CONTRACTED — INCOMPLETE (B)** (Module 1 Job Management & Search priority).
  - Pay-Per-Job Posting (standalone transactional checkout without employer subscription): **ADDITIONAL SCOPE (D)**. Proposal Module 1 & 8 specify platform-level subscriptions and job management, but not a separate ad-hoc single-listing checkout workflow.

---

## 2. Definitive Scope Classification Table

| # | Feature / Client Report Item | Proposal Citation & Verbatim Text | Scope Classification | Current Status |
|---|---|---|:---:|:---:|
| **1** | **Job Listings Failure (`jobs.is_featured`)** | Module 1 (Page 2): *"Job Search, Manage Job Listings, Job Management"* | **CONTRACTED — DEFECT (A)** | **FIXED & VERIFIED** (Defensive fallback + migration) |
| **2** | **Technical Error Sanitization** | Infrastructure & Security (Page 6): *"Secure Data Storage, Scalable Architecture"* | **CONTRACTED — DEFECT (A)** | **FIXED & VERIFIED** (Sanitized to friendly messages) |
| **3** | **Template & Guide Pricing Discrepancy** | Module 4 (Page 4): *"Product Pages, Downloads, Template Management"* | **CONTRACTED — DEFECT (A)** | **FIXED & VERIFIED** (Database & code harmonized) |
| **4** | **Contact Details & Outdated Bengaluru Office** | Module 7 (Page 5): *"Contact Us, About Us"* | **CONTRACTED — CONTENT / CONFIG (C)** | **FIXED (Pending Client Final Address Input)** |
| **5** | **Canonical URLs & Sitemap Domain** | Page 6: *"Domain: KnowToHire.com, SEO Friendly Structure"* | **CONTRACTED — DEFECT (A)** | **FIXED & VERIFIED** (`knowtohire.com` standardized) |
| **6** | **Database Security & Resume RLS** | Page 6: *"Role-Based Access, Secure Data Storage"* | **CONTRACTED — DEFECT (A)** | **VERIFIED SECURE** (403 Forbidden on anonymous) |
| **7** | **Research Documents & White Papers** | Module 3 (Page 3) & Module 5 (Page 4): *"Study Materials, Research Documents, White Papers"* | **CONTRACTED — INCOMPLETE (B)** | **FIXED & VERIFIED** (Added to Knowledge Hub & Requests) |
| **8** | **On-Demand Template Requests** | Module 5 (Page 4): *"Users can request: Study Materials, Research Documents, White Papers, Templates"* | **CONTRACTED — INCOMPLETE (B)** | **FIXED & VERIFIED** (Added to request dropdown) |
| **9** | **Premium / Featured Job Listings** | Module 1 (Page 2): *"Job Search, Manage Job Listings"* | **CONTRACTED — INCOMPLETE (B)** | **IMPLEMENTED** (Schema & sorting fallback ready) |
| **10** | **Pay-Per-Job Single Posting Workflow** | Not in Proposal (Only Employer Subscription Model contracted) | **ADDITIONAL SCOPE (D)** | **SPECIFIED IN CR-01** (₹14,000 / 16 hrs) |
| **11** | **Admin Reporting & Management** | Module 1 (Page 2): *"User, Employer, Job, Application Management, Platform Monitoring"* | **CONTRACTED — INCOMPLETE (B)** | **VERIFIED** (Standard admin management active) |
| **12** | **Advanced Financial Analytics (MRR/ARR)** | Not in Proposal (Proposal specifies platform monitoring) | **ADDITIONAL SCOPE (D)** | **SPECIFIED IN CR-03** (₹25,000 / 28 hrs) |
| **13** | **Payment Gateway: Razorpay (INR)** | Module 8 (Page 5): *"Razorpay - Indian Payment. Supports: Indian Payments"* | **CONTRACTED — COMPLETED** | **ACTIVE & FUNCTIONAL** |
| **14** | **Payment Gateway: Stripe (Global)** | Module 8 (Page 5): *"Stripe - For Global Transactions. Supports: International Payments"* | **CONTRACTED — PENDING CLIENT CREDENTIALS (E)** | **BLOCKED BY INDIA STRIPE INVITATION / CLIENT KEYS** (Razorpay remains valid domestic integration) |
| **15** | **Payment Gateway: Wise (International)** | Kickoff Document: Primary international collection method | **CONTRACT DISCREPANCY / CLIENT INPUT (E)** | **DISCREPANCY RECORDED** (Kickoff specifies Wise; Proposal specifies Stripe/Razorpay. Clarification required.) |
| **16** | **Blog Articles, Categories & Search** | Module 6 (Page 5): *"Blog Categories, SEO-Friendly Articles, Search Functionality"* | **CONTRACTED — INCOMPLETE (B)** | **FIXED & VERIFIED** (Dynamic tags, clickable links) |
| **17** | **Structured Data (Schema.org / JSON-LD)** | Page 6: *"SEO Friendly Structure"* | **CONTRACTED — CONTENT / CONFIG (C)** | **IMPLEMENTED** (JobPosting, Article, Product schemas) |
| **18** | **Eight Career Categories** | Module 2 (Page 3): *"General, Environmental, ESG, Sustainability, Patent, IPR, Research, Consulting"* | **CONTRACTED — CONTENT / CONFIG (C)** | **FIXED & VERIFIED** (Exact 8 categories deployed) |
| **19** | **Template Categories (Resume, Legal, etc.)** | Module 4 (Page 4): *"Resume, Business, Legal, Compliance, Professional Documents"* | **CONTRACTED — CONTENT / CONFIG (C)** | **FIXED & VERIFIED** (Exact categories deployed) |
| **20** | **ATS Badge on Resume Templates Only** | Module 4 (Page 4): *"Resume Templates, Professional Documents"* | **CONTRACTED — DEFECT (A)** | **FIXED & VERIFIED** (Conditioned to Resume) |
| **21** | **Pricing Page GST Disclosure & Badge** | Module 7 & 8: *"Website Pages, Pricing presentation"* | **CONTRACTED — CONTENT / CONFIG (C)** | **FIXED & VERIFIED** (+18% GST disclosure added) |
| **22** | **Route Aliases (`/signup`, `/dashboard`)** | Module 1 & 7: *"User Registration & Login, Navigation"* | **CONTRACTED — DEFECT (A)** | **FIXED & VERIFIED** (Route redirects added) |
| **23** | **Terms & Privacy Checkbox at Registration** | Module 7 (Page 5): *"Privacy Policy, Terms & Conditions"* | **CONTRACTED — DEFECT (A)** | **FIXED & VERIFIED** (Validation block added) |
| **24** | **Removal of Irrelevant Tech E-Books** | Module 3 (Page 3): *"Knowledge Hub in Career Categories"* | **CONTRACTED — CONTENT / CONFIG (C)** | **FIXED & VERIFIED** (Replaced with Green/ESG/IPR) |
| **25** | **External Drive Priority Labeling** | Platform UI standards | **CONTRACTED — CONTENT / CONFIG (C)** | **FIXED & VERIFIED** (Changed to Curated Drive) |
| **26** | **Social Sharing OpenGraph Image (1200x630)** | Page 6: *"SEO Friendly Structure"* | **CONTRACTED — CONTENT / CONFIG (C)** | **FIXED & VERIFIED** (`public/og-image.png` created) |
| **27** | **Next.js SSR Full Architecture Rewrite** | Page 6: *"Scalable Architecture, Responsive Design"* (SPA delivered) | **ADDITIONAL SCOPE (D)** | **SPECIFIED IN CR-04** (₹55,000 / 60 hrs) |
| **28** | **Additional Domain Registrations (.in, .org)** | Page 6: *"Domain: KnowToHire.com"* (Singular) | **ADDITIONAL SCOPE (D)** | **CLIENT TO PURCHASE & CONFIGURE** |

---

## 3. Summary of Contractual Classifications

- **Category A (Contracted — Defect):** 9 items (All 9 fixed and verified).
- **Category B (Contracted — Incomplete):** 6 items (Research documents, White papers, Template requests, Blog filters, Featured jobs, Stripe global integration). *5 completed in code; 1 (Stripe) awaiting client API credentials.*
- **Category C (Contracted — Content / Configuration):** 7 items (Categories, contact placeholders, pricing disclaimers, external drive badges, social image, SEO URLs). *All 7 completed.*
- **Category D (Additional Scope / Enhancements):** 4 items (Pay-per-job workflow, Wise payment gateway, Advanced MRR financial analytics, Next.js SSR rewrite).
- **Category E (Client Input Required):** 8 items (Stripe keys, registered legal entity, full address, phone verification, email inbox confirmation, author names, authoritative pricing sign-off).
