# Sprint 8 Execution Plan: Platform Optimization

Sprint 8 focuses on stabilizing the codebase, code splitting chunks to optimize bundle sizes, implementing full-text search, adding email notifications, and scheduling database routine tasks.

## Tasks & Phases

- [x] **Phase 1: Performance & Code Splitting**
  - [x] Implement Route-Level Lazy Loading for Admin CMS, Dashboards, and Public Paths.
  - [x] Configure Vite code splitting via `manualChunks` to isolate large packages (`lucide-react`, `dompurify`, Supabase JS SDK).
  - [x] Optimize images and bundle size assets.
  - [x] Lazy load analytics tracking operations.

- [x] **Phase 2: Global & Entity Search**
  - [x] Create a consolidated Search bar accessible from headers.
  - [x] Implement search routes for Blog Posts, Templates, and Job Listings.
  - [x] Add PostgreSQL Full-Text Search (FTS) indexes to optimize search query latency.

- [x] **Phase 3: Notifications System**
  - [x] Implement In-app notifications tray showing real-time event alerts (purchases, upvote achievements, template submissions).
  - [x] Connect transaction emails using a third-party gateway (SendGrid, Resend, or Mailgun).
  - [x] Write logic for email newsletters and weekly job alerts.

- [x] **Phase 4: Aggregation & Cron Routines**
  - [x] Implement database scheduling triggers for analytics collection.
  - [x] Configure database cleanup routines to archive aged records automatically.
  - [x] Build a queue management view inside `AdminCMS` to monitor transaction states.
