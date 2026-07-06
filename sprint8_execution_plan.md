# Sprint 8 Execution Plan: Platform Optimization

Sprint 8 focuses on stabilizing the codebase, code splitting chunks to optimize bundle sizes, implementing full-text search, adding email notifications, and scheduling database routine tasks.

## Tasks & Phases

- [ ] **Phase 1: Performance & Code Splitting**
  - [ ] Implement Route-Level Lazy Loading for Admin CMS, Dashboards, and Public Paths.
  - [ ] Configure Vite code splitting via `manualChunks` to isolate large packages (`lucide-react`, `dompurify`, Supabase JS SDK).
  - [ ] Optimize images and bundle size assets.
  - [ ] Lazy load analytics tracking operations.

- [ ] **Phase 2: Global & Entity Search**
  - [ ] Create a consolidated Search bar accessible from headers.
  - [ ] Implement search routes for Blog Posts, Templates, and Job Listings.
  - [ ] Add PostgreSQL Full-Text Search (FTS) indexes to optimize search query latency.

- [ ] **Phase 3: Notifications System**
  - [ ] Implement In-app notifications tray showing real-time event alerts (purchases, upvote achievements, template submissions).
  - [ ] Connect transaction emails using a third-party gateway (SendGrid, Resend, or Mailgun).
  - [ ] Write logic for email newsletters and weekly job alerts.

- [ ] **Phase 4: Aggregation & Cron Routines**
  - [ ] Implement database scheduling triggers for analytics collection.
  - [ ] Configure database cleanup routines to archive aged records automatically.
  - [ ] Build a queue management view inside `AdminCMS` to monitor transaction states.
