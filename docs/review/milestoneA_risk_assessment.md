# Milestone A: Risk Assessment Report

This report evaluates security vulnerabilities, information disclosure, and architectural risks introduced by runtime multi-tenant hostname resolution.

---

## ⚡ Multi-Tenant Security Evaluation

### 1. Hostname Injection / Spoofing Risk
- **Vulnerability:** Resolving tenants strictly via `window.location.hostname` creates a spoofing risk if the client proxies dynamic hosts or injects custom headers.
- **Impact:** Medium. While branding parameters can be altered, database-level queries are protected by Supabase Row-Level Security policies tied to the authenticated JWT role and memberships, ensuring database contents cannot be exposed via header spoofing alone.
- **Mitigation:** Enforce strict domain whitelists on the backend/Supabase database level.

### 2. Cross-Tenant Information Disclosure
- **Vulnerability:** Common shared CDN or service-layer query caching might leak tenant data objects between users.
- **Impact:** High.
- **Mitigation:** Ensure all data fetching services check the tenant identity verified inside the database membership relation rather than relying on cached memory parameters.

---

## 📋 Remediation Backlog

| Risk ID | Description | Severity | Recommended Fix | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | Inline Context Re-renders | **Medium** | Memoize the TenantProvider value object using `useMemo()`. | High |
| **RISK-02** | Missing useEffect Cleanup | **Low** | Introduce boolean cancel checks to prevent memory leaks on unmount. | Medium |
