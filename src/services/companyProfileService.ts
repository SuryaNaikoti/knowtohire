/**
 * KnowToHire Company Profile Service
 * Production-grade service managing enterprise company profiles, ownership, and cross-portal metadata.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CompanyProfile } from '@/types/database';
import { ServiceResult, normalizeServiceError } from './types';

export interface CompanyProfileUpdateInput {
  name?: string;
  legal_name?: string | null;
  industry?: string | null;
  company_size?: string | null;
  headquarters_location?: string | null;
  website_url?: string | null;
  description?: string | null;
  logo_url?: string | null;
  registration_number?: string | null;
  culture_benefits?: string[] | null;
}

export interface ExtendedCompanyProfile extends CompanyProfile {
  culture_benefits?: string[];
}

const LOCAL_COMPANY_KEY_PREFIX = 'kth_company_profile_';
const memoryCompanyStore: Record<string, ExtendedCompanyProfile> = {};

function getStoredLocalCompany(companyId: string): ExtendedCompanyProfile | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`${LOCAL_COMPANY_KEY_PREFIX}${companyId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  return memoryCompanyStore[companyId] || null;
}

function saveStoredLocalCompany(companyId: string, data: ExtendedCompanyProfile) {
  memoryCompanyStore[companyId] = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`${LOCAL_COMPANY_KEY_PREFIX}${companyId}`, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

export const companyProfileService = {
  /**
   * Resolve company profile for the currently authenticated employer.
   */
  async getMyCompanyProfile(): Promise<ServiceResult<ExtendedCompanyProfile>> {
    try {
      let companyId: string | null = null;

      // 1. Check real Supabase user
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: empProfile } = await supabase
          .from('employer_profiles')
          .select('company_id')
          .eq('profile_id', authData.user.id)
          .maybeSingle();

        if (empProfile?.company_id) {
          companyId = empProfile.company_id;
        }
      }

      // 2. Check local demo session if needed
      if (!companyId && typeof window !== 'undefined' && window.localStorage) {
        const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo);
            if (parsed?.company_id) {
              companyId = parsed.company_id;
            } else if (parsed?.role === 'employer' || parsed?.role === 'admin') {
              companyId = 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
            }
          } catch {
            // ignore
          }
        }
      }

      if (!companyId) {
        companyId = 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
      }

      // Check local storage overrides first
      const localOverride = getStoredLocalCompany(companyId);

      if (isSupabaseConfigured()) {
        const { data: dbComp, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();

        if (!error && dbComp) {
          const merged: ExtendedCompanyProfile = {
            ...dbComp,
            ...(localOverride || {}),
            name: localOverride?.name || dbComp.name,
            industry: localOverride?.industry !== undefined ? localOverride.industry : dbComp.industry,
            headquarters_location: localOverride?.headquarters_location !== undefined ? localOverride.headquarters_location : dbComp.headquarters_location,
            website_url: localOverride?.website_url !== undefined ? localOverride.website_url : dbComp.website_url,
            company_size: localOverride?.company_size !== undefined ? localOverride.company_size : dbComp.company_size,
            description: localOverride?.description !== undefined ? localOverride.description : dbComp.description,
            culture_benefits: localOverride?.culture_benefits !== undefined ? localOverride.culture_benefits : (dbComp as any).culture_benefits,
          };
          return { data: merged, error: null };
        }
      }

      if (localOverride) {
        return { data: localOverride, error: null };
      }

      // Canonical seed demo record for primary demo employer workspace
      if (companyId === 'fa97faee-1cdf-41e6-a151-f51c7fa4c396') {
        const defaultCompany: ExtendedCompanyProfile = {
          id: companyId,
          name: 'EcoStrategy India Pvt Ltd',
          legal_name: 'EcoStrategy Sustainability Solutions India Private Limited',
          industry: 'Environmental & ESG Advisory',
          headquarters_location: 'Bengaluru, Karnataka, India',
          company_size: '51–200 Employees',
          website_url: 'https://knowtohire.com',
          description: 'Leading enterprise dedicated to environmental stewardship, corporate sustainability advisory, ESG compliance, and decarbonization engineering.',
          verification_status: 'verified',
          created_at: '2026-08-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          culture_benefits: [
            'Hybrid & Flexible Work Policy across major Indian hubs',
            'Comprehensive Health & Group Term Life Insurance',
            'Continuous Professional Development & SPCB/BRSR Certifications',
            'Decarbonization & Clean Energy R&D projects',
          ],
        };
        return { data: defaultCompany, error: null };
      }

      // Isolated default profile for unseeded/new enterprise tenants
      const isolatedCompany: ExtendedCompanyProfile = {
        id: companyId,
        name: 'Enterprise Workspace',
        legal_name: null,
        industry: null,
        headquarters_location: null,
        company_size: null,
        website_url: null,
        description: null,
        verification_status: 'unverified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        culture_benefits: [],
      };

      return { data: isolatedCompany, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update the authenticated employer's company profile.
   */
  async updateMyCompanyProfile(
    input: CompanyProfileUpdateInput
  ): Promise<ServiceResult<ExtendedCompanyProfile>> {
    try {
      const getRes = await this.getMyCompanyProfile();
      if (getRes.error || !getRes.data) {
        return {
          data: null,
          error: getRes.error || { message: 'Could not resolve company record to update.', code: 'NOT_FOUND', status: 404 },
        };
      }

      const existing = getRes.data;
      const companyId = existing.id;

      const updatedRecord: ExtendedCompanyProfile = {
        ...existing,
        name: input.name?.trim() || existing.name,
        legal_name: input.legal_name !== undefined ? (input.legal_name?.trim() || null) : existing.legal_name,
        industry: input.industry !== undefined ? (input.industry?.trim() || null) : existing.industry,
        company_size: input.company_size !== undefined ? (input.company_size?.trim() || null) : existing.company_size,
        headquarters_location: input.headquarters_location !== undefined ? (input.headquarters_location?.trim() || null) : existing.headquarters_location,
        website_url: input.website_url !== undefined ? (input.website_url?.trim() || null) : existing.website_url,
        description: input.description !== undefined ? (input.description?.trim() || null) : existing.description,
        logo_url: input.logo_url !== undefined ? input.logo_url : existing.logo_url,
        registration_number: input.registration_number !== undefined ? input.registration_number : existing.registration_number,
        culture_benefits: input.culture_benefits || existing.culture_benefits,
        updated_at: new Date().toISOString(),
      };

      // 1. Save locally for instant reactivity & demo persistence
      saveStoredLocalCompany(companyId, updatedRecord);

      // 2. Dispatch custom event so headers, sidebars, and open views sync in real-time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('kth_company_profile_updated', {
            detail: { companyId, name: updatedRecord.name, updatedRecord },
          })
        );
      }

      // 3. Persist to Supabase if configured
      if (isSupabaseConfigured()) {
        const { error: dbError } = await supabase
          .from('company_profiles')
          .update({
            name: updatedRecord.name,
            legal_name: updatedRecord.legal_name,
            industry: updatedRecord.industry,
            company_size: updatedRecord.company_size,
            headquarters_location: updatedRecord.headquarters_location,
            website_url: updatedRecord.website_url,
            description: updatedRecord.description,
            logo_url: updatedRecord.logo_url,
            registration_number: updatedRecord.registration_number,
          })
          .eq('id', companyId);

        if (dbError) {
          console.warn('[CompanyProfileService] Supabase update warning:', dbError.message);
        }
      }

      return { data: updatedRecord, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Get any company by ID or name (Public / Candidate / Admin).
   */
  async getCompanyById(companyIdOrName: string): Promise<ServiceResult<ExtendedCompanyProfile>> {
    try {
      const target = (companyIdOrName || '').trim();
      const local = getStoredLocalCompany(target);

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .or(`id.eq.${target},name.ilike.%${target}%`)
          .maybeSingle();

        if (!error && data) {
          return {
            data: {
              ...data,
              ...(local || {}),
            },
            error: null,
          };
        }
      }

      if (local) {
        return { data: local, error: null };
      }

      // Check admin created employers cache
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const createdRaw = window.localStorage.getItem('kth_admin_created_users');
          if (createdRaw) {
            const createdList: any[] = JSON.parse(createdRaw);
            const foundUser = createdList.find(
              (u) =>
                u.id === target ||
                u.company_name?.toLowerCase() === target.toLowerCase() ||
                u.full_name?.toLowerCase() === target.toLowerCase()
            );
            if (foundUser) {
              const empProfileRaw = window.localStorage.getItem(`kth_demo_emp_profile_${foundUser.id}`);
              const empProfile = empProfileRaw ? JSON.parse(empProfileRaw) : {};
              const resolved: ExtendedCompanyProfile = {
                id: foundUser.id,
                name: foundUser.company_name || foundUser.full_name || 'Enterprise Workspace',
                legal_name: empProfile.legal_name || foundUser.company_name || null,
                industry: empProfile.industry || 'Technology & Software Advisory',
                headquarters_location: empProfile.location || 'India',
                company_size: empProfile.company_size || '51-200 employees',
                website_url: empProfile.website_url || null,
                description: empProfile.description || 'Verified enterprise registered on KnowToHire.',
                verification_status: 'verified',
                registration_number: empProfile.registration_number || null,
                created_at: foundUser.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                culture_benefits: [
                  'Dynamic Work Environment & Competitive Remuneration',
                  'Professional Growth & Upskilling Stipend',
                  'Comprehensive Medical & Wellness Coverage',
                ],
              };
              return { data: resolved, error: null };
            }
          }
        } catch {
          // ignore
        }
      }

      // Canonical Demo Enterprise (EcoStrategy India Pvt Ltd)
      const isEcoStrategy =
        target === 'fa97faee-1cdf-41e6-a151-f51c7fa4c396' ||
        target.toLowerCase().includes('ecostrategy') ||
        target.toLowerCase().includes('eco-strategy') ||
        target === 'default';

      if (isEcoStrategy) {
        const defaultCompany: ExtendedCompanyProfile = {
          id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          name: 'EcoStrategy India Pvt Ltd',
          legal_name: 'EcoStrategy Sustainability Solutions India Private Limited',
          industry: 'Environmental & ESG Advisory',
          headquarters_location: 'Bengaluru, Karnataka, India',
          company_size: '51–200 Employees',
          website_url: 'https://knowtohire.com',
          description:
            'Leading enterprise dedicated to environmental stewardship, corporate sustainability advisory, ESG compliance, and decarbonization engineering.',
          verification_status: 'verified',
          registration_number: 'U74999KA2026PTC148911',
          created_at: '2026-08-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          culture_benefits: [
            'Hybrid & Flexible Work Policy across major Indian hubs',
            'Comprehensive Health & Group Term Life Insurance',
            'Continuous Professional Development & SPCB/BRSR Certifications',
            'Decarbonization & Clean Energy R&D projects',
          ],
        };
        return { data: defaultCompany, error: null };
      }

      // Generic fallback for named company
      const genericFallback: ExtendedCompanyProfile = {
        id: target,
        name: decodeURIComponent(target.replace(/-/g, ' ')),
        legal_name: null,
        industry: 'Technology & Enterprise Solutions',
        headquarters_location: 'India',
        company_size: '51–200 Employees',
        website_url: 'https://knowtohire.com',
        description: 'Verified enterprise hiring on the KnowToHire platform.',
        verification_status: 'verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        culture_benefits: [
          'Competitive Compensation & Performance Bonuses',
          'Flexible & Hybrid Work Arrangements',
          'Health Insurance & Professional Development',
        ],
      };

      return { data: genericFallback, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
