# Sprint 10 Risk Register

| Risk Event | Severity | Probability | Mitigation Strategy |
|---|---|---|---|
| **Subdomain routing resolution failure** | High | Medium | Implement wild-card SSL certs and fallback routing hooks in middleware |
| **Connection pool exhaustion** | Critical | Low | Setup pgBouncer constraints and pool limits on Supabase |
| **Workflows processing lag** | Medium | Medium | Decouple webhook executions using background async queue monitors |
