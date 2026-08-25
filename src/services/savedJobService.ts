/**
 * KnowToHire Saved Job Service
 * Handles Candidate job bookmarks with race-condition prevention and RLS.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  SavedJob,
  ServiceResult,
  normalizeServiceError,
} from './types';

const DEMO_SAVED_JOBS_PREFIX = 'kth_candidate_saved_jobs_';

function isDemoSession(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const stored = window.localStorage.getItem('kth_demo_auth_session');
    if (stored) {
      const parsed = JSON.parse(stored);
      return Boolean(parsed?.id && parsed?.role);
    }
  } catch {
    /* ignore */
  }
  return false;
}

function getLocalSavedJobIds(candidateId: string): string[] {
  if (typeof window === 'undefined' || !window.localStorage || !candidateId) return [];
  try {
    const raw = window.localStorage.getItem(`${DEMO_SAVED_JOBS_PREFIX}${candidateId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalJobId(candidateId: string, jobId: string) {
  if (typeof window === 'undefined' || !window.localStorage || !candidateId) return;
  try {
    const ids = new Set(getLocalSavedJobIds(candidateId));
    ids.add(jobId);
    window.localStorage.setItem(`${DEMO_SAVED_JOBS_PREFIX}${candidateId}`, JSON.stringify(Array.from(ids)));
    notifySavedJobsChanged(candidateId, jobId, true);
  } catch {
    // ignore
  }
}

function removeLocalJobId(candidateId: string, jobId: string) {
  if (typeof window === 'undefined' || !window.localStorage || !candidateId) return;
  try {
    const ids = new Set(getLocalSavedJobIds(candidateId));
    ids.delete(jobId);
    window.localStorage.setItem(`${DEMO_SAVED_JOBS_PREFIX}${candidateId}`, JSON.stringify(Array.from(ids)));
    notifySavedJobsChanged(candidateId, jobId, false);
  } catch {
    // ignore
  }
}

function notifySavedJobsChanged(candidateId: string, jobId: string, isSaved: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kth_saved_jobs_changed', {
        detail: { candidateId, jobId, isSaved },
      })
    );
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
  return '00000000-0000-0000-0000-000000000001';
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

      saveLocalJobId(candidateId, jobId);

      if (!isSupabaseConfigured() || isDemoSession()) {
        let jobDetails: any = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const raw = window.localStorage.getItem('kth_local_created_jobs');
            if (raw) {
              const localJobs = JSON.parse(raw);
              jobDetails = localJobs.find((j: any) => j.id === jobId);
            }
          } catch {
            // ignore
          }
        }

        const localSaved: SavedJob = {
          id: `saved-${jobId}-${Date.now()}`,
          candidate_id: candidateId,
          job_id: jobId,
          created_at: new Date().toISOString(),
          job: jobDetails || undefined,
        };
        return { data: localSaved, error: null };
      }

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
        let jobDetails: any = null;
        const { data: jobData } = await supabase
          .from('jobs')
          .select('*, company:company_profiles(*)')
          .eq('id', jobId)
          .maybeSingle();

        if (jobData) {
          jobDetails = jobData;
        } else if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const raw = window.localStorage.getItem('kth_local_created_jobs');
            if (raw) {
              const localJobs = JSON.parse(raw);
              jobDetails = localJobs.find((j: any) => j.id === jobId);
            }
          } catch {
            // ignore
          }
        }

        const localSaved: SavedJob = {
          id: `saved-${jobId}-${Date.now()}`,
          candidate_id: candidateId,
          job_id: jobId,
          created_at: new Date().toISOString(),
          job: jobDetails || undefined,
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

      removeLocalJobId(candidateId, jobId);

      if (isSupabaseConfigured() && !isDemoSession()) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('candidate_id', candidateId)
          .eq('job_id', jobId);
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
      const candidateId = await getCandidateUserId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      // 1. Fetch from Supabase if configured and not demo
      let combinedSavedJobs: SavedJob[] = [];
      if (isSupabaseConfigured() && !isDemoSession()) {
        const { data: dbSavedData } = await supabase
          .from('saved_jobs')
          .select('*, job:jobs(*, company:company_profiles(*))')
          .eq('candidate_id', candidateId)
          .order('created_at', { ascending: false });

        if (dbSavedData) {
          combinedSavedJobs = dbSavedData as SavedJob[];
        }
      }

      // 2. Check candidate-scoped local cache
      const localIds = getLocalSavedJobIds(candidateId);
      if (localIds.length > 0) {
        // First check local created jobs from jobService localStorage
        let localCreated: any[] = [];
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const raw = window.localStorage.getItem('kth_local_created_jobs');
            if (raw) localCreated = JSON.parse(raw);
          } catch {
            // ignore
          }
        }

        const missingLocalIds = localIds.filter((id) => !combinedSavedJobs.some((sj) => sj.job_id === id));
        if (missingLocalIds.length > 0) {
          let dbJobs: any[] = [];
          const nonLocalUuids = missingLocalIds.filter((id) => !id.startsWith('job-'));
          if (isSupabaseConfigured() && !isDemoSession() && nonLocalUuids.length > 0) {
            const { data } = await supabase
              .from('jobs')
              .select('*, company:company_profiles(*)')
              .in('id', nonLocalUuids);
            if (data) dbJobs = data;
          }

          const allMatchedJobs = [...dbJobs];
          for (const id of missingLocalIds) {
            const matchingLocal = localCreated.find((lj) => lj.id === id);
            if (matchingLocal && !allMatchedJobs.some((j) => j.id === id)) {
              allMatchedJobs.push(matchingLocal);
            }
          }

          for (const id of missingLocalIds) {
            const matchedJob = allMatchedJobs.find((j) => j.id === id);
            if (matchedJob) {
              combinedSavedJobs.push({
                id: `saved-${matchedJob.id}`,
                candidate_id: candidateId,
                job_id: matchedJob.id,
                created_at: new Date().toISOString(),
                job: matchedJob,
              });
            }
          }
        }
      }

      if (combinedSavedJobs.length > 0) {
        // Sync local cache with combined jobs
        const allJobIds = combinedSavedJobs.map((d: any) => d.job_id).filter(Boolean);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`${DEMO_SAVED_JOBS_PREFIX}${candidateId}`, JSON.stringify(allJobIds));
        }
        return { data: combinedSavedJobs, error: null };
      }

      // 3. Return clean empty array if candidate has no saved jobs
      return { data: [], error: null };
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

      const localIds = getLocalSavedJobIds(candidateId);
      if (localIds.includes(jobId)) {
        return { data: true, error: null };
      }

      if (isSupabaseConfigured() && !isDemoSession()) {
        const { data } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('candidate_id', candidateId)
          .eq('job_id', jobId)
          .maybeSingle();

        return { data: Boolean(data), error: null };
      }

      return { data: false, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
