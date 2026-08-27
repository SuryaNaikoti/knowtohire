/**
 * KnowToHire Master Taxonomy & Geography Service
 * 
 * Provides unified, single-source-of-truth access to:
 * - Career Categories
 * - Industries & Sub-industries
 * - Functional Areas
 * - Domains & Specializations
 * - Job Roles with Alias Normalization
 * - Skills with Alias Normalization
 * - Geography (Countries, States, Cities with Search)
 * - Administrative Taxonomy Management & Governance
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';
import {
  CareerCategory,
  Industry,
  FunctionalArea,
  DomainItem,
  JobRole,
  JobRoleAlias,
  SkillItem,
  SkillAlias,
  Country,
  StateRegion,
  CityItem,
  SEED_CAREER_CATEGORIES,
  SEED_INDUSTRIES,
  SEED_FUNCTIONAL_AREAS,
  SEED_DOMAINS,
  SEED_JOB_ROLES,
  SEED_JOB_ROLE_ALIASES,
  SEED_SKILLS,
  SEED_SKILL_ALIASES,
  SEED_COUNTRIES,
  SEED_INDIAN_STATES,
  SEED_CITIES,
} from './taxonomyTypes';

const LOCAL_TAXONOMY_KEY = 'kth_custom_taxonomy_overrides';

interface CustomTaxonomyState {
  careerCategories: CareerCategory[];
  industries: Industry[];
  domains: DomainItem[];
  jobRoles: JobRole[];
  jobRoleAliases: JobRoleAlias[];
  skills: SkillItem[];
  skillAliases: SkillAlias[];
  countries: Country[];
  states: StateRegion[];
  cities: CityItem[];
}

function getLocalTaxonomy(): CustomTaxonomyState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      careerCategories: [...SEED_CAREER_CATEGORIES],
      industries: [...SEED_INDUSTRIES],
      domains: [...SEED_DOMAINS],
      jobRoles: [...SEED_JOB_ROLES],
      jobRoleAliases: [...SEED_JOB_ROLE_ALIASES],
      skills: [...SEED_SKILLS],
      skillAliases: [...SEED_SKILL_ALIASES],
      countries: [...SEED_COUNTRIES],
      states: [...SEED_INDIAN_STATES],
      cities: [...SEED_CITIES],
    };
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_TAXONOMY_KEY);
    if (!raw) {
      const initial: CustomTaxonomyState = {
        careerCategories: [...SEED_CAREER_CATEGORIES],
        industries: [...SEED_INDUSTRIES],
        domains: [...SEED_DOMAINS],
        jobRoles: [...SEED_JOB_ROLES],
        jobRoleAliases: [...SEED_JOB_ROLE_ALIASES],
        skills: [...SEED_SKILLS],
        skillAliases: [...SEED_SKILL_ALIASES],
        countries: [...SEED_COUNTRIES],
        states: [...SEED_INDIAN_STATES],
        cities: [...SEED_CITIES],
      };
      window.localStorage.setItem(LOCAL_TAXONOMY_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {
      careerCategories: [...SEED_CAREER_CATEGORIES],
      industries: [...SEED_INDUSTRIES],
      domains: [...SEED_DOMAINS],
      jobRoles: [...SEED_JOB_ROLES],
      jobRoleAliases: [...SEED_JOB_ROLE_ALIASES],
      skills: [...SEED_SKILLS],
      skillAliases: [...SEED_SKILL_ALIASES],
      countries: [...SEED_COUNTRIES],
      states: [...SEED_INDIAN_STATES],
      cities: [...SEED_CITIES],
    };
  }
}

function saveLocalTaxonomy(state: CustomTaxonomyState) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(LOCAL_TAXONOMY_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('kth_taxonomy_changed'));
  } catch {
    // ignore
  }
}

export const taxonomyService = {
  // ==========================================================================
  // 1. CAREER CATEGORIES
  // ==========================================================================
  async getCareerCategories(includeInactive = false): Promise<ServiceResult<CareerCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('career_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const filtered = includeInactive ? data : data.filter((c: CareerCategory) => c.is_active);
        return { data: filtered, error: null };
      }

      const local = getLocalTaxonomy().careerCategories;
      const filtered = includeInactive ? local : local.filter((c) => c.is_active);
      return { data: filtered, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  // ==========================================================================
  // 2. INDUSTRIES
  // ==========================================================================
  async getIndustries(includeInactive = false): Promise<ServiceResult<Industry[]>> {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const filtered = includeInactive ? data : data.filter((i: Industry) => i.is_active);
        return { data: filtered, error: null };
      }

      const local = getLocalTaxonomy().industries;
      const list = local && local.length > 0 ? local : [...SEED_INDUSTRIES];
      const filtered = includeInactive ? list : list.filter((i) => i.is_active);
      return { data: filtered, error: null };
    } catch (err) {
      return { data: [...SEED_INDUSTRIES], error: null };
    }
  },

  // ==========================================================================
  // 3. FUNCTIONAL AREAS
  // ==========================================================================
  async getFunctionalAreas(): Promise<ServiceResult<FunctionalArea[]>> {
    try {
      const { data, error } = await supabase
        .from('functional_areas')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data, error: null };
      }

      return { data: [...SEED_FUNCTIONAL_AREAS], error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  // ==========================================================================
  // 4. DOMAINS
  // ==========================================================================
  async getDomains(careerCategoryId?: string): Promise<ServiceResult<DomainItem[]>> {
    try {
      let query = supabase.from('domains').select('*').order('sort_order', { ascending: true });
      if (careerCategoryId) {
        query = query.eq('career_category_id', careerCategoryId);
      }
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return { data: data.filter((d: DomainItem) => d.is_active), error: null };
      }

      let local = getLocalTaxonomy().domains.filter((d) => d.is_active);
      if (careerCategoryId) {
        local = local.filter((d) => d.career_category_id === careerCategoryId);
      }
      return { data: local, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  // ==========================================================================
  // 5. JOB ROLES & ALIAS RESOLUTION
  // ==========================================================================
  async searchJobRoles(query = '', domainId?: string): Promise<ServiceResult<JobRole[]>> {
    try {
      const q = query.trim().toLowerCase();
      let local = getLocalTaxonomy().jobRoles.filter((r) => r.is_active);
      if (domainId) {
        local = local.filter((r) => r.domain_id === domainId);
      }
      if (q) {
        local = local.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.slug.toLowerCase().includes(q)
        );
      }
      return { data: local, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  async resolveJobRole(rawTitle: string): Promise<JobRole | null> {
    if (!rawTitle || !rawTitle.trim()) return null;
    const clean = rawTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const compact = rawTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const state = getLocalTaxonomy();

    // 1. Direct name match
    const direct = state.jobRoles.find((r) => {
      const rClean = r.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const rComp = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return rClean === clean || rComp === compact;
    });
    if (direct) return direct;

    // 2. Alias match
    const aliasMatch = state.jobRoleAliases.find((a) => {
      const aClean = a.normalized_alias.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const aComp = a.normalized_alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        aClean === clean ||
        aComp === compact ||
        clean.includes(aClean) ||
        compact.includes(aComp) ||
        aClean.includes(clean)
      );
    });
    if (aliasMatch) {
      const role = state.jobRoles.find((r) => r.id === aliasMatch.role_id);
      if (role) return role;
    }

    // 3. Substring fuzzy match
    const fuzzy = state.jobRoles.find((r) => {
      const rNorm = r.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const rComp = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean.includes(rNorm) || compact.includes(rComp);
    });
    return fuzzy || null;
  },

  // ==========================================================================
  // 6. SKILLS & ALIAS RESOLUTION
  // ==========================================================================
  async searchSkills(query = '', category?: string): Promise<ServiceResult<SkillItem[]>> {
    try {
      const q = query.trim().toLowerCase();
      let local = getLocalTaxonomy().skills.filter((s) => s.is_active);
      if (category && category !== 'all') {
        local = local.filter((s) => s.category.toLowerCase() === category.toLowerCase());
      }
      if (q) {
        local = local.filter((s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q));
      }
      return { data: local, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  async normalizeSkill(rawSkill: string): Promise<string> {
    if (!rawSkill || !rawSkill.trim()) return '';
    const clean = rawSkill.trim().toLowerCase();
    const state = getLocalTaxonomy();

    const direct = state.skills.find((s) => s.name.toLowerCase() === clean);
    if (direct) return direct.name;

    const alias = state.skillAliases.find((a) => a.normalized_alias === clean);
    if (alias) {
      const parent = state.skills.find((s) => s.id === alias.skill_id);
      if (parent) return parent.name;
    }

    return rawSkill.trim();
  },

  // ==========================================================================
  // 7. GEOGRAPHY (Countries, States, Cities)
  // ==========================================================================
  async getCountries(): Promise<ServiceResult<Country[]>> {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data: data.filter((c: Country) => c.is_active), error: null };
      }

      const local = getLocalTaxonomy().countries.filter((c) => c.is_active);
      return { data: local, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  async getStates(countryId = 'country-in'): Promise<ServiceResult<StateRegion[]>> {
    try {
      const { data, error } = await supabase
        .from('states_regions')
        .select('*')
        .eq('country_id', countryId)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data: data.filter((s: StateRegion) => s.is_active), error: null };
      }

      const local = getLocalTaxonomy().states.filter((s) => s.country_id === countryId && s.is_active);
      return { data: local, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  async searchCities(query = '', countryId = 'country-in', stateId?: string): Promise<ServiceResult<CityItem[]>> {
    try {
      const q = query.trim().toLowerCase();
      let local = getLocalTaxonomy().cities.filter((c) => c.is_active);
      if (countryId) {
        local = local.filter((c) => c.country_id === countryId);
      }
      if (stateId) {
        local = local.filter((c) => c.state_id === stateId);
      }
      if (q) {
        local = local.filter((c) => c.name.toLowerCase().includes(q));
      }
      return { data: local, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  // ==========================================================================
  // 8. ADMIN TAXONOMY MANAGEMENT & AUDIT
  // ==========================================================================
  async createCareerCategory(input: Partial<CareerCategory>): Promise<ServiceResult<CareerCategory>> {
    try {
      const state = getLocalTaxonomy();
      const slug = (input.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newCat: CareerCategory = {
        id: 'cat-' + slug + '-' + Math.random().toString(36).substring(2, 6),
        name: input.name?.trim() || 'New Category',
        slug,
        description: input.description?.trim() || '',
        icon: input.icon || 'Briefcase',
        is_active: true,
        sort_order: state.careerCategories.length + 1,
      };

      state.careerCategories.push(newCat);
      saveLocalTaxonomy(state);
      return { data: newCat, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  async updateCareerCategory(id: string, updates: Partial<CareerCategory>): Promise<ServiceResult<CareerCategory>> {
    try {
      const state = getLocalTaxonomy();
      const match = state.careerCategories.find((c) => c.id === id);
      if (!match) {
        return { data: null, error: { message: 'Category not found', code: 'NOT_FOUND', status: 404 } };
      }
      Object.assign(match, updates);
      saveLocalTaxonomy(state);
      return { data: match, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  async createJobRole(input: Partial<JobRole>): Promise<ServiceResult<JobRole>> {
    try {
      const state = getLocalTaxonomy();
      const slug = (input.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newRole: JobRole = {
        id: 'role-' + slug + '-' + Math.random().toString(36).substring(2, 6),
        name: input.name?.trim() || 'New Role',
        slug,
        description: input.description?.trim() || '',
        career_category_id: input.career_category_id || null,
        domain_id: input.domain_id || null,
        functional_area_id: input.functional_area_id || null,
        seniority_level: input.seniority_level || 'mid_level',
        is_active: true,
        sort_order: state.jobRoles.length + 1,
      };

      state.jobRoles.push(newRole);
      saveLocalTaxonomy(state);
      return { data: newRole, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  async createSkill(input: Partial<SkillItem>): Promise<ServiceResult<SkillItem>> {
    try {
      const state = getLocalTaxonomy();
      const slug = (input.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newSkill: SkillItem = {
        id: 'skill-' + slug + '-' + Math.random().toString(36).substring(2, 6),
        category: input.category || 'Technical',
        name: input.name?.trim() || 'New Skill',
        slug,
        description: input.description?.trim() || '',
        is_verified: true,
        is_active: true,
      };

      state.skills.push(newSkill);
      saveLocalTaxonomy(state);
      return { data: newSkill, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
