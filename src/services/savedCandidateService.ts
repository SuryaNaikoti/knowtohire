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

export const savedCandidateService = {
  /**
   * Bookmark a candidate for the employer's organization.
   */
  async saveCandidate(candidateId: string, notes?: string): Promise<ServiceResult<SavedCandidate>> {
    try {
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
