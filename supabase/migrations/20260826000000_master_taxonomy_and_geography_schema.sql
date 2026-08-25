-- ====================================================================
-- KNOWTOHIRE — MODULE 05: MASTER TAXONOMY, GEOGRAPHY & CLASSIFICATION SCHEMA
-- Migration: 20260826000000_master_taxonomy_and_geography_schema.sql
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. CAREER TAXONOMY (Career Categories)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.career_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'Briefcase',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_categories_slug ON public.career_categories(slug);
CREATE INDEX IF NOT EXISTS idx_career_categories_active ON public.career_categories(is_active);

-- --------------------------------------------------------------------
-- 2. INDUSTRIES & SUB-INDUSTRIES
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_industries_slug ON public.industries(slug);
CREATE INDEX IF NOT EXISTS idx_industries_active ON public.industries(is_active);

CREATE TABLE IF NOT EXISTS public.industry_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_industry_subcategory UNIQUE (industry_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_ind_sub_industry_id ON public.industry_subcategories(industry_id);

-- --------------------------------------------------------------------
-- 3. FUNCTIONAL AREAS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.functional_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_functional_areas_slug ON public.functional_areas(slug);

-- --------------------------------------------------------------------
-- 4. DOMAINS & SPECIALIZATIONS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  career_category_id UUID REFERENCES public.career_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domains_parent_id ON public.domains(parent_id);
CREATE INDEX IF NOT EXISTS idx_domains_category_id ON public.domains(career_category_id);
CREATE INDEX IF NOT EXISTS idx_domains_slug ON public.domains(slug);

-- --------------------------------------------------------------------
-- 5. CANONICAL JOB ROLES & ALIASES
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.job_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  career_category_id UUID REFERENCES public.career_categories(id) ON DELETE SET NULL,
  functional_area_id UUID REFERENCES public.functional_areas(id) ON DELETE SET NULL,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL,
  seniority_level TEXT DEFAULT 'mid_level',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_roles_slug ON public.job_roles(slug);
CREATE INDEX IF NOT EXISTS idx_job_roles_domain ON public.job_roles(domain_id);
CREATE INDEX IF NOT EXISTS idx_job_roles_category ON public.job_roles(career_category_id);

CREATE TABLE IF NOT EXISTS public.job_role_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.job_roles(id) ON DELETE CASCADE,
  alias_name TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_aliases_norm ON public.job_role_aliases(normalized_alias);
CREATE INDEX IF NOT EXISTS idx_role_aliases_role_id ON public.job_role_aliases(role_id);

-- --------------------------------------------------------------------
-- 6. SKILLS & SKILL ALIASES
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'Technical',
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_slug ON public.skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

CREATE TABLE IF NOT EXISTS public.skill_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  alias_name TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_aliases_norm ON public.skill_aliases(normalized_alias);
CREATE INDEX IF NOT EXISTS idx_skill_aliases_skill_id ON public.skill_aliases(skill_id);

-- --------------------------------------------------------------------
-- 7. GEOGRAPHY (Countries, States/Provinces, Cities)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  iso2 VARCHAR(2) NOT NULL UNIQUE,
  iso3 VARCHAR(3) NOT NULL UNIQUE,
  phone_code VARCHAR(10),
  currency_code VARCHAR(10) DEFAULT 'INR',
  currency_symbol VARCHAR(10) DEFAULT '₹',
  region TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_countries_iso2 ON public.countries(iso2);
CREATE INDEX IF NOT EXISTS idx_countries_slug ON public.countries(slug);

CREATE TABLE IF NOT EXISTS public.states_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state_code VARCHAR(10),
  type TEXT DEFAULT 'State',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_state_country UNIQUE (country_id, name)
);

CREATE INDEX IF NOT EXISTS idx_states_country ON public.states_regions(country_id);
CREATE INDEX IF NOT EXISTS idx_states_code ON public.states_regions(state_code);

CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  state_id UUID REFERENCES public.states_regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cities_country ON public.cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state ON public.cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_popular ON public.cities(is_popular);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);

-- --------------------------------------------------------------------
-- 8. EMPLOYMENT, EDUCATION & COMPANY METADATA TABLES
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.employment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.work_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.experience_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  min_years NUMERIC(4, 1) NOT NULL DEFAULT 0,
  max_years NUMERIC(4, 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.education_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.fields_of_study (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.company_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.company_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  min_employees INTEGER NOT NULL DEFAULT 1,
  max_employees INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- --------------------------------------------------------------------
-- 9. EXTEND JOBS & PROFILES SCHEMA WITH CANONICAL FOREIGN KEYS
-- --------------------------------------------------------------------

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS career_category_id UUID REFERENCES public.career_categories(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS industry_subcategory_id UUID REFERENCES public.industry_subcategories(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS functional_area_id UUID REFERENCES public.functional_areas(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS canonical_role_id UUID REFERENCES public.job_roles(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES public.states_regions(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_career_category ON public.jobs(career_category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_canonical_role ON public.jobs(canonical_role_id);
CREATE INDEX IF NOT EXISTS idx_jobs_country_id ON public.jobs(country_id);
CREATE INDEX IF NOT EXISTS idx_jobs_city_id ON public.jobs(city_id);

-- --------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.career_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_role_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields_of_study ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_sizes ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Anyone can read active taxonomy records)
CREATE POLICY "taxonomy_public_read_career_categories" ON public.career_categories FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_industries" ON public.industries FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_industry_subcategories" ON public.industry_subcategories FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_functional_areas" ON public.functional_areas FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_domains" ON public.domains FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_job_roles" ON public.job_roles FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_job_role_aliases" ON public.job_role_aliases FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_skill_aliases" ON public.skill_aliases FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_states_regions" ON public.states_regions FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_employment_types" ON public.employment_types FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_work_modes" ON public.work_modes FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_experience_levels" ON public.experience_levels FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_education_levels" ON public.education_levels FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_fields_of_study" ON public.fields_of_study FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_company_types" ON public.company_types FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read_company_sizes" ON public.company_sizes FOR SELECT USING (true);

-- Admin Manage Policies
CREATE POLICY "taxonomy_admin_manage_career_categories" ON public.career_categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_industries" ON public.industries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_industry_subcategories" ON public.industry_subcategories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_functional_areas" ON public.functional_areas FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_domains" ON public.domains FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_job_roles" ON public.job_roles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_job_role_aliases" ON public.job_role_aliases FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_skills" ON public.skills FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_skill_aliases" ON public.skill_aliases FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_countries" ON public.countries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_states_regions" ON public.states_regions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "taxonomy_admin_manage_cities" ON public.cities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
