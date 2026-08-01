# Beta Test Script & Acceptance Suite — Know to Hire (v1.4)

## 1. Overview
This test script is designed for external testers and QA teams to manually validate end-to-end user journeys on the Know to Hire platform without requiring developer assistance.

---

## 2. Beta Key Performance Indicators (KPIs)

| Metric | Beta Target | Description |
|---|:---:|---|
| **Candidate Onboarding Success** | **>95%** | Candidate registration and profile setup completion rate. |
| **Resume Builder Completion** | **>95%** | Resume editing and PDF export success rate. |
| **Job Application Completion** | **>95%** | Application submission from Global Discovery. |
| **ATS Stage Transition Reliability** | **100%** | Applicant movement in Employer ATS Kanban board. |
| **Notification Delivery Rate** | **>99%** | In-app and email alert delivery rate. |
| **Critical Runtime Crashes** | **0** | Caught by `ErrorBoundary` with zero application data loss. |
| **Search Discovery Latency** | **<500 ms** | Aggregated search provider response time. |
| **AI Resume Analysis Execution** | **<5 sec** | `AIService` resume feedback scoring time. |
| **Candidate Autonomy** | **>85%** | Candidates complete the onboarding, resume, search, and apply journey without developer help. |
| **Recruiter Autonomy** | **>85%** | Recruiters complete posting, review, rating, and pipeline progression without developer help. |
| **Admin Autonomy** | **>95%** | Admins perform operational checks and broadcasts without engineering assistance. |

---

## 3. End-to-End User Journeys

### Journey 1: Candidate Job Search & Application Flow
```text
1. Open Portal -> 2. Create Candidate Profile -> 3. Edit Resume -> 4. Run AI Analysis
      │
      ▼
5. Export PDF -> 6. Search Jobs -> 7. Quick Apply -> 8. Track Timeline Status
```

### Journey 2: Employer Job Listing & ATS Kanban Pipeline
```text
1. Sign in Employer -> 2. Post New Job -> 3. Receive Applicant Alert -> 4. Open ATS Kanban
      │
      ▼
5. Inspect Candidate Card -> 6. Add Note & 5-Star Rating -> 7. Move Stage to "Interview"
```

### Journey 3: Admin System Operations & Telemetry Audit
```text
1. Access Admin Dashboard -> 2. Inspect Telemetry Metrics -> 3. Send Broadcast Notification -> 4. Review Audit Log
```

---

## 4. Test Execution & Usability Guidelines

### Definition of Autonomous Completion
A task counts as **autonomous** only if the participant completes it without:
* Developer or moderator intervention.
* Interactive hints or verbal prompts.
* Shared-screen guidance.
* Direct navigation assistance.

*Note: Clarifying questions about the testing protocol are allowed; guidance on product functionality is not.*

### Target Time-to-Completion (TTC) bounds
* **Candidate Onboarding:** <10 minutes
* **Resume Creation & Editing:** <15 minutes
* **Job Search & Application:** <3 minutes
* **Recruiter Pipeline Review:** <5 minutes

---

## 5. Suggested Beta Scorecard Template
Moderators should fill out one scorecard for each participant testing session:

| Session Metric | Expected Journey Task | Result Status | TTC (min) | Autonomy Score |
|---|---|---|---|---|
| **Resume Creation** | Completed Profile & Saved Sections | `[ ]` Yes / `[ ]` No | _____ min | `[ ]` Autonomous / `[ ]` Assisted |
| **AI Analysis** | Triggered `AIService` & Inspected Results | `[ ]` Yes / `[ ]` No | _____ min | `[ ]` Autonomous / `[ ]` Assisted |
| **Job Search** | Executed Queries & Applied Filters | `[ ]` Yes / `[ ]` No | _____ min | `[ ]` Autonomous / `[ ]` Assisted |
| **Apply** | Submitted Application to Staged Job | `[ ]` Yes / `[ ]` No | _____ min | `[ ]` Autonomous / `[ ]` Assisted |
| **ATS Transition** | Moved Stage & Saved Evaluation Note | `[ ]` Yes / `[ ]` No | _____ min | `[ ]` Autonomous / `[ ]` Assisted |

**Major Usability Confusion Points:**
1.
2.

