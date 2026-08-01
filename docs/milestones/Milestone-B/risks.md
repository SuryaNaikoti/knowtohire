# Milestone B: Risk Assessment Report

## ⚡ Identified Risks
- **Null Tenant Scopes:** If `tenantId` is omitted, the path falls back to candidate prefix root.
- **Mitigation:** Ensure caller page context resolves `tenantId` from the hook before submitting file uploads.
