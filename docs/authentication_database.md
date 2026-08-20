# KNOWTOHIRE — DATABASE & AUTHENTICATION SCHEMA SPECIFICATION
## Module 01: Task 01 — Supabase Foundation, Data Models & Row Level Security

---

## 1. Database Architecture Overview

KnowToHire uses **Supabase PostgreSQL** for persistent application data, user identity, and role-based authorization. Authentication credentials (passwords, JWT tokens, email verification states) are managed securely by Supabase Auth (`auth.users`), while application-level domain profiles reside in `public` schema tables linked 1:1 via foreign key constraints.

```mermaid
erDiagram
    auth_users ||--|| profiles : "1:1 Identity Link"
    profiles ||--o| candidate_profiles : "1:1 Extension (Candidate)"
    profiles ||--o| employer_profiles : "1:1 Extension (Employer)"
    company_profiles ||--|{ employer_profiles : "1:N Corporate Membership"

    auth_users {
        uuid id PK
        string email
        timestamp email_confirmed_at
        timestamp created_at
    }

    profiles {
        uuid id PK_FK "References auth.users.id"
        string email
        string full_name
        enum role "candidate | employer | admin"
        enum status "unverified | pending_onboarding | active | suspended"
        string phone
        string avatar_url
        timestamp created_at
        timestamp updated_at
    }

    candidate_profiles {
        uuid id PK
        uuid profile_id FK "References public.profiles.id"
        string headline
        text bio
        string location
        string domain_specialization
        text_array skills
        jsonb experience
        jsonb education
        text_array certifications
        jsonb career_preferences
        numeric preferred_salary_min
        numeric preferred_salary_max
        string employment_preference
        integer notice_period_days
        string resume_url
        integer profile_completion_pct
        timestamp created_at
        timestamp updated_at
    }

    company_profiles {
        uuid id PK
        string name
        string legal_name
        string logo_url
        string website_url
        string industry
        string company_size
        string headquarters_location
        enum verification_status "unverified | pending_review | verified | rejected"
        string registration_number
        timestamp created_at
        timestamp updated_at
    }

    employer_profiles {
        uuid id PK
        uuid profile_id FK "References public.profiles.id"
        uuid company_id FK "References public.company_profiles.id"
        string job_title
        string work_phone
        boolean is_company_admin
        timestamp created_at
        timestamp updated_at
    }
```

---

## 2. Entity Specifications

### A. `public.profiles`
The root user profile table created automatically upon user registration via database trigger.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Matches `auth.users.id` 1:1. |
| `email` | `TEXT` | `NOT NULL` | User email address. |
| `full_name` | `TEXT` | `NOT NULL` | User display name. |
| `role` | `user_role` | `NOT NULL DEFAULT 'candidate'` | Enum: `'candidate'`, `'employer'`, `'admin'`. |
| `status` | `account_status` | `NOT NULL DEFAULT 'unverified'` | Enum: `'unverified'`, `'pending_onboarding'`, `'active'`, `'suspended'`. |
| `phone` | `TEXT` | Optional | Contact phone number. |
| `avatar_url` | `TEXT` | Optional | Profile image URL. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Auto-updated timestamp. |

### B. `public.candidate_profiles`
Holds candidate-specific ATS, resume, skills, and experience details.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Record UUID. |
| `profile_id` | `UUID` | `NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE` | 1:1 link to `public.profiles`. |
| `headline` | `TEXT` | Optional | Professional headline (e.g. "Senior ESG Consultant"). |
| `bio` | `TEXT` | Optional | Executive bio / summary. |
| `location` | `TEXT` | Optional | City, State (e.g. "Hyderabad, TS"). |
| `domain_specialization` | `TEXT` | Optional | e.g. "Sustainability & ESG". |
| `skills` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | List of skill tags (e.g. `['BRSR', 'ISO 14001']`). |
| `experience` | `JSONB` | `NOT NULL DEFAULT '[]'` | Structured employment history array. |
| `education` | `JSONB` | `NOT NULL DEFAULT '[]'` | Structured academic credentials array. |
| `certifications` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Professional certification names. |
| `career_preferences` | `JSONB` | `DEFAULT '{}'` | Work mode, preferred roles, target locations. |
| `preferred_salary_min` | `NUMERIC` | Optional | Minimum annual salary in INR (₹). |
| `preferred_salary_max` | `NUMERIC` | Optional | Maximum annual salary in INR (₹). |
| `employment_preference` | `TEXT` | Optional | `Full-Time`, `Contract`, `Hybrid`, `Remote`. |
| `notice_period_days` | `INTEGER` | Optional | Notice period in days (e.g. `30`). |
| `resume_url` | `TEXT` | Optional | URL reference to stored resume document. |
| `profile_completion_pct`| `INTEGER` | `NOT NULL DEFAULT 0` | Profile strength score (0 - 100). |

### C. `public.company_profiles`
Holds company entity information for employer recruitment accounts.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Company UUID. |
| `name` | `TEXT` | `NOT NULL` | Display company name. |
| `legal_name` | `TEXT` | Optional | Registered legal enterprise name. |
| `logo_url` | `TEXT` | Optional | Company logo image URL. |
| `website_url` | `TEXT` | Optional | Corporate website URL. |
| `industry` | `TEXT` | Optional | Sector e.g. "Environmental & ESG Advisory". |
| `company_size` | `TEXT` | Optional | Employee scale e.g. "250 - 500 Employees". |
| `headquarters_location` | `TEXT` | Optional | Corporate HQ location. |
| `verification_status` | `company_verification_status` | `NOT NULL DEFAULT 'unverified'` | Enum: `'unverified'`, `'pending_review'`, `'verified'`, `'rejected'`. |
| `registration_number` | `TEXT` | Optional | Corporate Identification Number (CIN) / Tax ID. |

