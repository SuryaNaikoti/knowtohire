/**
 * KnowToHire Master Taxonomy & Geography Types & Canonical Seed Dataset
 * 
 * Defines normalized models and comprehensive master data records:
 * - Career Categories
 * - Industries & Sub-industries
 * - Functional Areas
 * - Domains & Specializations
 * - Canonical Job Roles & Role Aliases
 * - Standardized Skills & Skill Aliases
 * - Geography (Countries, States/Provinces, Cities)
 * - Employment, Experience, Education, and Company Size Metadata
 */

export interface CareerCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface IndustrySubcategory {
  id: string;
  industry_id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface FunctionalArea {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface DomainItem {
  id: string;
  parent_id?: string | null;
  career_category_id?: string | null;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface JobRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
  career_category_id?: string | null;
  functional_area_id?: string | null;
  domain_id?: string | null;
  industry_id?: string | null;
  seniority_level?: string;
  is_active: boolean;
  sort_order: number;
}

export interface JobRoleAlias {
  id: string;
  role_id: string;
  alias_name: string;
  normalized_alias: string;
  is_active: boolean;
}

export interface SkillItem {
  id: string;
  category: string;
  name: string;
  slug: string;
  description?: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface SkillAlias {
  id: string;
  skill_id: string;
  alias_name: string;
  normalized_alias: string;
  is_active: boolean;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  iso2: string;
  iso3: string;
  phone_code: string;
  currency_code: string;
  currency_symbol: string;
  region: string;
  is_active: boolean;
  sort_order: number;
}

export interface StateRegion {
  id: string;
  country_id: string;
  name: string;
  state_code?: string;
  type: string;
  is_active: boolean;
  sort_order: number;
}

export interface CityItem {
  id: string;
  country_id: string;
  state_id?: string;
  name: string;
  slug: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

// ============================================================================
// ============================================================================
// CANONICAL MASTER SEED DATASET IMPORTS & EXPORTS
// ============================================================================

import {
  MASTER_INDUSTRIES,
  MASTER_FUNCTIONAL_AREAS,
  MASTER_DOMAINS,
  MASTER_JOB_ROLES,
  MASTER_JOB_ROLE_ALIASES,
  MASTER_SKILLS,
  MASTER_SKILL_ALIASES,
} from './masterTaxonomyData';

import {
  MASTER_COUNTRIES,
  MASTER_INDIAN_STATES,
  MASTER_CITIES,
} from './masterGeographyData';

export const SEED_CAREER_CATEGORIES: CareerCategory[] = [
  { id: 'cat-general', name: 'General Careers', slug: 'general-careers', description: 'Cross-functional and general enterprise careers.', icon: 'Briefcase', is_active: true, sort_order: 1 },
  { id: 'cat-env', name: 'Environmental Careers', slug: 'environmental-careers', description: 'EIA, pollution control, ecological conservation, and natural resource management.', icon: 'Leaf', is_active: true, sort_order: 2 },
  { id: 'cat-esg', name: 'ESG Careers', slug: 'esg-careers', description: 'SEBI BRSR Core, corporate ESG assurance, sustainability disclosure, and sustainable finance.', icon: 'ShieldCheck', is_active: true, sort_order: 3 },
  { id: 'cat-sust', name: 'Sustainability Careers', slug: 'sustainability-careers', description: 'Corporate decarbonization, circular economy, renewable energy, and net-zero strategy.', icon: 'Sun', is_active: true, sort_order: 4 },
  { id: 'cat-patent', name: 'Patent Careers', slug: 'patent-careers', description: 'CleanTech and tech patent prosecution, prior art searches, patent drafting, and IP litigation.', icon: 'FileText', is_active: true, sort_order: 5 },
  { id: 'cat-ipr', name: 'IPR Careers', slug: 'ipr-careers', description: 'Trademarks, copyrights, trade secrets, technology transfer, and licensing.', icon: 'Award', is_active: true, sort_order: 6 },
  { id: 'cat-research', name: 'Research Careers', slug: 'research-careers', description: 'Academic R&D, scientific innovations, life sciences, and applied technologies.', icon: 'Search', is_active: true, sort_order: 7 },
  { id: 'cat-consulting', name: 'Consulting Careers', slug: 'consulting-careers', description: 'Management advisory, digital transformation, environmental & ESG consulting.', icon: 'TrendingUp', is_active: true, sort_order: 8 },
];

export const SEED_INDUSTRIES: Industry[] = MASTER_INDUSTRIES;
export const SEED_FUNCTIONAL_AREAS: FunctionalArea[] = MASTER_FUNCTIONAL_AREAS;
export const SEED_DOMAINS: DomainItem[] = MASTER_DOMAINS;
export const SEED_JOB_ROLES: JobRole[] = MASTER_JOB_ROLES;
export const SEED_JOB_ROLE_ALIASES: JobRoleAlias[] = MASTER_JOB_ROLE_ALIASES;
export const SEED_SKILLS: SkillItem[] = MASTER_SKILLS;
export const SEED_SKILL_ALIASES: SkillAlias[] = MASTER_SKILL_ALIASES;
export const SEED_COUNTRIES: Country[] = MASTER_COUNTRIES;
export const SEED_INDIAN_STATES: StateRegion[] = MASTER_INDIAN_STATES;
export const SEED_CITIES: CityItem[] = MASTER_CITIES;
