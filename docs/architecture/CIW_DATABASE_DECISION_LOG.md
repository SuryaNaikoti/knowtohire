# CANDIDATE CAREER INTELLIGENCE WORKSPACE (CIW) DATABASE DECISION LOG

## 1. Executive Summary
This document serves as the authoritative Architectural Decision Record (ADR) for the 20 normalized PostgreSQL tables constituting the Candidate Career Intelligence Workspace (CIW) database foundation.

---

## 2. Table-by-Table Decision Matrix

### 1. `candidate_profiles`
* **Purpose:** Serves as the primary root entity for all candidate career intelligence data.
* **Relationships:** References `public.profiles(id)` (which references `auth.users(id)`). Referenced by all 19 `candidate_*` child tables.
* **Future Extensibility:** Contains `tenant_id` for enterprise multi-tenancy, `source` for bulk migration provenance, `metadata` (JSONB) for dynamic extensibility.
* **Reasoning:** Decouples candidate domain attributes (headline, bio, authorization) from authentication credentials (`auth.users`) and generic core profiles (`profiles`).

---

### 2. `candidate_social_links`
* **Purpose:** Stores candidate social/professional platform URLs (LinkedIn, GitHub, Portfolio, Twitter).
* **Relationships:** Belongs to `candidate_profiles(id)` ON DELETE CASCADE.
* **Future Extensibility:** Allows arbitrary platform names without database schema mutations.
* **Reasoning:** Array strings in single columns prevent indexing individual social profiles. Normalized rows enable easy platform verification.

---

### 3. `candidate_languages`
* **Purpose:** Tracks multi-lingual proficiency levels.
* **Relationships:** Belongs to `candidate_profiles(id)`.
* **Future Extensibility:** Standardizes CEFR levels (A1-C2) or verbal/written ratings.
* **Reasoning:** Normalization allows employers to query candidates by specific language fluency thresholds efficiently.

---

### 4. `candidate_experience`
* **Purpose:** Stores employment history, roles, companies, achievements, and career progression.
* **Relationships:** Belongs to `candidate_profiles(id)`.
* **Future Extensibility:** `achievements` JSONB stores structured quantifiable metrics (e.g. `{"metric": "Revenue", "growth": "45%"}`).
* **Reasoning:** Separate table enables exact date range queries, current job flags, and career promotion timeline tracking.

---

### 5. `candidate_education`
* **Purpose:** Records academic degrees, universities, fields of study, and graduation years.
* **Relationships:** Belongs to `candidate_profiles(id)`.
* **Future Extensibility:** Supports degree verification badges and GPA normalization.
* **Reasoning:** Preserves educational history independent of work experience.

---

### 6. `candidate_certifications`
* **Purpose:** Stores professional licenses, accredited certifications, and credential URLs.
* **Relationships:** Belongs to `candidate_profiles(id)`.
* **Future Extensibility:** Automatic expiration checks and badge verification webhooks.
* **Reasoning:** Keeps recurring certification validity dates separate from academic education.

---

### 7. `skill_categories` & 8. `skill_subcategories` & 9. `skills` & 10. `candidate_skills`
* **Purpose:** Implements a 3-tier hierarchical skill taxonomy (Category $\rightarrow$ Subcategory $\rightarrow$ Skill) and links candidate skill proficiencies.
* **Relationships:** `skill_categories` $\rightarrow$ `skill_subcategories` $\rightarrow$ `skills` $\leftarrow$ `candidate_skills` $\rightarrow$ `candidate_profiles`.
* **Future Extensibility:** Supports skill endorsement votes, confidence scores ($0\text{--}100$), and evidence links.
* **Reasoning:** Avoids flat string arrays. Hierarchical taxonomy allows precise search filtering (e.g. `Technical` $\rightarrow$ `Backend` $\rightarrow$ `Node.js`).

---

### 11. `candidate_portfolios` & 12. `candidate_projects` & 13. `candidate_project_media`
* **Purpose:** Showcases software projects, GitHub repositories, case studies, and uploaded media attachments.
* **Relationships:** `candidate_projects` belongs to `candidate_profiles(id)`; `candidate_project_media` belongs to `candidate_projects(id)`.
* **Future Extensibility:** Supports embedded video introductions, PDF presentations, and live demo links.
* **Reasoning:** Relational project media structure prevents blob bloat in main profile rows.

---

### 14. `candidate_resumes` & 15. `candidate_resume_versions` & 16. `candidate_resume_analysis`
* **Purpose:** Manages resume storage, parsed JSON representations, versioning (ATS format vs Executive format), and ATS analysis scores.
* **Relationships:** `candidate_resumes` belongs to `candidate_profiles(id)`; versions and analyses belong to `candidate_resumes(id)`.
* **Future Extensibility:** Powers automatic resume builder rendering and target job mapping.
* **Reasoning:** Keeps heavy parsed text and ATS keyword density JSON separated from standard profile queries.

---

### 17. `candidate_preferences`
* **Purpose:** Stores candidate job search preferences (desired role, target salary range, remote vs hybrid, relocation).
* **Relationships:** 1-to-1 relationship with `candidate_profiles(id)`.
* **Future Extensibility:** Feeds AI job recommendation engines.
* **Reasoning:** Keeps candidate salary expectations private and decoupled from public profile fields.

---

### 18. `candidate_privacy`
* **Purpose:** Controls public profile visibility, anonymous candidate mode, and employer disclosure switches.
* **Relationships:** 1-to-1 relationship with `candidate_profiles(id)`.
* **Future Extensibility:** Integrates with Row-Level Security (RLS) policies.
* **Reasoning:** Enforces candidate privacy preferences directly at the PostgreSQL database level.

---

### 19. `candidate_ai_analysis`
* **Purpose:** Stores explainable AI suggestions (ATS score, profile summary, skill gap recommendations).
* **Relationships:** Belongs to `candidate_profiles(id)`.
* **Future Extensibility:** Tracks prompt, model version, confidence score, and status (`PENDING_USER_APPROVAL`, `ACCEPTED`, `REJECTED`).
* **Reasoning:** Enforces the **Human-in-the-Loop** architectural rule: AI never overwrites profile data without candidate consent.

---

### 20. `candidate_activity`
* **Purpose:** Implements an audit log event stream of all candidate workspace actions.
* **Relationships:** Belongs to `candidate_profiles(id)`.
* **Future Extensibility:** Structured event types (`PROFILE_UPDATED`, `RESUME_UPLOADED`, `AI_SUGGESTION_ACCEPTED`).
* **Reasoning:** Powers activity timelines, analytics, notifications, and compliance auditability.
