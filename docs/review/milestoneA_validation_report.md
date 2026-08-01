# Milestone A: Runtime Validation Report

This document reports on the behavior of the Tenant Resolver engine across hostnames, subdomains, offline states, and edge conditions.

---

## 🌐 Subdomain & Custom Domain Resolution Flows

### 1. Hostname Resolution Tests
- **`localhost` / `127.0.0.1`:** Resolved as the platform's default root workspace. Branding defaults to primary colors. Verified.
- **`acme.knowtohire.com` (Subdomain):** Splits hostname to parse `acme` as the tenant subdomain. Fetches company metadata. Verified.
- **`careers.company.com` (Custom Domain):** Matches against `custom_domain` field in database company rows. Verified.

### 2. Edge Case Behaviours
- **Offline / API Timeouts:** If the Supabase request fails or times out, the resolver prints warnings to console logging and gracefully falls back to default layout scopes to keep the site interactive.
- **Missing Branding Assets:** If `logo_url` or `banner_url` are null in database records, the UI renders the platform default placeholders cleanly without breaking layouts.

---

## 🧪 Recommended Test Automation Matrix

To prevent regressions in future sprints, the following test suites should be constructed:
1. **Unit Tests (`TenantContext.spec.tsx`):**
   - Test subdomain string parsing matching `window.location.hostname` variations.
2. **Component Tests (`TenantThemeLoader.spec.tsx`):**
   - Assert CSS custom variable property injection on `<html />` element.
3. **Playwright E2E Tests (`multi_tenancy.spec.ts`):**
   - Launch browser with custom host headers (e.g. `testtenant.knowtohire.com`) and verify matching logo text and colors are rendered.
