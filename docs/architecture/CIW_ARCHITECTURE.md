# CANDIDATE CAREER INTELLIGENCE WORKSPACE (CIW) ARCHITECTURE

## 1. Executive Summary
The **Candidate Career Intelligence Workspace (CIW)** transforms standard static candidate profiles into a high-performance **Career Operating System**. It empowers candidates with real-time Career Intelligence, multi-dimensional Readiness Scores, ATS Optimization, Skill Taxonomy Intelligence, and Human-in-the-Loop AI Recommendations.

---

## 2. Entity Relationship Diagram (ERD) & ID Strategy

### Canonical Candidate ID Lineage
```
auth.users (id)
      │
      ▼
public.profiles (id = auth.users.id)
      │
      ▼
public.candidate_profiles (id = profiles.id)  <── CANONICAL CANDIDATE IDENTIFIER
      │
      ├───────────────────────┼───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼                       ▼
candidate_experience    candidate_education     candidate_skills        candidate_resumes
(candidate_id = id)     (candidate_id = id)     (candidate_id = id)     (candidate_id = id)
```

---

## 3. Normalized Database Schema (20 Tables)

### A. Core Identity & Social Links
```sql
CREATE TABLE public.candidate_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    headline VARCHAR(255),
    bio TEXT,
    phone VARCHAR(50),
    location VARCHAR(150),
    work_authorization VARCHAR(100),
    avatar_url TEXT,
    source VARCHAR(50) DEFAULT 'manual',
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    platform_name VARCHAR(50) NOT NULL, -- LinkedIn, GitHub, Twitter, Portfolio
    profile_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    language_name VARCHAR(50) NOT NULL,
    proficiency_level VARCHAR(50) NOT NULL -- Native, Fluent, Professional, Intermediate, Basic
);
```

### B. Professional History & Accreditations
```sql
CREATE TABLE public.candidate_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(200) NOT NULL,
    degree VARCHAR(150) NOT NULL,
    field_of_study VARCHAR(150),
    start_year INTEGER,
    end_year INTEGER,
    grade_gpa VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(150) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    credential_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### C. Hierarchical Skills Taxonomy
```sql
CREATE TABLE public.skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) UNIQUE NOT NULL -- Technical, Functional, Soft, AI, ESG
);

CREATE TABLE public.skill_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
    subcategory_name VARCHAR(100) NOT NULL -- Frontend, Backend, LLM, Cloud, Leadership
);

CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id UUID NOT NULL REFERENCES public.skill_subcategories(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE public.candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) NOT NULL, -- Expert, Advanced, Intermediate, Beginner
    years_experience NUMERIC(4,1) DEFAULT 0.0,
    confidence_score INTEGER DEFAULT 80, -- 0 to 100
    evidence_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, skill_id)
);
```

### D. Portfolio Showcase & Media
```sql
CREATE TABLE public.candidate_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    website_url TEXT,
    github_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    role VARCHAR(150),
    description TEXT,
    start_date DATE,
    end_date DATE,
    project_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.candidate_projects(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL, -- image, video, document, presentation
    media_url TEXT NOT NULL,
    caption VARCHAR(255)
);
```

### E. Resume Intelligence Center
```sql
CREATE TABLE public.candidate_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    file_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
    version_name VARCHAR(100) NOT NULL, -- ATS_V1, Executive_V2, Research_V1
    raw_text TEXT,
    parsed_json JSONB DEFAULT '{}'::jsonb,
    format_type VARCHAR(50) DEFAULT 'ats', -- ats, executive, research, creative
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_resume_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
    ats_score INTEGER DEFAULT 0,
    keyword_density_json JSONB DEFAULT '{}'::jsonb,
    missing_keywords JSONB DEFAULT '[]'::jsonb,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### F. Privacy, Event Stream & Explainable AI Audit
```sql
CREATE TABLE public.candidate_privacy (
    candidate_id UUID PRIMARY KEY REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    show_contact_info BOOLEAN DEFAULT FALSE,
    show_resume BOOLEAN DEFAULT TRUE,
    show_portfolio BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.candidate_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL, -- PROFILE_SUMMARY, SKILL_GAP, ATS_OPTIMIZE
    prompt_used TEXT,
    model_name VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    model_version VARCHAR(50) DEFAULT 'v1.0',
    confidence_score NUMERIC(5,2),
    ai_suggestions_json JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_USER_APPROVAL', -- PENDING_USER_APPROVAL, ACCEPTED, REJECTED
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- PROFILE_UPDATED, SKILL_ADDED, RESUME_UPLOADED, ATS_ANALYZED, AI_SUGGESTION_ACCEPTED
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.candidate_completion (
    candidate_id UUID PRIMARY KEY REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    overall_readiness_score INTEGER DEFAULT 0,
    identity_score INTEGER DEFAULT 0,
    experience_score INTEGER DEFAULT 0,
    education_score INTEGER DEFAULT 0,
    skills_score INTEGER DEFAULT 0,
    portfolio_score INTEGER DEFAULT 0,
    resume_score INTEGER DEFAULT 0,
    ats_score INTEGER DEFAULT 0,
    interview_score INTEGER DEFAULT 0,
    market_score INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Multi-Dimensional Career Readiness Score Model
The candidate's overall readiness score is computed as a weighted average across 9 dimensions:

$$\text{Overall Score} = \sum_{i=1}^{9} (w_i \times S_i)$$

| Dimension ($S_i$) | Weight ($w_i$) | Evaluation Criteria |
| :--- | :---: | :--- |
| **Identity ($S_1$)** | 10% | Bio length, headline precision, photo, work authorization |
| **Experience ($S_2$)** | 20% | Roles, quantifiable metrics, promotion timelines |
| **Education ($S_3$)** | 10% | Degree, institution, certifications, licenses |
| **Skills ($S_4$)** | 15% | Multi-category skills, proficiency level, evidence links |
| **Portfolio ($S_5$)** | 10% | Projects, GitHub URL, publications, media uploads |
| **Resume ($S_6$)** | 15% | Primary resume attached, version history, format variants |
| **ATS ($S_7$)** | 10% | Keyword density, formatting compliance score |
| **Interview ($S_8$)** | 5% | Interview prep completion, video introduction |
| **Market ($S_9$)** | 5% | Salary expectations set, location/relocation preferences |

---

## 5. Human-in-the-Loop AI Execution Flow

```
Candidate Requests AI Optimization
               │
               ▼
Generate AI Analysis (Prompt + Context Payload)
               │
               ▼
Store Result in candidate_ai_analysis (status = PENDING_USER_APPROVAL)
               │
               ▼
Render AI Suggestion Card in Dashboard
               │
      ┌────────┴────────┐
      ▼                 ▼
User Clicks      User Clicks
 "ACCEPT"        "REJECT"
      │                 │
      ▼                 ▼
Apply Profile    Mark Record
 Updates &       "REJECTED" &
 Emit Activity   Log Event
```

---

## 6. Security & Row-Level Security (RLS) Isolation
* **Candidate Mutation Access:**
  `auth.uid() = (SELECT user_id FROM candidate_profiles WHERE id = candidate_id)`
  Only the authenticated candidate can insert, update, or delete their profile data.
* **Public & Employer Read Access:**
  Public and employer roles read candidate data *only if* `candidate_privacy.is_public = TRUE` and `is_anonymous = FALSE`. If `is_anonymous = TRUE`, candidate identity fields (name, email, phone) are obfuscated by RLS policy views.
