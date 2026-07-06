# Disaster Recovery Plan

This guide outlines restoration procedures in the event of database or server infrastructure failures.

## Recovery Procedures

### 1. Database Restoration
Restore the database schema using a SQL dump:
1. Reset the remote database instance:
   ```bash
   npx supabase db reset --linked
   ```
2. Re-apply the schema and seed data:
   ```bash
   psql -h db.roqbodprqmnwxdjsskgb.supabase.co -U postgres -f backup_before_sprint6.sql
   ```

### 2. Recovery Metrics
- **RTO:** 15 minutes
- **RPO:** 24 hours (supported by daily automated cron dumps)
