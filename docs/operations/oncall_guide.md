# On-Call Guide

Incident response and escalation procedures for active support engineers.

## Escalation Matrix

### 1. Alerting Triggers
UptimeRobot monitors check the `/health` endpoint. Sentry captures error spikes.

### 2. Escalation Steps
- **Level 1 Support:** Acknowledge alert, check system health metrics, verify DB cpu utilization.
- **Level 2 (DBA):** Escalated for RLS policy bugs or database connection pool exhaustion.
- **Level 3 (Super-Admin):** Security breaches or Clerk access tokens expiration.
