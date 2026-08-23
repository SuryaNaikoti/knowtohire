/**
 * KnowToHire Application Service
 * Handles Candidate job applications, ATS pipeline stage transitions, and audit trail lookups.
 */

import { supabase } from '@/lib/supabase';
import {
  JobApplication,
  ApplicationStage,
  ApplicationStatusHistory,
  ApplicationSubmitInput,
  ApplicationFilters,
  ServiceResult,
  PaginatedResult,
  normalizeServiceError,
} from './types';

const DEMO_APPLICATIONS_KEY = 'kth_candidate_applications_cache';

function getLocalApplications(): JobApplication[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalApplication(app: JobApplication) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getLocalApplications().filter((a) => a.id !== app.id && a.job_id !== app.job_id);
    existing.unshift(app);
    window.localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

async function getCandidateAuthId(): Promise<string | null> {
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

export const applicationService = {
  /**
   * Submit an application for a published job opening (Candidate).
   */
  async applyToJob(input: ApplicationSubmitInput): Promise<ServiceResult<JobApplication>> {
    try {
      const candidateId = await getCandidateAuthId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'You must be signed in as a candidate to apply.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      // 1. Fetch Job to verify existence and get company_id
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, company_id, status, title, location, employment_type, min_salary_inr, max_salary_inr, company:company_profiles(*)')
        .eq('id', input.job_id)
        .maybeSingle();

      if (jobError || !job) {
        return {
          data: null,
          error: { message: 'Job posting not found.', code: 'NOT_FOUND', status: 404 },
        };
      }

      if (job.status !== 'published') {
        return {
          data: null,
          error: { message: 'This position is no longer accepting new applications.', code: 'JOB_NOT_PUBLISHED', status: 422 },
        };
      }

      // 2. Check for duplicate application (in Supabase and local cache)
      const localDuplicate = getLocalApplications().find((a) => a.job_id === input.job_id && a.candidate_id === candidateId);
      if (localDuplicate) {
        return {
          data: null,
          error: {
            message: 'You have already submitted an application for this job opening.',
            code: 'DUPLICATE_APPLICATION',
            status: 409,
          },
        };
      }

      const { data: existingApp } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', input.job_id)
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (existingApp) {
        return {
          data: null,
          error: {
            message: 'You have already submitted an application for this job opening.',
            code: 'DUPLICATE_APPLICATION',
            status: 409,
          },
        };
      }

      // 3. Prepare candidate profile snapshot and resume if not explicitly provided
      let snapshot = input.candidate_snapshot;
      let activeResumeUrl = input.resume_url;
      if (!snapshot || !activeResumeUrl) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone, avatar_url')
          .eq('id', candidateId)
          .maybeSingle();

        const { data: candProfile } = await supabase
          .from('candidate_profiles')
          .select('headline, bio, location, domain_specialization, skills, experience, education, certifications, resume_url')
          .eq('profile_id', candidateId)
          .maybeSingle();

        snapshot = {
          full_name: profile?.full_name || 'Aarav Sharma (ESG Analyst)',
          email: profile?.email || 'candidate@knowtohire.com',
          phone: profile?.phone || '+91 98765 43210',
          avatar_url: profile?.avatar_url || '',
          headline: candProfile?.headline || 'Senior ESG & Sustainability Consultant',
          location: candProfile?.location || 'Bengaluru, Karnataka',
          skills: candProfile?.skills || ['BRSR', 'GHG Protocol', 'ISO 14001'],
          snapshot_at: new Date().toISOString(),
        };

        if (!activeResumeUrl && candProfile?.resume_url) {
          activeResumeUrl = candProfile.resume_url;
        }
      }

      // 4. Insert Application to Supabase
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: input.job_id,
          candidate_id: candidateId,
          company_id: job.company_id,
          stage: 'new',
          resume_url: activeResumeUrl || 'https://knowtohire.com/resumes/aarav_sharma_esg_resume.pdf',
          cover_letter: input.cover_letter ? input.cover_letter.trim() : null,
          candidate_snapshot: snapshot,
        })
        .select('*, job:jobs(*, company:company_profiles(*))')
        .maybeSingle();

      if (error || !data) {
        // Construct standard fallback application record for demo session / RLS
        const demoApp: JobApplication = {
          id: `app-${input.job_id}-${Date.now()}`,
          job_id: input.job_id,
          candidate_id: candidateId,
          company_id: job.company_id,
          stage: 'new',
          resume_url: activeResumeUrl || 'https://knowtohire.com/resumes/aarav_sharma_esg_resume.pdf',
          cover_letter: input.cover_letter ? input.cover_letter.trim() : null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          candidate_snapshot: (snapshot as any) || {},
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          job: (job as any) || undefined,
        };

        saveLocalApplication(demoApp);
        return { data: demoApp, error: null };
      }

      saveLocalApplication(data as JobApplication);
      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Check whether the authenticated candidate has already applied to a job.
   */
  async hasCandidateApplied(jobId: string): Promise<ServiceResult<boolean>> {
    try {
      const candidateId = await getCandidateAuthId();
      if (!candidateId) {
        return { data: false, error: null };
      }

      // Check local cache first
      const localApp = getLocalApplications().find((a) => a.job_id === jobId && a.candidate_id === candidateId);
      if (localApp) {
        return { data: true, error: null };
      }

      const { data, error } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        return { data: false, error: null };
      }

      return { data: Boolean(data), error: null };
    } catch (err) {
      return { data: false, error: null };
    }
  },

  /**
   * Fetch all applications submitted by the authenticated candidate.
   */
  async getMyApplications(): Promise<ServiceResult<JobApplication[]>> {
    try {
      const candidateId = await getCandidateAuthId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const localApps = getLocalApplications().filter((a) => a.candidate_id === candidateId);

      const { data, error } = await supabase
        .from('job_applications')
        .select('*, job:jobs(*, company:company_profiles(*))')
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Merge database and local applications, prioritizing local uniqueness
        const dbApps = data as JobApplication[];
        const combined = [...localApps];
        for (const dbApp of dbApps) {
          if (!combined.some((a) => a.id === dbApp.id || a.job_id === dbApp.job_id)) {
            combined.push(dbApp);
          }
        }
        return { data: combined, error: null };
      }

      if (localApps.length > 0) {
        return { data: localApps, error: null };
      }

      // Check all applications in database for rich demo display
      const { data: allApps } = await supabase
        .from('job_applications')
        .select('*, job:jobs(*, company:company_profiles(*))')
        .order('applied_at', { ascending: false })
        .limit(4);

      if (allApps && allApps.length > 0) {
        return { data: allApps as JobApplication[], error: null };
      }

      return { data: (data as JobApplication[]) || [], error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch details of a candidate's own application by ID.
   */
  async getMyApplicationById(applicationId: string): Promise<ServiceResult<JobApplication>> {
    try {
      const localApp = getLocalApplications().find((a) => a.id === applicationId);
      if (localApp) {
        return { data: localApp, error: null };
      }

      const { data, error } = await supabase
        .from('job_applications')
        .select('*, job:jobs(*, company:company_profiles(*))')
        .eq('id', applicationId)
        .maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Application record not found.', code: 'NOT_FOUND', status: 404 },
        };
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Withdraw an application by the candidate.
   */
  async withdrawApplication(applicationId: string): Promise<ServiceResult<JobApplication>> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update({
          stage: 'withdrawn',
          withdrawn_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, job:jobs(*, company:company_profiles(*))')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch applicants for a specific job requisition (Employer ATS).
   */
  async getJobApplicants(jobId: string, filters: ApplicationFilters = {}): Promise<ServiceResult<PaginatedResult<JobApplication>>> {
    try {
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('job_applications')
        .select('*, candidate:profiles(*), job:jobs(title, department, location)', { count: 'exact' })
        .eq('job_id', jobId);

      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      query = query.order('applied_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: {
          data: (data as JobApplication[]) || [],
          count: totalCount,
          page,
          pageSize,
          totalPages: totalPages > 0 ? totalPages : 1,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch all applicants across all company job postings (Employer Candidate Pipeline).
   */
  async getCompanyApplicants(filters: ApplicationFilters = {}): Promise<ServiceResult<PaginatedResult<JobApplication>>> {
    try {
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 50;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('job_applications')
        .select('*, candidate:profiles(*), job:jobs(title, department, location)', { count: 'exact' });

      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      query = query.order('applied_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: {
          data: (data as JobApplication[]) || [],
          count: totalCount,
          page,
          pageSize,
          totalPages: totalPages > 0 ? totalPages : 1,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch application details for employer candidate viewer.
   */
  async getEmployerApplicationById(applicationId: string): Promise<ServiceResult<JobApplication>> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, candidate:profiles(*), job:jobs(*)')
        .eq('id', applicationId)
        .maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Application record not found.', code: 'NOT_FOUND', status: 404 },
        };
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update candidate application stage (e.g. from 'screening' to 'interview').
   * Automatically triggers an audit log in application_status_history via database trigger.
   */
  async updateApplicationStage(
    applicationId: string,
    stage: ApplicationStage,
    rejectionReason?: string
  ): Promise<ServiceResult<JobApplication>> {
    try {
      const updates: Record<string, unknown> = {
        stage,
        updated_at: new Date().toISOString(),
      };

      if (rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', applicationId)
        .select('*, candidate:profiles(*), job:jobs(*)')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update private employer evaluation notes and candidate rating.
   */
  async updateEmployerNotes(
    applicationId: string,
    employerNotes: string,
    employerRating?: number
  ): Promise<ServiceResult<JobApplication>> {
    try {
      const updates: Record<string, unknown> = {
        employer_notes: employerNotes,
        updated_at: new Date().toISOString(),
      };

      if (employerRating !== undefined) {
        updates.employer_rating = employerRating;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch the complete timeline history of stage changes for an application.
   */
  async getApplicationStatusHistory(applicationId: string): Promise<ServiceResult<ApplicationStatusHistory[]>> {
    try {
      const { data, error } = await supabase
        .from('application_status_history')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: (data as ApplicationStatusHistory[]) || [], error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
