# Milestone B: Implementation Report (Refined)

## 🛠️ Completed Changes

### 1. Centralized Tenant Resolver
- **File:** [tenantResolver.ts](file:///e:/data/Know%20to%20Hire/src/lib/services/tenantResolver.ts)
- **Feature:** Singleton utility that parses client subdomains directly from `window.location.hostname` at runtime, mapping matches dynamically in the service tier.

### 2. Candidate Service Encapsulation
- **File:** [candidateService.ts](file:///e:/data/Know%20to%20Hire/src/lib/services/candidateService.ts)
- **Method:** `uploadResume(candidateId, file)`
- **Change:** Removed the UI-level `tenantId` parameter completely. The service now invokes `tenantResolver.getResolvedTenantId()` internally on dispatch to prepend the resolved scope to the upload path.
