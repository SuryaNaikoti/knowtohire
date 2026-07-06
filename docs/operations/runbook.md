# Operations Runbook

This guide covers daily maintenance tasks and operation schedules for the platform.

## Maintenance Tasks

### 1. Database Migrations
Deploy schema adjustments using the Supabase CLI:
```bash
npx supabase db push
```

### 2. Manual Backup Dumps
Create snapshots:
```bash
npx supabase db dump --linked --schema public > backup_manual.sql
```

### 3. Monitoring Log Review
Audit warnings or crash events in the dashboard using `SystemHealth.tsx`.