### D. `public.employer_profiles`
Links employer users to their corporate company profiles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Record UUID. |
| `profile_id` | `UUID` | `NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE` | 1:1 link to `public.profiles`. |
| `company_id` | `UUID` | `NOT NULL REFERENCES public.company_profiles(id) ON DELETE RESTRICT` | Link to employer's company. |
| `job_title` | `TEXT` | Optional | Recruiter title e.g. "Talent Acquisition Manager". |
| `work_phone` | `TEXT` | Optional | Work extension / phone number. |
| `is_company_admin` | `BOOLEAN` | `NOT NULL DEFAULT false` | Grant company-level management rights. |

---

## 3. Role & Account Status Enums

```sql
CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin');
CREATE TYPE account_status AS ENUM ('unverified', 'pending_onboarding', 'active', 'suspended');
CREATE TYPE company_verification_status AS ENUM ('unverified', 'pending_review', 'verified', 'rejected');
```

---

## 4. Trigger Architecture

### A. Automatic Profile Creation Trigger (`handle_new_user`)
Fires `AFTER INSERT ON auth.users`.
1. Extracts `full_name` from registration metadata.
2. **Role Sanitization:** Only allows `'candidate'` or `'employer'` from client metadata. If a client attempts to pass `'admin'`, it defaults strictly to `'candidate'`, preventing self-escalation.
3. Sets `status` based on email confirmation (`'pending_onboarding'` if confirmed, `'unverified'` if unconfirmed).
4. Inserts row into `public.profiles`.
5. Automatically initializes a default `public.candidate_profiles` row if the user registered as a candidate.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role user_role;
  initial_status account_status;
  user_full_name TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

  IF NEW.raw_user_meta_data->>'role' = 'employer' THEN
    requested_role := 'employer'::user_role;
  ELSE
    requested_role := 'candidate'::user_role;
  END IF;

  IF NEW.email_confirmed_at IS NOT NULL THEN
    initial_status := 'pending_onboarding'::account_status;
  ELSE
    initial_status := 'unverified'::account_status;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (NEW.id, NEW.email, user_full_name, requested_role, initial_status)
  ON CONFLICT (id) DO NOTHING;

  IF requested_role = 'candidate' THEN
    INSERT INTO public.candidate_profiles (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### B. Auto Timestamp Update Trigger (`update_updated_at_column`)
Fires `BEFORE UPDATE` on `profiles`, `candidate_profiles`, `company_profiles`, and `employer_profiles` to update `updated_at = NOW()`.

---

## 5. Row Level Security (RLS) & Policies Breakdown

RLS is enabled on **all 4 tables**.

### `public.profiles`
- **`profiles_select_own` (SELECT):** `USING (auth.uid() = id)` — User can read own profile.
- **`profiles_select_authenticated` (SELECT):** `USING (true)` — Authenticated users can view basic profiles.
- **`profiles_update_own` (UPDATE):** `USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND status = (SELECT status FROM public.profiles WHERE id = auth.uid()))` — Users can update full name, phone, avatar, but CANNOT alter their `role` or `status`.

### `public.candidate_profiles`
- **`candidate_profiles_select_own` (SELECT):** `USING (profile_id = auth.uid())`
- **`candidate_profiles_select_employers` (SELECT):** `USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer'))` — Verified employers can review candidate profiles.
- **`candidate_profiles_insert_own` (INSERT):** `WITH CHECK (profile_id = auth.uid())`
- **`candidate_profiles_update_own` (UPDATE):** `USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid())`

### `public.company_profiles`
- **`company_profiles_select_public` (SELECT):** `USING (true)`
- **`company_profiles_insert_employer` (INSERT):** `WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer'))`
- **`company_profiles_update_employer` (UPDATE):** `USING (EXISTS (SELECT 1 FROM public.employer_profiles WHERE company_id = company_profiles.id AND profile_id = auth.uid()))` — Employers linked to the company can edit company details.

### `public.employer_profiles`
- **`employer_profiles_select_own` (SELECT):** `USING (profile_id = auth.uid())`
- **`employer_profiles_select_company_colleagues` (SELECT):** `USING (company_id IN (SELECT company_id FROM public.employer_profiles WHERE profile_id = auth.uid()))`
- **`employer_profiles_insert_own` (INSERT):** `WITH CHECK (profile_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer'))`
- **`employer_profiles_update_own` (UPDATE):** `USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid())`

---

## 6. Administrator Provisioning

- **No Public Admin Registration:** The trigger explicitly blocks `'admin'` requested roles during public registration.
- **Admin Assignment Mechanism:** Admin accounts must be granted via direct database update (`UPDATE public.profiles SET role = 'admin' WHERE id = '...';`) by a database superuser or via Supabase Dashboard SQL editor.

---

## 7. Migration Execution Instructions

To execute this migration against a Supabase project:
1. Ensure Supabase CLI is installed (`npm i -g supabase`).
2. Run `supabase db push` or execute the SQL file directly in the Supabase Dashboard SQL Editor (`supabase/migrations/20260813000000_auth_and_profiles_schema.sql`).

---

## 8. Dependencies for Task 02 (Next Steps)
Task 01 provides the complete schema foundation. Task 02 will build:
- `AuthContext` (`src/context/AuthContext.tsx`)
- `useAuth` hook (`src/hooks/useAuth.ts`)
- `ProtectedRoute` and `RoleGuard` components (`src/components/auth/ProtectedRoute.tsx`)
- User Login & Registration UI pages.
