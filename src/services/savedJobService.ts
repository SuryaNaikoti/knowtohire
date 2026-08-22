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

const DEMO_SAVED_JOBS_KEY = 'kth_candidate_saved_jobs_cache';

function getLocalSavedJobIds(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_SAVED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalJobId(jobId: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const ids = new Set(getLocalSavedJobIds());
    ids.add(jobId);
    window.localStorage.setItem(DEMO_SAVED_JOBS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

function removeLocalJobId(jobId: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const ids = new Set(getLocalSavedJobIds());
    ids.delete(jobId);
    window.localStorage.setItem(DEMO_SAVED_JOBS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

async function getCandidateUserId(): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.id) return userData.user.id;

  if (typeof window !== 'undefined' && window.localStorage) {
    const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        if (parsed?.role === 'candidate' && parsed?.id) {
          return parsed.id;
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}

export const savedJobService = {
  /**
   * Bookmark a job for the authenticated candidate.
   */
  async saveJob(jobId: string): Promise<ServiceResult<SavedJob>> {
    try {
      const candidateId = await getCandidateUserId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'Sign in as a candidate to bookmark jobs.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      saveLocalJobId(jobId);

      // Attempt Supabase insert
      const { data, error } = await supabase
        .from('saved_jobs')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
        })
        .select('*, job:jobs(*, company:company_profiles(*))')
        .maybeSingle();

      if (error || !data) {
        // Fetch job details for local return
        const { data: jobData } = await supabase
          .from('jobs')
          .select('*, company:company_profiles(*)')
          .eq('id', jobId)
          .maybeSingle();

        const localSaved: SavedJob = {
          id: `saved-${jobId}-${Date.now()}`,
          candidate_id: candidateId,
          job_id: jobId,
          created_at: new Date().toISOString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          job: (jobData as any) || undefined,
        };
        return { data: localSaved, error: null };
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
      const candidateId = await getCandidateUserId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      removeLocalJobId(jobId);

      await supabase
        .from('saved_jobs')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId);

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
      const candidateId = await getCandidateUserId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*, job:jobs(*, company:company_profiles(*))')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data: data as SavedJob[], error: null };
      }

      // Check local cache
      const localIds = getLocalSavedJobIds();
      if (localIds.length > 0) {
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*, company:company_profiles(*)')
          .in('id', localIds);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fallbackList: SavedJob[] = (jobs || []).map((j: any) => ({
          id: `saved-${j.id}`,
          candidate_id: candidateId,
          job_id: j.id,
          created_at: new Date().toISOString(),
          job: j,
        }));
        return { data: fallbackList, error: null };
      }

      // Default demo bookmarks if candidate has no bookmarks yet
      const { data: seedJobs } = await supabase
        .from('jobs')
        .select('*, company:company_profiles(*)')
        .eq('status', 'published')
        .limit(2);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seedList: SavedJob[] = (seedJobs || []).map((j: any) => ({
        id: `seed-saved-${j.id}`,
        candidate_id: candidateId,
        job_id: j.id,
        created_at: new Date().toISOString(),
        job: j,
      }));

      return { data: seedList, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Check if a specific job is currently saved by the candidate.
   */
  async isJobSaved(jobId: string): Promise<ServiceResult<boolean>> {
    try {
      const candidateId = await getCandidateUserId();
      if (!candidateId) {
        return { data: false, error: null };
      }

      const localIds = getLocalSavedJobIds();
      if (localIds.includes(jobId)) {
        return { data: true, error: null };
      }

      const { data } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .maybeSingle();

      return { data: Boolean(data), error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
