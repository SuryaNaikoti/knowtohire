# Sprint 12.0 – Security Audit & Vulnerability Assessment Report

This report documents the security validation, Row-Level Security (RLS) enforcement, input sanitization, and authentication boundary checks.

---

## 1. Row-Level Security (RLS) Enforcement
- **Candidate Data Isolation**: Candidates can only access and mutate their own profile, resumes, applications, and saved jobs (`auth.uid() = candidate_id`).
- **Employer Data Isolation**: Employers can only access candidate applications submitted to their own company listings (`auth.uid() = employer_id`).
- **Admin Access**: Restricted to Super Admin role claims.

---

## 2. Input Sanitization & Threat Protection
- **XSS Prevention**: React auto-escaping verified across user text fields.
- **CSRF & Injection Risks**: Parameterized queries enforced via Supabase JS SDK.
- **File Upload Security**: Strict MIME type checking and file size caps (max 10MB).
