# KNOWTOHIRE — AUTHENTICATION UI SPECIFICATION
## Module 01: Task 03 — Production Authentication UI Screens & Flow Integration

---

## 1. Executive Summary

Task 03 delivers the complete production-quality authentication user interface for KnowToHire. Built using the approved **KnowToHire Design System** ("Professional Intelligence"), it includes high-trust, responsive screens for **Login**, **Registration**, **Email Verification**, **Forgot Password**, and **Reset Password**. All forms connect directly to `AuthContext` and Supabase Auth with complete client-side validation, password strength indicators, generic email warnings for employers, and role-based post-login navigation.

---

## 2. Authentication Page Inventory

| Route | Component | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `LoginPage.tsx` | Guest Only (`GuestRoute`) | Sign in with email & password. |
| `/register` | `RegisterPage.tsx` | Guest Only (`GuestRoute`) | Account creation with Candidate & Employer role selection. |
| `/verify-email` | `VerifyEmailPage.tsx` | Authenticated / Guest | Email verification gate with 60s resend cooldown. |
| `/forgot-password` | `ForgotPasswordPage.tsx` | Guest Only (`GuestRoute`) | Request password reset instructions link. |
| `/reset-password` | `ResetPasswordPage.tsx` | Recovery Session | Set new account password. |

---

## 3. Reusable Auth Layout (`AuthLayout.tsx`)

All authentication screens are rendered within [AuthLayout.tsx](file:///e:/Projects/KnowToHire/src/components/auth/AuthLayout.tsx):
- **Desktop (1280px+):** Balanced two-column grid.
  - **Left Column:** Dark slate/indigo gradient hero banner displaying brand identity, value propositions (Verified Roles, ATS Pipelines, Knowledge Hub), and security badges.
  - **Right Column:** Centered white authentication form card.
- **Mobile (375px - 767px):** Full-width, single-column responsive card layout with touch targets >= 44px and zero horizontal overflow.

---

## 4. Login Flow & Specification (`LoginPage.tsx`)

- **Heading:** "Welcome back"
- **Copy:** "Sign in to continue your career or hiring journey."
- **Fields:**
  - `email`: Required, email format validation.
  - `password`: Required, minimum 6 characters, show/hide toggle.
- **Actions:**
  - Primary button: `Sign In to KnowToHire` (shows `isLoading` spinner state and disables submit during execution).
  - Link: `Forgot password?` (`/forgot-password`).
  - Link: `Don't have an account? Create one` (`/register`).
- **Post-Login Routing Matrix:**
  - Database role `candidate` + `active` status ➔ `/candidate`
  - Database role `employer` + `active` status ➔ `/employer`
  - Database role `admin` + `active` status ➔ `/admin`
  - Status `pending_onboarding` ➔ `/onboarding/candidate` or `/onboarding/employer`
  - Status `suspended` ➔ Suspended Account Alert card

---

## 5. Registration Flow & Specification (`RegisterPage.tsx`)

- **Role Selector Tabs:**
  - **Candidate:** "Find better opportunities and grow your career."
  - **Employer / Recruiter:** "Find better talent and build stronger teams."
  - *Admin Option:* Strictly omitted. Admin accounts cannot be self-registered.
- **Form Fields:**
  - `fullName`: Required, min 2 characters.
  - `email`: Required, valid email format.
  - `companyName`: Required for Employer accounts only.
  - `password`: Required, min 8 characters, min 1 uppercase letter, min 1 number.
  - `confirmPassword`: Required, must match `password`.
- **Password Strength Indicator:**
  - Real-time visual progress bar (`Weak` -> `Good` -> `Strong`) evaluating length, uppercase, numbers, and special symbols.
- **Employer Email Domain Warning:**
  - Non-blocking informational warning displayed if an employer uses a generic email provider (`gmail.com`, `yahoo.com`, `outlook.com`): *"Using a company email can help speed up company verification."*

---

## 6. Email Verification Flow (`VerifyEmailPage.tsx`)

- **Heading:** "Verify your email"
- **Copy:** "We've sent a verification link to your registered email address."
- **Target Email Display:** Clearly presents target email address.
- **Resend Action with Cooldown:**
  - Button: `Resend Verification Email`.
  - When triggered, invokes `supabase.auth.resend({ type: 'signup', email })`.
  - Starts a **60-second countdown timer** (`Resend available in 59s`). Disables button during countdown to prevent spam.
- **Verification Check Action:**
  - Button: `I Have Verified My Email` — Refetches user profile and advances user to onboarding or portal if verified.

---

## 7. Password Recovery & Reset (`ForgotPasswordPage.tsx` & `ResetPasswordPage.tsx`)

### Forgot Password (`/forgot-password`):
- Invokes `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })`.
- **Security Control:** Displays a neutral success message regardless of whether the email exists: *"If an account exists for this email address, password reset instructions have been dispatched."* (Prevents account enumeration).

### Reset Password (`/reset-password`):
- Validates Supabase recovery session token.
- Prompts for new password & confirm new password with password strength meter.
- Invokes `supabase.auth.updateUser({ password })`.
- On success: Displays confirmation alert and `Continue to Sign In` button.

---

## 8. Form Validation & Password Policy Rules

| Field | Rule | Error Message |
| :--- | :--- | :--- |
| `email` | Non-empty, Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Please enter a valid email address." |
| `fullName` | Non-empty, min 2 characters | "Please enter your full name (at least 2 characters)." |
| `companyName` | Non-empty for Employer accounts | "Please enter your company or enterprise name." |
| `password` | Min 8 characters, min 1 uppercase (`[A-Z]`), min 1 number (`[0-9]`) | "Password must contain at least one uppercase letter and one number." |
| `confirmPassword` | Must match `password` | "Passwords do not match. Please re-enter confirm password." |

---

## 9. Accessibility (WCAG 2.2 AA Compliance)

- **Semantic Forms:** Standard `<form>` elements with explicit `<label htmlFor="...">` associations.
- **Accessible Touch Targets:** Minimum button & input height of 44px (`py-2.5`, `py-3`).
- **Show/Hide Password Buttons:** Include `aria-label="Show password"` / `aria-label="Hide password"`.
- **Keyboard Navigation:** Full Tab, Shift+Tab, Enter, and Spacebar support across form controls.
- **Focus Rings:** High-visibility focus indicators (`focus:ring-2 focus:ring-kth-primary-600`).
- **Alert Announcements:** Error and warning boxes use semantic icon + text styling.

---

## 10. Security Controls Summary

1. **Role Escalation Block:** Admin option omitted from UI and forced to candidate by database trigger if injected into API payloads.
2. **Generic Error Messaging:** Login failures use non-disclosing messages ("Invalid email address or password") to prevent user enumeration.
3. **Password Persistence:** Passwords exist strictly in local React component state during form entry and are never stored in `localStorage`, `sessionStorage`, or cookies.
4. **Environment-Safe Redirects:** Recovery callbacks construct URLs dynamically via `window.location.origin` rather than hardcoded domain strings.
5. **No Service-Role Leakage:** Frontend client strictly operates with public publishable anon key.

---

## 11. Module 01 Progress & Next Steps

- [x] **Task 01:** Supabase Auth Foundation, Database Schema & RLS Policies (Complete)
- [x] **Task 02:** AuthContext, Session Management, Protected Routes & Role Guards (Complete)
- [x] **Task 03:** Authentication UI Screens (Login, Register, Email Verification, Recovery) (Complete)
- [ ] **Task 04:** Candidate & Employer Onboarding Wizards (Next Step)
