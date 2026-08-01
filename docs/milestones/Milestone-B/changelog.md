# Milestone B: Changelog

## 📝 Modification Log
- `src/lib/services/tenantResolver.ts`: Created new centralized service-layer tenant resolver.
- `src/lib/services/candidateService.ts`: Refactored `uploadResume` to consume resolver internally and removed caller-level parameters.
