# Sprint 9 Implementation Plan - Candidate Profile Architecture & Career Intelligence Widget Platform

This plan defines the technical implementation strategy and governing engineering standards for Candidate Profile Services and the Candidate Dashboard.

---

## 1. Architectural Principles & Layers

Every implementation follows these principles:
- **SOLID Principles**: Maintain Single Responsibility and Dependency Inversion.
- **Layered Architecture**: Strictly separate UI components from business services and repositories:
  `Presentation Layer (UI)` -> `Application Layer (Services)` -> `Domain Contracts (Interfaces)` -> `Persistence Layer (Mappers & Repositories)`.
- **Dependency Rules**: All dependency directions point inward. UI components never access repositories or databases directly.

---

## 2. Directory Structure & Domain Isolation

We organize modules by domain in `src/lib/domains/` and `src/pages/dashboard/candidate/`:
- `shared/`: Common validation rules, database repositories, and draft providers.
- `candidate/`: Candidate education, experience, credentials, and portfolio.
- `ai/`: AI providers and career insights orchestration.
- `analytics/`: Telemetry handlers and standardized contracts.

---

## 3. Reusable Repositories, Domain Mappers, and Validation

#### [NEW] [SupabaseRepository.ts](file:///e:/data/Know%20to%20Hire/src/lib/services/SupabaseRepository.ts)
- Exposes generic CRUD operations, filters, sorting, transactions, and pagination.

#### [NEW] [ValidationService.ts](file:///e:/data/Know%20to%20Hire/src/lib/validation/ValidationService.ts)
- Orchestrates validator modules: `DateValidator`, `URLValidator`, `DuplicateValidator`, `LengthValidator`, `RequiredValidator`, `FileValidator`.

#### [NEW] [ProfileCompletionService.ts](file:///e:/data/Know%20to%20Hire/src/lib/services/ProfileCompletionService.ts)
- Deterministically computes the completion percentage, ATS readiness, and priority recommendations.

#### [NEW] [CareerIntelligenceService.ts](file:///e:/data/Know%20to%20Hire/src/lib/services/CareerIntelligenceService.ts)
- Integrates profile scores and telemetry events into unified ATS metrics.

#### [NEW] [DraftStorageProvider.ts](file:///e:/data/Know%20to%20Hire/src/lib/services/DraftStorageProvider.ts)
- Abstraction layer specifying draft operations, implementing `LocalStorageDraftProvider`.

#### [NEW] [AIProvider.ts](file:///e:/data/Know%20to%20Hire/src/lib/services/ai/AIProvider.ts)
- Agnostic interface for LLM completions, implementing `GeminiProvider`.

---

## 4. Widget Platform, Event Contracts, and Layout Engine

#### [NEW] [widgetTypes.ts](file:///e:/data/Know%20to%20Hire/src/pages/dashboard/candidate/widgets/widgetTypes.ts)
- Defines the `DashboardWidget` interface detailing standard lifecycle methods (`load`, `render`, `refresh`, `dispose`, `analytics`).
- Defines categories: `Profile`, `Career`, `Jobs`, `Knowledge`, `Marketplace`, `AI`, `Notifications`, `Analytics`, `System`.

#### [NEW] [DashboardService.ts](file:///e:/data/Know%20to%20Hire/src/lib/services/DashboardService.ts)
- Manages Widget Registry, Permission Filters, and Feature Flag filter pipeline.

#### [NEW] [Widget Event Contracts]
- Exposes event definitions (`ProfileUpdated`, `ResumeUploaded`, `ApplicationSubmitted`) for loose coupling.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to confirm zero TS or compile errors.

### Manual Verification
- Test interactive widgets, form validations, draft restoration, and analytics event logging.
