# 📌 KnowToHire — Version 2+ Deferred Backlog Registry

> **Status:** Active Backlog (Post-V1.0 Launch Enhancements)  
> **Governance:** Strict Feature Freeze in effect for V1.0. All items below are preserved in the codebase (hidden/feature-flagged) and deferred until after public V1.0 production launch.

---

## Executive Summary

To guarantee a clean, timely, zero-defect V1.0 production release of KnowToHire, all enterprise SaaS, generative AI, multi-tenancy, and advanced telemetry capabilities are deferred to Version 2+. No code has been destroyed; features have been feature-flagged, hidden from navigation, or deferred at the route level to ensure maximum software stability.

---

## Deferred Feature Registry

| ID | Title | Business Value & Reason | Complexity | Dependencies | Priority |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **V2-001** | **Enterprise Multi-Tenancy Architecture** | Supports white-labeling, custom CNAME domain binding (`careers.acme.com`), and multi-org hierarchies (`Tenant` $\rightarrow$ `Org` $\rightarrow$ `Workspace`). Deferred to keep V1 database operations simple and flat. | High | PG schema migration, DNS resolver Edge functions | P2 |
| **V2-002** | **Generative AI Career Coach & Interview Simulator** | Provides AI-generated career roadmaps, resume feedback, and interactive mock interview questions using Gemini LLM. Deferred to avoid external LLM rate limit and latency risks during initial launch. | Medium | Gemini API key configuration, AIProviderRegistry | P2 |
| **V2-003** | **Recruiter Talent Scout & Active Sourcing CRM** | Allows employers to perform active candidate sourcing across passive job seeker profiles outside specific job postings. Deferred to focus V1 Employer Dashboard strictly on active job application triage. | Medium | Profile visibility settings, recruiter messaging | P3 |
| **V2-004** | **Client-Side Telemetry Event Buffering Platform** | Tracks micro-events (clicks, hovers, scroll depth) in a client event buffer and flushes to analytics workers. Deferred in favor of lightweight server audit logging. | Medium | Client event queue, analytics worker cron | P3 |
| **V2-005** | **Custom Asynchronous Job Scheduler Framework** | In-browser background job dispatcher with exponential retries for saved search alerts and digest emails. Deferred in favor of standard Supabase Edge Function triggers. | High | JobRegistry, background worker loop | P3 |
| **V2-006** | **AI Job & Candidate Semantic Matching Engine** | Calculates vector embeddings for automated candidate-to-job semantic scoring and AI reranking. Deferred to keep search deterministic and fast in V1. | High | pgvector / Supabase Vector embeddings | P3 |
| **V2-007** | **Multi-Transport Asynchronous Email Queue** | Complex transactional email retry queue with exponential backoff. Deferred; standard Supabase transactional email triggers are sufficient for V1. | Medium | SMTP provider, edge email queue | P2 |
| **V2-008** | **Native HTML5 Kanban Drag-and-Drop** | Enhances applicant stage movement with visual drag-and-drop cards across columns. Currently supported via single-click stage dropdown selectors. | Low | HTML5 DnD / DndKit library | P2 |

---

## Architectural Extensibility & Preservation Guidelines

1. **Do Not Delete Code:** All underlying schema columns (`tenant_id`, `org_id`), service layer classes (`AICareerCoachService.ts`, `telemetryService.ts`), and helper utilities are preserved in the codebase.
2. **Feature-Flagging:** Features are disabled via feature flag constants (e.g., `VITE_ENABLE_AI_COACH=false`) and clean React Router navigation redirects.
3. **Activation Protocol:** Post-V1.0, items will be activated sequentially based on real user feedback gathered during V1.0 public operation.
