# Public Beta Decision Log — Know to Hire (v1.4)

This decision log tracks key architectural, product, and scope trade-offs made during the execution of the public beta testing program. Unlike `KNOWN_ISSUES.md`, which tracks technical bugs, this log captures the **rationale, context, and ownership** behind our decisions to progress, defer, or modify product capabilities.

## Operating Rules for Beta Decisions
1. **Scope Boundary Guard:** No new feature work is permitted unless it directly unblocks a candidate or recruiter from completing the core hiring journey.
2. **Resolution Tiering:**
   * **Fix immediately:** if an issue blocks the hiring journey or creates significant friction.
   * **Log for future sprint:** if it is an enhancement or non-blocking UX addition.
3. **Documentation Freeze Guard:** No new governance or process documents are permitted during Sprint 14 unless an existing document cannot reasonably capture the required information.

---

## Documentation Governance & Source of Truth Matrix
To prevent duplication and keep documentation maintainable, refer to the following single sources of truth for updates during the beta validation program:

| Information Domain | Primary Source of Truth | File Link / Location |
|---|---|---|
| **Architecture & boundaries** | `SYSTEM_ARCHITECTURE_V3.md` + ADRs | [SYSTEM_ARCHITECTURE_V3.md](file:///e:/data/Know%20to%20Hire/SYSTEM_ARCHITECTURE_V3.md) / `docs/adr/` |
| **Engineering standards & quality** | `ENGINEERING_GUIDE.md` | [ENGINEERING_GUIDE.md](file:///e:/data/Know%20to%20Hire/ENGINEERING_GUIDE.md) |
| **Active defects & backlog** | `KNOWN_ISSUES.md` | [KNOWN_ISSUES.md](file:///e:/data/Know%20to%20Hire/KNOWN_ISSUES.md) |
| **Beta observations & metrics** | `BETA_FEEDBACK_REPORT.md` | [BETA_FEEDBACK_REPORT.md](file:///e:/data/Know%20to%20Hire/BETA_FEEDBACK_REPORT.md) |
| **Product decisions & scope changes** | `BETA_DECISION_LOG.md` | [BETA_DECISION_LOG.md](file:///e:/data/Know%20to%20Hire/BETA_DECISION_LOG.md) |
| **Roadmap & milestones** | `PRODUCT_ROADMAP.md` | [PRODUCT_ROADMAP.md](file:///e:/data/Know%20to%20Hire/PRODUCT_ROADMAP.md) |

---

## Logged Decisions

| Date | Decision | Trigger | Alternatives Considered | Outcome | Owner |
|---|---|---|---|---|---|
| **2026-07-24** | **Freeze new features** | Sprint 14 beta kickoff | Continue Sprint 15 billing and subscription implementation | **Freeze accepted**; focus strictly on stability, polish, and UX improvements | Product & Engineering |
| **2026-07-24** | **Defer multi-resume support** | Pre-beta candidate feedback on resume uploads | Implement multi-resume schema and storage migrations immediately | **Deferred to Sprint 15**; core hiring funnel operates successfully with a single resume | Product |
| **2026-07-24** | **Fix mobile ATS layout wrapping** | Mobile viewport rendering overlap on Kanban board | Fallback to standard vertical list layouts on small screens | **Immediate styling hotfix scheduled** to fix Kanban card badge wrapping | Engineering |
| **2026-07-24** | **Retain raw AI analysis score formatting** | Pre-beta user review of `AIService` scoring outputs | Normalize scores to percentage metrics or letter grades (A–F) | **Kept raw 0–100 formatting**; testing confirmed candidates correctly understood the scoring bounds | Product |

---

## Go / No-Go Validation Criteria Tracker
* **Requirement 1 (0 Critical Issues):** *Pending final beta verification*
* **Requirement 2 (0 High Issues):** *Pending final beta verification*
* **Requirement 3 (Workflow Completion >85%):** *Pending final beta verification*
