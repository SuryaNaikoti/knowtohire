# Know to Hire — Product & Launch Roadmap Specification (V1.4 Milestone)

## 1. Executive Summary & Launch Milestone Matrix
**Status:** 🟢 **Sprint 14 (v1.4 Real User Validation) Formally Accepted & Signed Off**

Sprint 14 has successfully validated the platform with real user feedback, empirical KPI benchmarks, and zero critical/high blocking defects, assembling **Release Candidate 1 (RC1)**.

```text
                               ┌────────────────────────────────────────────────────────┐
                               │                    Know to Hire                        │
                               │           Milestone: Business Readiness                │
                               └───────────────────────────┬────────────────────────────┘
```

---

## 2. Updated Product Milestone Progress Matrix

| Milestone | Status | Description |
|---|:---:|---|
| **Platform Foundation (v1.0)** | ✅ **Complete** | ADRs 001–011 frozen platform baseline services. |
| **Core Hiring Workflow (v1.1)** | ✅ **Complete** | End-to-end candidate application to ATS pipeline. |
| **Workspace Experience (v1.2)** | ✅ **Complete** | JobApplication aggregate, ATS Kanban, shared timeline. |
| **Public Beta Readiness (v1.3)** | ✅ **Complete** | Security audit, `ErrorBoundary`, failure path handling. |
| **Real User Validation (v1.4)** | ✅ **Complete** | `BETA_FEEDBACK_REPORT.md`, 0 Critical/High issues, RC1 build. |
| **Business Readiness (v1.5)** | 🟡 **In Progress** | Subscriptions, billing, usage limits, marketplace. |
| **General Availability (v1.0 Release)** | ⬜ **Not Started** | Final monitoring, backups, disaster recovery, docs. |

---

## 3. Sprint 15 Focus: Business Readiness & Commercial Capabilities

**Goal:** *Implement monetization features, subscription tier enforcement, billing adapters, and marketplace billing.*

1. **Subscription Plans & Tier Enforcement:** Free vs. Pro Candidate and Employer plan limits.
2. **Billing & Payment Adapters:** Integrate Stripe payment checkout adapters.
3. **Usage Limits & Quotas:** Enforce monthly job posting and AI resume analysis quotas.
4. **Marketplace Monetization:** Support premium resume template and resource purchases.
