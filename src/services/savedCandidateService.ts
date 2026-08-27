/**
 * KnowToHire Saved Candidate Service
 * Handles Employer talent bookmarks and notes with company-level RLS.
 */

import { supabase } from '@/lib/supabase';
import {
  SavedCandidate,
  ServiceResult,
  normalizeServiceError,
} from './types';
import { candidateDiscoveryService } from './candidateDiscoveryService';

function getDemoSavedCandidates(): SavedCandidate[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem('kth_demo_saved_candidates');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoSavedCandidates(list: SavedCandidate[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem('kth_demo_saved_candidates', JSON.stringify(list));
  } catch {
    // ignore
  }
}

export const savedCandidateService = {
  /**
   * Bookmark a candidate for the employer's organization.
   */
  async saveCandidate(candidateId: string, notes?: string): Promise<ServiceResult<SavedCandidate>> {
    try {
      const isDemo =
        typeof window !== 'undefined' &&
        window.localStorage &&
        Boolean(window.localStorage.getItem('kth_demo_auth_session'));

      if (isDemo) {
        const demoAuth = JSON.parse(window.localStorage.getItem('kth_demo_auth_session') || '{}');
        const companyId = demoAuth.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
        const employerId = demoAuth.id || '00000000-0000-0000-0000-000000000002';

        const list = getDemoSavedCandidates();
        const existingIdx = list.findIndex((s) => s.candidate_id === candidateId && s.company_id === companyId);
        
        const newRecord: SavedCandidate = {
          id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          company_id: companyId,
          employer_id: employerId,
          candidate_id: candidateId,
          notes: notes ? notes.trim() : null,
          created_at: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          list[existingIdx] = newRecord;
        } else {
          list.unshift(newRecord);
        }
        saveDemoSavedCandidates(list);

        // Hydrate the candidate profile onto the saved record
        const candRes = await candidateDiscoveryService.getCandidateById(candidateId);
        if (candRes.data) {
          newRecord.candidate = {
            id: candRes.data.id,
            full_name: candRes.data.name,
            email: candRes.data.email,
            phone: candRes.data.phone,
            avatar_url: candRes.data.avatarUrl,
            role: 'candidate' as const,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            candidate_profile: {
              headline: candRes.data.headline,
              location: candRes.data.location,
              domain_specialization: candRes.data.domain,
              skills: candRes.data.skills,
              bio: candRes.data.bio || '',
              experience: candRes.data.experienceList || [],
              education: candRes.data.educationList || [],
              certifications: candRes.data.certifications || [],
              resume_url: candRes.data.resumeUrl,
            } as any,
          };
        }

        return { data: newRecord, error: null };
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      // 1. Fetch employer's company_id
      const { data: empProfile, error: empError } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', userData.user.id)
        .maybeSingle();

      if (empError || !empProfile) {
        return {
          data: null,
          error: { message: 'Employer profile not found for current user.', code: 'FORBIDDEN', status: 403 },
        };
      }

      // 2. Insert Saved Candidate
      const { data, error } = await supabase
        .from('saved_candidates')
        .insert({
          company_id: empProfile.company_id,
          employer_id: userData.user.id,
          candidate_id: candidateId,
          notes: notes ? notes.trim() : null,
        })
        .select('*, candidate:profiles!candidate_id(*, candidate_profile:candidate_profiles(*))')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: data as SavedCandidate, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Remove a candidate from the company's bookmarked talent list.
   */
  async unsaveCandidate(candidateId: string): Promise<ServiceResult<boolean>> {
    try {
      const isDemo =
        typeof window !== 'undefined' &&
        window.localStorage &&
        Boolean(window.localStorage.getItem('kth_demo_auth_session'));

      if (isDemo) {
        const demoAuth = JSON.parse(window.localStorage.getItem('kth_demo_auth_session') || '{}');
        const companyId = demoAuth.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
        const list = getDemoSavedCandidates().filter(
          (s) => !(s.candidate_id === candidateId && s.company_id === companyId)
        );
        saveDemoSavedCandidates(list);
        return { data: true, error: null };
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const { data: empProfile } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', userData.user.id)
        .maybeSingle();

      if (!empProfile) {
        return {
          data: null,
          error: { message: 'Employer profile not found.', code: 'FORBIDDEN', status: 403 },
        };
      }

      const { error } = await supabase
        .from('saved_candidates')
        .delete()
        .eq('company_id', empProfile.company_id)
        .eq('candidate_id', candidateId);

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch all saved candidates for the employer's company.
   */
  async getMySavedCandidates(): Promise<ServiceResult<SavedCandidate[]>> {
    try {
      const isDemo =
        typeof window !== 'undefined' &&
        window.localStorage &&
        Boolean(window.localStorage.getItem('kth_demo_auth_session'));

      if (isDemo) {
        const demoAuth = JSON.parse(window.localStorage.getItem('kth_demo_auth_session') || '{}');
        const companyId = demoAuth.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
        const list = getDemoSavedCandidates().filter((s) => s.company_id === companyId);

        // Hydrate candidate profiles for any records missing the candidate join
        for (const record of list) {
          if (!record.candidate || !record.candidate.full_name || record.candidate.full_name === 'Candidate') {
            const candRes = await candidateDiscoveryService.getCandidateById(record.candidate_id);
            if (candRes.data) {
              record.candidate = {
                id: candRes.data.id,
                full_name: candRes.data.name,
                email: candRes.data.email,
                phone: candRes.data.phone,
                avatar_url: candRes.data.avatarUrl,
                role: 'candidate' as const,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                candidate_profile: {
                  headline: candRes.data.headline,
                  location: candRes.data.location,
                  domain_specialization: candRes.data.domain,
                  skills: candRes.data.skills,
                  bio: candRes.data.bio || '',
                  experience: candRes.data.experienceList || [],
                  education: candRes.data.educationList || [],
                  certifications: candRes.data.certifications || [],
                  resume_url: candRes.data.resumeUrl,
                } as any,
              };
            }
          }
        }

        return { data: list, error: null };
      }

      const { data, error } = await supabase
        .from('saved_candidates')
        .select('*, candidate:profiles!candidate_id(*, candidate_profile:candidate_profiles(*))')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: (data as SavedCandidate[]) || [], error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Check if a specific candidate is already bookmarked by the company.
   */
  async isCandidateSaved(candidateId: string): Promise<ServiceResult<boolean>> {
    try {
      const isDemo =
        typeof window !== 'undefined' &&
        window.localStorage &&
        Boolean(window.localStorage.getItem('kth_demo_auth_session'));

      if (isDemo) {
        const demoAuth = JSON.parse(window.localStorage.getItem('kth_demo_auth_session') || '{}');
        const companyId = demoAuth.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
        const exists = getDemoSavedCandidates().some(
          (s) => s.candidate_id === candidateId && s.company_id === companyId
        );
        return { data: exists, error: null };
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { data: false, error: null };
      }

      const { data: empProfile } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', userData.user.id)
        .maybeSingle();

      if (!empProfile) {
        return { data: false, error: null };
      }

      const { data, error } = await supabase
        .from('saved_candidates')
        .select('id')
        .eq('company_id', empProfile.company_id)
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: Boolean(data), error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
