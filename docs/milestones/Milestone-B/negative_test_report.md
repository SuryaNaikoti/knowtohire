# Negative Testing & Threat Assessment Report

This report outlines structured threat testing scenarios, expected system behaviors, and actual implementation outcomes.

---

## ⚡ Threat Matrix & Vulnerability Tests

### 1. Host Header Injection / Tenant Spoofing
- **Test:** Attackers supply a spoofed `window.location.hostname` (e.g. `victim.knowtohire.com`) to access another tenant's branding layout.
- **Expected Outcome:** System resolves the subdomain and loads matching layout assets.
- **Security Check:** Even if custom domains/branding load, PostgreSQL Row-Level Security policies intercept and reject any data reads/updates if the user's JWT session does not possess valid membership mappings in the target company.
- **Verdict:** ✅ Safe (Isolated by RLS).

### 2. Cross-Tenant Storage Tampering
- **Test:** A candidate belonging to `tenant-a` attempts to upload or read a resume located in `resumes/tenant-b/resume.pdf`.
- **Expected Outcome:** Supabase Storage policy checks user claims, detects a mismatch, and rejects the request with `403 Forbidden`.
- **Verdict:** ✅ Safe (Enforced by cloud storage policies).

### 3. Unknown Production Hostnames
- **Test:** Accessing the platform from an unregistered production domain.
- **Expected Outcome:** Startup validator detects the host isn't configured, falls back safely to default platform configs, and prevents active credential loading.
- **Verdict:** ✅ Safe.
