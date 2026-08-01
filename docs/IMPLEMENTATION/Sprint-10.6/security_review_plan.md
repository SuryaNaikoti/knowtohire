# Security Review Plan

Protocol for auditing safety parameters before deployment.

---

## 1. Parameters & Audits
- **RLS Boundary Verification**: Audit Supabase candidate and employer tenant separation policies.
- **Analytics Payloads**: Ensure no PII (emails, passwords, phone numbers) is included in tracked metadata properties.
- **File Upload Security**: Enforce MIME check policies on resume PDF files.
- **Role Authorization**: Verify employer features cannot be bypassed using routing parameters.
