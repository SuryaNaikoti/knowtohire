# Public Beta Readiness Checklist — Know to Hire (v1.3 Milestone)

## 1. Objective
Ensure that 20–50 real candidates and recruiters can navigate the complete end-to-end hiring journey without developer assistance or blocking defects.

---

## 2. Validation Matrix & Quality Checklist

### A. Candidate Journey
- [ ] **Account Creation & Sign-in:** Register, sign in, and persist profile sessions.
- [ ] **Resume Building & AI Feedback:** Edit resume sections, trigger `AIService` analysis, and export structured PDF.
- [ ] **Job Search & Discovery:** Execute queries, filter categories, and sort results.
- [ ] **Application & Withdrawal:** One-click application submission (`ApplicationService`) and withdrawal mechanism.
- [ ] **Timeline Tracking:** View permission-scoped stage transition history in `CandidateTimeline`.

### B. Employer ATS Journey
- [ ] **Job Creation & Management:** Create job listings and publish to search index.
- [ ] **Applicant Triage & Kanban View:** Drag/move applications across `New` $\rightarrow$ `Reviewing` $\rightarrow$ `Interview` $\rightarrow$ `Offered` $\rightarrow$ `Rejected`.
- [ ] **Candidate Evaluation Notes & Ratings:** Add internal notes, assign 1–5 star ratings, and view triage cards.
- [ ] **Audit Trail History:** Confirm timeline history entries trigger automatic notifications to candidates.

### C. Admin & Platform Operations
- [ ] **System Broadcasts:** Send in-app and email broadcast notifications via `NotificationEngine`.
- [ ] **Telemetry & Analytics Monitoring:** Review aggregated event metrics buffered by `AnalyticsService`.
- [ ] **Role Boundary Guards:** Confirm non-authenticated or unauthorized users are blocked from protected routes.

---

## 3. Resilience, Mobile & Accessibility Checklist
- [ ] **Global Error Boundaries:** `ErrorBoundaryComponent` catches React runtime errors gracefully.
- [ ] **Responsive Mobile Layouts:** Kanban board horizontal scrolling and readable triage cards on mobile/tablet viewports.
- [ ] **Accessibility & Keyboard Nav:** Focus indicators, contrast compliance, and keyboard navigation.
