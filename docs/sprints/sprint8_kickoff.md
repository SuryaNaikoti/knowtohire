# Sprint 8 Kickoff Plan

Sprint 8 shifts the focus from feature expansion to platform stabilization, code-splitting optimizations, universal search, alert workflows, and scheduled database routine aggregations.

## Objectives & Focus Areas

### 1. Performance & Bundle Splitting
- Split vendor dependencies (`lucide-react`, `dompurify`, Supabase SDK) into separate chunks.
- Setup code splitting for routing: lazy load dashboard views separately from public landing paths.
- Setup lazy loading for analytics trackers.

### 2. Search Integration
- Build a global multi-entity search bar (jobs, blog posts, resources, templates) powered by Postgres Full-Text Search.
- Create FTS indexes to optimize search responses.

### 3. Notification Engine
- In-app notification tray for state events (purchases, upvote completions, new templates).
- E-mail notification pipeline integration (SendGrid/Resend).

### 4. Admin Monitoring
- Add queue monitors and error tracking inside `AdminCMS`.
- Aggregate database diagnostics dashboard.

### 5. Scheduled Routines
- Add scheduled cron triggers to run analytical summary aggregations.
- Automate cleanups of older event traces and run maintenance jobs.
