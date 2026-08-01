# Sprint 10.7 UI Redesign Plan - Premium SaaS Candidate Dashboard

This plan specifies the design language, layout restructuring, and component definitions to transform the Candidate Dashboard.

## Design Philosophy & Tokens
- **Theme**: Premium light-mode with `#F8F9FA` background, minimal borders, rounded cards (`16px-20px`), and soft subtle shadow depth.
- **Typography**: Inter. Large headers with strong visual weighting hierarchy.
- **Aesthetic**: Reduction of text density by 40% replaced with visual micro-charts, progress indicators, status badges, and cleaner padding.

---

## 1. Sidebar Refactoring
Redesign the sidebar to support the requested Navigation Groups with active hover indicators:
- **Career**: Dashboard, Profile, Resume, Experience, Education, Skills, Certifications, Portfolio.
- **Jobs**: Explore Jobs, Saved Jobs, Applications, Job Alerts.
- **Learning**: Career Roadmap, Learning Hub, Certifications, AI Coach.
- **Account**: Notifications, Purchases, Billing, Settings.
- **Footer**: Role Switcher.

---

## 2. Main Grid Redesign (12-column layout)
- **Top Row**: 6 premium KPI cards (Career Score, Resume Health, Job Match %, Recruiter Visibility, Applications, Interview Readiness) featuring micro progress trackers.
- **Left Column (8 columns)**: AI Career Overview, Top Recommended Jobs, Active Applications timeline, Resume Health circular metric, Learning Roadmap.
- **Right Column (4 columns)**: AI Career Coach feed, Upcoming Interviews list, Pending Tasks checklist, Trending Skills tags, Recommended Certifications cards, Quick Actions shortcuts.
- **Bottom Row**: Career Analytics graphs (Applications, Interviews, Views).
