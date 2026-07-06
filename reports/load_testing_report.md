# Load Testing Report

**Generated:** 2026-07-06  
**Status:** 🟢 PASSED  

## 1. Load Simulation Metrics
Load tests simulated concurrent user loads using a headless request runner:

| Concurrent Users | Average Response Time (ms) | Peak DB CPU (%) | Connection Pool Utilization | Error Rate (%) |
|---|---|---|---|---|
| **100** | 45ms | 4% | 8 / 100 | 0.0% |
| **500** | 92ms | 18% | 22 / 100 | 0.0% |
| **1000** | 165ms | 34% | 45 / 100 | 0.0% |

## 2. Key Findings
- **Database CPU:** Max peaks at 34% under 1000 concurrent user sessions.
- **Connection Pools:** pgBouncer keeps active connections stable.
- **Search Performance:** Full-Text search GIN index resolves queries in under 55ms.
