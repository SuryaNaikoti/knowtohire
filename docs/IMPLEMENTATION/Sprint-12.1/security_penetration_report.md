# Sprint 12.1 – Security Penetration & Vulnerability Assessment Report

This report documents security boundary testing, Row-Level Security (RLS) policies, role isolation, unauthorized route protection, and threat mitigations.

---

## 1. Security Test Matrix

| Attack Vector | Simulated Penetration Scenario | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Tenant Isolation** | Candidate attempting to access `/dashboard/employer` URL | Redirect to candidate dashboard or login | Blocked & Redirected | Passed |
| **Admin Privilege Escalation** | Regular user modifying JWT role claim in local storage | Rejection by backend RLS & API guard | Rejected (403 Forbidden) | Passed |
| **Cross-Tenant RLS** | Employer A requesting applications for Employer B company ID | Empty array returned by Supabase RLS | RLS Enforced | Passed |
| **File Upload Abuse** | Uploading `.exe` executable file renamed to `.pdf` | MIME type verification error | Rejected | Passed |
| **Oversized Upload** | Uploading 50MB file to resume bucket | File size limit error (> 10MB) | Rejected | Passed |
| **XSS Injection** | Submitting `<script>alert('xss')</script>` in role title | Auto-escaped React text node rendering | Rendered Safely | Passed |
| **SQL Injection** | Inputting `' OR 1=1 --` into job search field | Parameterized query handling | Query Escaped | Passed |

---

## 2. Summary Results
- **Penetration Scenarios Executed**: 7
- **Security Vulnerabilities Identified**: 0
- **RLS Policy Enforcement Rating**: 100%
