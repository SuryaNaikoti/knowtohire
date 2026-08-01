# Know to Hire — Engineering Guide & Developer Handbook

Welcome to the **Know to Hire** Engineering Guide. This document defines the engineering standards, architecture governance, and implementation rules for building features on top of the **Platform Architecture Baseline v1.0**.

---

## 1. Governance & Architecture Rules

### Rule 1: Architecture Freeze & Single Responsibility
Platform services (`NotificationEngine`, `SearchService`, `JobSchedulerService`, `AnalyticsService`, `AIService`) are **frozen**. Services must not gain unrelated responsibilities. Features requiring multi-service workflows must compose existing services rather than mutating core internals.

### Rule 2: ADR-First Policy
Any change affecting service boundaries, public interfaces, data ownership, or transport patterns requires an approved **Architecture Decision Record (ADR-012+)** before implementation.

### Rule 3: Backward-Compatible Public Contracts
Interfaces (`SearchProvider`, `BackgroundJob`, `AnalyticsEvent`, `NotificationPayload`) are treated as immutable internal APIs. Prefer optional fields or interface extension over breaking changes.

---

## 2. Directory & Service Organization

```text
src/
├── components/          # Reusable UI components & layouts
├── context/             # React authentication and application state
├── hooks/               # Thin UI controller hooks (e.g., useSearch, useNotifications)
├── lib/
│   ├── services/
│   │   ├── ai/          # AIService & AI models (Sprint 10C)
│   │   ├── analytics/   # AnalyticsService & Telemetry (Sprint 10B)
│   │   ├── jobs/        # JobSchedulerService, JobDispatcher, Registry & Workers (Sprint 10A)
│   │   ├── notifications/# NotificationEngine, EmailQueue, Adapters (Sprint 8)
│   │   ├── search/      # SearchService, RankingEngine, DiscoveryController (Sprint 9)
│   │   └── auditService.ts
│   └── supabase.ts
├── pages/               # Route pages (lazy-loaded via React.lazy)
└── types/               # Global TypeScript domain definitions
```

---

## 3. Definition of Done (DoD) Quality Gates

For any pull request or sprint task to be accepted, it must satisfy all 5 quality gates:

1. **TypeScript Validation:** `npx tsc --noEmit` passes cleanly with **0 errors**.
2. **ESLint Static Analysis:** `npm run lint` passes cleanly with **0 warnings/errors**.
3. **Production Build:** `npm run build` generates optimized Rollup chunks without warnings.
4. **Documentation Sync:** `SYSTEM_ARCHITECTURE_V3.md` and `docs/adr/` updated if new ADRs are introduced.
5. **No Superficial Symptom Patches:** All edge cases and null states explicitly handled with zero swallowed exceptions.

---

## 4. Coding Conventions

- **Type Safety:** Always use `import type { ... }` for type-only symbols (`verbatimModuleSyntax`).
- **Hooks & Controllers:** Keep React components presentational; delegate side effects and orchestration to domain services or controller hooks.
- **Icons & UI Tokens:** Use Lucide icons (`lucide-react`) and Vanilla Tailwind/CSS design system tokens.

---

## 5. Sprint Architecture Review Checkpoint

At the end of every sprint, verify the following checklist:

- [ ] Did any feature bypass an existing platform service?
- [ ] Did any platform service gain an unapproved second responsibility?
- [ ] Was a new Architecture Decision Record required and recorded?
- [ ] Were any public contracts or service interfaces broken?
- [ ] Are `SYSTEM_ARCHITECTURE_V3.md` and ADR documentation in sync?
- [ ] Did all 5 Definition of Done quality gates pass (`tsc`, `lint`, `build`)?

---

## 6. Release & Semantic Versioning Strategy

- **v1.0 (Frozen):** Platform Architecture Baseline (Sprints 8–10).
- **v1.1 (Sprint 11):** Product Features (Resume Builder, ATS, Candidate CRM).
- **v1.2 (Sprint 12):** Domain Event Bus & Observability Improvements.
- **v1.3 (Sprint 13):** Production Engineering & Testing Automation.
- **v1.4 (Sprint 14):** Expanded AI Intelligence Suite.
- **v2.0:** Major architectural shifts (e.g., backend microservices migration).
