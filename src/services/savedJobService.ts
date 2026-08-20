/**
 * KnowToHire Saved Job Service
 * Handles Candidate job bookmarks with race-condition prevention and RLS.
 */

import { supabase } from '@/lib/supabase';
import {
  SavedJob,
  ServiceResult,
  normalizeServiceError,
} from './types';

export const savedJobService = {
  /**
   * Bookmark a job for the authenticated candidate.
   */
  async saveJob(jobId: string): Promise<ServiceResult<SavedJob>> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: { message: 'Sign in as a candidate to bookmark jobs.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const { data, error } = await supabase
        .from('saved_jobs')
        .insert({
          candidate_id: userData.user.id,
          job_id: jobId,
        })
        .select('*, job:jobs(*, company:company_profiles(*))')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: data as SavedJob, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Remove a job from bookmarks.
   */
  async unsaveJob(jobId: string): Promise<ServiceResult<boolean>> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('candidate_id', userData.user.id)
        .eq('job_id', jobId);

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch all jobs bookmarked by the authenticated candidate.
   */
  async getMySavedJobs(): Promise<ServiceResult<SavedJob[]>> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*, job:jobs(*, company:company_profiles(*))')
        .eq('candidate_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: (data as SavedJob[]) || [], error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Check if a specific job is currently saved by the candidate.
   */
  async isJobSaved(jobId: string): Promise<ServiceResult<boolean>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { data: false, error: null };
      }

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('candidate_id', userData.user.id)
        .eq('job_id', jobId)
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
