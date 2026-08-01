# Know to Hire — System Architecture Specification (V1.0 Baseline)

## 1. Executive Summary & Baseline Status
**Baseline Status:** 🟢 **Know to Hire Platform Architecture Baseline v1.0 (Frozen)**

The platform architecture is formally established, frozen, and documented. All core services adhere to modular, service-oriented design patterns supported by Architecture Decision Records (ADRs 001–011).

```text
                               ┌────────────────────────────────────────────────────────┐
                               │                    Know to Hire                        │
                               │           v1.0 Architecture Baseline                   │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
        ┌───────────────────┬───────────────────┬──────────┴────────┬───────────────────┬───────────────────┐
        ▼                   ▼                   ▼                   ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│Authentication │   │ Notification  │   │   Search &    │   │  Background   │   │  Telemetry &  │   │AI Productivity│
│   Platform    │   │   Platform    │   │  Discovery    │   │ Jobs Platform │   │   Analytics   │   │    Suite      │
└───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
```

---

## 2. Platform Core Architecture & Service Responsibilities

### 2.1 Authentication & Authorization Platform
- **Service Layer:** `AuthContext`, Supabase Auth integration, role simulation, and protected route guards (`ProtectedRoute`).
- **Audit Logging:** Centralized security audit service (`auditService.ts`) recording compliance actions.

### 2.2 Notification Platform (Sprint 8 / ADR 003–005)
- **Domain Engine (`NotificationEngine`):** Dispatches multi-channel alerts (`in_app`, `email`, `push`).
- **Transports & Preference Evaluator (`PreferenceEvaluator`):** Checks user category preferences before dispatching.
- **Async Queue (`EmailQueue`):** Retries failed emails with exponential backoff strategy ($2^n \times 1000\text{ms}$).
- **Admin Broadcasting (`AdminBroadcastService`):** Audited platform-wide announcements.

### 2.3 Search & Discovery Platform (Sprint 9 / ADR 006–008)
- **Provider Architecture (`SearchProvider`):** Decoupled domain search providers (`JobsSearchProvider`, `BlogSearchProvider`).
- **Aggregator (`SearchService`):** Executes parallel queries and records query performance metrics.
- **Two-Stage Ranking Pipeline:** Stage 1 Deterministic `RankingEngine` $\rightarrow$ Stage 2 Optional `AIReranker`.
- **Discovery Layer (`DiscoveryController`):** Manages `SearchFilters` objects, sorting strategies, and search delegation.
- **History & Saved Searches:** `RecentSearchesService` (browser `localStorage`) and `SavedSearchesService` (saved queries and alert models).

### 2.4 Background Jobs Platform (Sprint 10A / ADR 009)
- **Engine Architecture:** `BackgroundJob` contract $\rightarrow$ `JobRegistry` $\rightarrow$ `JobDispatcher` $\rightarrow$ `JobSchedulerService`.
- **Execution States:** `Pending`, `Queued`, `Running`, `Succeeded`, `Failed`, `Retrying`, `Disabled`.
- **Domain Workers:** `SavedSearchAlertWorker` & `DigestEmailWorker`.

### 2.5 Telemetry & Analytics Platform (Sprint 10B / ADR 010)
- **Service Layer (`AnalyticsService`):** Event buffer tracking cross-cutting telemetry (`AnalyticsEvent` & `AnalyticsSummary`).
- **Aggregation Worker (`AnalyticsAggregationWorker`):** Periodic background job processing telemetry summaries.

### 2.6 AI Productivity Suite (Sprint 10C / ADR 011)
- **Domain Service (`AIService`):** Decoupled AI workflows (`analyzeResume`, `getAIMatches`) consuming Search, Notification, and Telemetry platforms without API drift.

---

## 3. Architecture Decision Records (ADR) Index

| ADR ID | Title | Status |
|---|---|:---:|
| **ADR-001** | Route-Level Lazy Loading Strategy | Accepted |
| **ADR-002** | Vendor Chunking & Rollup Code Splitting Strategy | Accepted |
| **ADR-003** | Event-Driven Notification Platform Architecture | Accepted |
| **ADR-004** | Asynchronous Email Queueing & Modular Templates | Accepted |
| **ADR-005** | Admin Broadcast System Architecture | Accepted |
| **ADR-006** | Centralized SearchService & Provider Architecture | Accepted |
| **ADR-007** | Discovery & Saved Search Architecture | Accepted |
| **ADR-008** | Pluggable Ranking Engine & AI Reranking Architecture | Accepted |
| **ADR-009** | Background Jobs Platform Architecture | Accepted |
| **ADR-010** | Centralized Telemetry & Analytics Platform Architecture | Accepted |
| **ADR-011** | AI Productivity Suite Architecture | Accepted |

---

## 4. Post-v1.0 Roadmap & Architectural Guidelines

1. **Architecture Immutability:** Core service contracts are frozen. Any future structural changes require **ADR-012+**.
2. **Planned Enhancement (Sprint 11/12):** Introduction of a decoupled **Domain Event Bus** for pub/sub messaging across services.
3. **Focus Shift:** Future development will focus strictly on **Product Features** (Resume Builder, ATS, CRM), **Production Engineering** (CI/CD, E2E Testing, Monitoring), **Scale**, and **AI Intelligence**.
