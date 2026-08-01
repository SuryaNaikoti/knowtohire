# Known Issues & Enhancement Backlog — Public Beta (v1.4)

## 1. Severity Classifications & Release Criteria
| Severity | Definition | RC1 Exit Gate |
|---|---|:---:|
| **Critical** | Blocks candidate application or employer ATS workflow. | 0 Allowed |
| **High** | Major feature degraded without direct workaround. | 0 Allowed |
| **Medium** | Minor feature issue with simple workaround. | Documented |
| **Low / Cosmetic** | Visual alignment or text polish item. | Deferred to v1.5 |

---

## 2. Feedback Categories
`[Bug]` `[Performance]` `[UX]` `[Accessibility]` `[Mobile]` `[Search]` `[ATS]` `[Resume]` `[AI]` `[Notifications]`

---

## 3. Issue Register

| ID | Issue Description | Category | Severity | Status | Target |
|---|---|:---:|:---:|:---:|:---:|
| **ISSUE-001** | Resume export uses browser `window.print()` layout instead of server-side PDF stream. | `[Resume]` | Low | Tracked | Sprint 15 |
| **ISSUE-002** | ATS Kanban board drag-and-drop utilizes dropdown select instead of HTML5 drag handlers. | `[ATS]` | Medium | Tracked | Sprint 15 |
| **ISSUE-003** | OAuth provider login requires explicit callback URL verification in staging environments. | `[Security]` | Medium | Resolved | Sprint 13 |
| **ISSUE-004** | Large ATS Kanban columns (>50 candidates) require virtualized scrolling. | `[Performance]` | Low | Deferred | Sprint 15 |

---

## 4. Scope Boundary Rule
> **Rule:** Any issue preventing a candidate from creating a resume or applying for a job, or preventing an employer from reviewing applicants, MUST be resolved immediately. Non-blocking UX enhancements MUST be logged for Sprint 15.
