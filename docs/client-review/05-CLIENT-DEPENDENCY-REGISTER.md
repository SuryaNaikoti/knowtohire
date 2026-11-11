# CLIENT DEPENDENCY REGISTER — KNOWTOHIRE.COM

**Document Version:** 1.0.0 (Phase 4 Release Preparation)  
**Date:** 10 November 2026  
**Auditor:** DeepMind Antigravity  
**Client:** Dr. Rajeev Ranjan  

---

## 1. Executive Summary

This register catalogs all outstanding business, legal, credential, and infrastructure dependencies that require official input, confirmation, or action from Dr. Rajeev Ranjan before final deployment and handover.

None of these items require additional development fees; they are administrative and operational inputs necessary for production go-live.

---

## 2. Itemized Client Dependencies

| ID | Topic / Requirement | Current Operational State | Required Client Action | Priority |
|---|---|---|---|:---:|
| **DEP-01** | **Registered Corporate Entity Name & Address** | Contact and Refund pages display "Registered Office: Goa, India (Pending client corporate confirmation)". | Provide full registered legal entity name, complete Goa registered street address, and CIN/LLPIN for website policies. | **HIGH** |
| **DEP-02** | **Official Public Customer Support Phone** | Currently displays `+91 89195 18016 (Awaiting client verification)`. | Confirm whether `+91 89195 18016` is the permanent public helpline or provide alternate contact number. | **HIGH** |
| **DEP-03** | **Official Customer Care Email** | Currently displays `support@knowtohire.com`. | Confirm that `support@knowtohire.com` is active and monitored in Google Workspace or Hostinger Webmail. | **HIGH** |
| **DEP-04** | **Stripe vs. Wise International Payment Clarification** | Proposal Module 8 specifies Stripe for global transactions; kickoff document specifies Wise. Stripe in India requires an invitation. Razorpay is active for INR. | Clarify if international transactions should be handled via Wise bank transfer instructions or if Stripe invitation/onboarding will be provided. | **HIGH** |
| **DEP-05** | **Authoritative Template & Guide Retail Pricing** | Database seed records currently set to ₹0, ₹12, ₹25. Code has been synchronized to these records. | Review and confirm final retail price points (e.g. ₹0, ₹499, ₹799, ₹1299) before commercial public marketing launch. | **MEDIUM** |
| **DEP-06** | **Author & Institutional Attribution Permissions** | Knowledge Hub and Blog articles currently use standardized industry tags and general author titles. | Supply list of authorized author names, professional bios, and photos for guides and articles. | **MEDIUM** |
| **DEP-07** | **Hostinger Web Hosting Credentials** | Production frontend is hosted on Vercel (`www.knowtohire.com`). Proposal specified Hostinger Business Hosting. | Provide Hostinger hPanel login or FTP/SSH credentials if client desires production migration to Hostinger. | **MEDIUM** |
| **DEP-08** | **Additional Domain Registrations (.in, .org, .net)** | Deliverable covers `knowtohire.com`. Client review requested `.in`, `.org`, and `.net`. | Confirm if client has purchased additional domains and provide registrar DNS access for 301 redirect configuration. | **LOW** |

---

## 3. Communication & Sign-Off Procedure

Please review this register and provide decisions/credentials via secure email to the project manager. Sensitive secrets (such as Stripe API keys or Hostinger passwords) should be transmitted using a secure, temporary secret-sharing link (e.g. Bitwarden Send or 1Password link) rather than plaintext email.

