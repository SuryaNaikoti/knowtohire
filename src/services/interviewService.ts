/**
 * KnowToHire Interview Service
 * Manages interview scheduling, status updates, and calendar integrations.
 */

import { supabase } from '@/lib/supabase';
import { applicationService } from './applicationService';
import { notificationService } from './notificationService';
import {
  Interview,
  InterviewStatus,
  InterviewCreateInput,
  InterviewUpdateInput,
  ServiceResult,
  normalizeServiceError,
} from './types';

export type { Interview, InterviewStatus, InterviewType } from './types';

const DEMO_INTERVIEWS_KEY = 'kth_demo_interviews';

function notifyInterviewsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kth_interviews_changed'));
  }
}

function getLocalCreatedJobs(): any[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem('kth_local_created_jobs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredApplications(): any[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem('kth_demo_applications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function hydrateInterviewEntities(interview: Interview): Interview {
  const cloned: Interview = { ...interview };

  // 1. Hydrate candidate if missing
  if (!cloned.candidate && cloned.candidate_id) {
    let candName = '';
    let candEmail = '';
    let candPhone = '';
    let candAvatar = '';

    // Check associated application snapshot
    if (cloned.application_id) {
      const allApps = getStoredApplications();
      const matchApp = allApps.find((a: any) => a.id === cloned.application_id);
      if (matchApp) {
        const snapshot = matchApp.candidate_snapshot || {};
        candName = matchApp.candidate?.full_name || snapshot.full_name || '';
        candEmail = matchApp.candidate?.email || snapshot.email || '';
        candPhone = matchApp.candidate?.phone || snapshot.phone || '';
        candAvatar = matchApp.candidate?.avatar_url || snapshot.avatar_url || '';
      }
    }

    // Check localStorage custom profile / auth session
    if (!candName && typeof window !== 'undefined' && window.localStorage) {
      try {
        const candProfileRaw = window.localStorage.getItem(`kth_demo_cand_profile_${cloned.candidate_id}`);
        if (candProfileRaw) {
          const parsed = JSON.parse(candProfileRaw);
          if (parsed.fullName) candName = parsed.fullName;
          if (parsed.email) candEmail = parsed.email;
          if (parsed.phone) candPhone = parsed.phone;
        }

        if (!candName) {
          const authRaw = window.localStorage.getItem('kth_demo_auth_session');
          if (authRaw) {
            const parsedAuth = JSON.parse(authRaw);
            if (parsedAuth.id === cloned.candidate_id || parsedAuth.role === 'candidate') {
              candName = parsedAuth.full_name || 'Surya Naikoti';
              candEmail = parsedAuth.email || 'candidate@knowtohire.com';
            }
          }
        }
      } catch {
        // ignore
      }
    }

    if (!candName) {
      candName = 'Surya Naikoti';
      candEmail = 'candidate@knowtohire.com';
    }

    cloned.candidate = {
      id: cloned.candidate_id,
      full_name: candName,
      email: candEmail,
      phone: candPhone || undefined,
      avatar_url: candAvatar || undefined,
      role: 'candidate',
      status: 'active',
      created_at: cloned.created_at,
      updated_at: cloned.updated_at,
    } as any;
  }

  // 2. Hydrate job if missing
  if (!cloned.job && cloned.job_id) {
    let jobTitle = '';
    let jobDept = 'Engineering';
    let jobLoc = 'India';

    const localJobs = getLocalCreatedJobs();
    const matchJob = localJobs.find((j: any) => j.id === cloned.job_id);
    if (matchJob) {
      jobTitle = matchJob.title;
      jobDept = matchJob.department || jobDept;
      jobLoc = matchJob.location || jobLoc;
    }

    if (!jobTitle && cloned.application_id) {
      const allApps = getStoredApplications();
      const matchApp = allApps.find((a: any) => a.id === cloned.application_id);
      if (matchApp?.job?.title) {
        jobTitle = matchApp.job.title;
        jobDept = matchApp.job.department || jobDept;
        jobLoc = matchApp.job.location || jobLoc;
      }
    }

    if (jobTitle) {
      cloned.job = {
        id: cloned.job_id,
        company_id: cloned.company_id,
        created_by: cloned.created_by || '',
        title: jobTitle,
        department: jobDept,
        category: 'Engineering',
        description: '',
        responsibilities: [],
        requirements: [],
        skills: [],
        benefits: [],
        employment_type: 'Full-time' as any,
        work_mode: 'Hybrid' as any,
        location: jobLoc,
        min_salary_inr: 1200000,
        max_salary_inr: 2400000,
        status: 'published',
        published_at: cloned.created_at,
        created_at: cloned.created_at,
        updated_at: cloned.updated_at,
      } as any;
    }
  }

  return cloned;
}

function getDemoInterviews(): Interview[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_INTERVIEWS_KEY);
    const list: Interview[] = raw ? JSON.parse(raw) : [];
    return list.map(hydrateInterviewEntities);
  } catch {
    return [];
  }
}

function saveDemoInterview(interview: Interview) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const hydrated = hydrateInterviewEntities(interview);
    const existing = getDemoInterviews().filter((i) => i.id !== interview.id);
    existing.unshift(hydrated);
    window.localStorage.setItem(DEMO_INTERVIEWS_KEY, JSON.stringify(existing));
    notifyInterviewsChanged();
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
  return '00000000-0000-0000-0000-000000000001';
}

async function getEmployerCompanyId(): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.id) {
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('profile_id', userData.user.id)
      .maybeSingle();

    if (employerProfile?.company_id) return employerProfile.company_id;
    return 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        if (parsed?.role === 'employer') {
          return parsed.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}

export const interviewService = {
  /**
   * Fetch all upcoming and past interviews for the authenticated candidate.
   */
  async getMyInterviews(): Promise<ServiceResult<Interview[]>> {
    try {
      const candidateId = await getCandidateUserId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      // 1. Fetch from Supabase
      const { data, error } = await supabase
        .from('interviews')
        .select('*, job:jobs(title, department, location, min_salary_inr, max_salary_inr), company:company_profiles(name, logo_url)')
        .eq('candidate_id', candidateId)
        .order('scheduled_start', { ascending: true });

      const dbInterviews = (!error && data) ? (data as Interview[]) : [];

      // 2. Fetch from Demo Store
      const demoInterviews = getDemoInterviews().filter((i) => i.candidate_id === candidateId);

      // 3. Merge without duplicates
      const merged = [...demoInterviews];
      for (const item of dbInterviews) {
        if (!merged.some((i) => i.id === item.id)) {
          merged.push(item);
        }
      }

      return { data: merged, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch interviews for a candidate (Candidate / Admin).
   */
  async getInterviewsByCandidate(_candidateId?: string): Promise<ServiceResult<Interview[]>> {
    return this.getMyInterviews();
  },

  /**
   * Fetch all interviews scheduled for the authenticated employer's company.
   */
  async getEmployerInterviews(companyIdParam?: string): Promise<ServiceResult<Interview[]>> {
    try {
      const companyId = companyIdParam || (await getEmployerCompanyId());

      let query = supabase
        .from('interviews')
        .select('*, candidate:profiles!candidate_id(full_name, email, phone, avatar_url), job:jobs(title, department), company:company_profiles(*)')
        .order('scheduled_start', { ascending: true });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      const dbInterviews = (!error && data) ? (data as Interview[]) : [];
      let demoInterviews = getDemoInterviews();
      if (companyId) {
        demoInterviews = demoInterviews.filter((i) => i.company_id === companyId);
      }

      const merged = [...demoInterviews];
      for (const item of dbInterviews) {
        if (!merged.some((i) => i.id === item.id)) {
          merged.push(item);
        }
      }

      return { data: merged, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch interviews for a specific company (Employer / Admin).
   */
  async getInterviewsByCompany(companyId?: string): Promise<ServiceResult<Interview[]>> {
    return this.getEmployerInterviews(companyId);
  },

  /**
   * Fetch a single interview by ID.
   */
  async getInterviewById(interviewId: string): Promise<ServiceResult<Interview>> {
    try {
      const demoMatch = getDemoInterviews().find((i) => i.id === interviewId);
      if (demoMatch) {
        return { data: hydrateInterviewEntities(demoMatch), error: null };
      }

      const { data, error } = await supabase
        .from('interviews')
        .select('*, candidate:profiles!candidate_id(*), job:jobs(*), company:company_profiles(*)')
        .eq('id', interviewId)
        .maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Interview record not found.', code: 'NOT_FOUND', status: 404 },
        };
      }

      return { data: data as Interview, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Schedule a new interview round for an applicant.
   */
  async scheduleInterview(input: InterviewCreateInput): Promise<ServiceResult<Interview>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const creatorId = userData?.user?.id || '00000000-0000-0000-0000-000000000002';

      const payload = {
        application_id: input.application_id,
        job_id: input.job_id,
        company_id: input.company_id,
        candidate_id: input.candidate_id,
        created_by: creatorId,
        interview_type: input.interview_type || 'technical_deep_dive',
        title: (input.title || input.round_name || 'Technical Interview Round').trim(),
        round_name: input.round_name?.trim() || 'Round 1',
        scheduled_start: input.scheduled_start || (input as any).scheduled_at || new Date().toISOString(),
        scheduled_end: input.scheduled_end || null,
        date_from: input.date_from || null,
        date_to: input.date_to || null,
        time_window: input.time_window || null,
        meeting_link: input.meeting_link ? input.meeting_link.trim() : null,
        meeting_platform: input.meeting_platform ? input.meeting_platform.trim() : null,
        contact_phone: input.contact_phone ? input.contact_phone.trim() : null,
        location: input.location ? input.location.trim() : null,
        venue_address: input.venue_address ? input.venue_address.trim() : null,
        map_url: input.map_url ? input.map_url.trim() : null,
        interviewer_role: input.interviewer_role ? input.interviewer_role.trim() : null,
        required_documents: input.required_documents || [],
        instructions: input.instructions ? input.instructions.trim() : null,
        status: 'scheduled' as const,
        notes: input.notes ? input.notes.trim() : null,
      };

      const isDemo =
        typeof window !== 'undefined' &&
        window.localStorage &&
        (Boolean(window.localStorage.getItem('kth_demo_auth_session')) ||
          Boolean(window.localStorage.getItem('kth_demo_applications')));

      // In demo mode or if Supabase is offline/unauthenticated, save to demo store
      if (isDemo) {
        const demoId = `interview-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const demoRecord: Interview = {
          id: demoId,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (input.application_id) {
          await applicationService.updateApplicationStage(input.application_id, 'interview');
        }

        const hydrated = hydrateInterviewEntities(demoRecord);
        saveDemoInterview(hydrated);
        notifyInterviewsChanged();

        // Dispatch employer notification for scheduled interview
        const candName = hydrated.candidate?.full_name || 'Candidate';
        const jobTitle = hydrated.job?.title || 'Job Opening';
        notificationService.createNotification({
          company_id: input.company_id,
          candidate_id: input.candidate_id,
          application_id: input.application_id,
          job_id: input.job_id,
          interview_id: hydrated.id,
          type: 'interview',
          title: `Interview Scheduled: ${candName}`,
          message: `Interview scheduled with ${candName} for "${jobTitle}".`,
          link: '/employer/interviews',
        }).catch(() => {});

        return { data: hydrated, error: null };
      }

      const { data, error } = await supabase
        .from('interviews')
        .insert(payload)
        .select('*, candidate:profiles(*), job:jobs(*), company:company_profiles(*)')
        .single();

      if (!error && data) {
        if (input.application_id) {
          await applicationService.updateApplicationStage(input.application_id, 'interview');
        }
        notifyInterviewsChanged();

        // Dispatch employer notification for scheduled interview
        const candName = (data as any)?.candidate?.full_name || 'Candidate';
        const jobTitle = (data as any)?.job?.title || 'Job Opening';
        notificationService.createNotification({
          company_id: input.company_id,
          candidate_id: input.candidate_id,
          application_id: input.application_id,
          job_id: input.job_id,
          interview_id: data.id,
          type: 'interview',
          title: `Interview Scheduled: ${candName}`,
          message: `Interview scheduled with ${candName} for "${jobTitle}".`,
          link: '/employer/interviews',
        }).catch(() => {});

        return { data: data as Interview, error: null };
      }

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: null, error: { message: 'Failed to schedule interview.', code: 'INTERVIEW_ERROR', status: 500 } };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update an existing interview's schedule, notes, or status.
   */
  async updateInterview(interviewId: string, input: InterviewUpdateInput): Promise<ServiceResult<Interview>> {
    try {
      const demoInterviews = getDemoInterviews();
      const idx = demoInterviews.findIndex((i) => i.id === interviewId);
      if (idx !== -1) {
        demoInterviews[idx] = {
          ...demoInterviews[idx],
          ...input,
          updated_at: new Date().toISOString(),
        };
        window.localStorage.setItem(DEMO_INTERVIEWS_KEY, JSON.stringify(demoInterviews));
        notifyInterviewsChanged();

        if (input.status === 'completed' && demoInterviews[idx].application_id) {
          await applicationService.updateApplicationStage(demoInterviews[idx].application_id, 'offer');
        } else if (input.status === 'cancelled' && demoInterviews[idx].application_id) {
          // If cancelled, keep in interview or archive depending on recruitment rules
        }

        if (input.status === 'cancelled' || input.status === 'completed') {
          const candName = demoInterviews[idx].candidate?.full_name || 'Candidate';
          const statusText = input.status === 'cancelled' ? 'Cancelled' : 'Completed';
          notificationService.createNotification({
            company_id: demoInterviews[idx].company_id,
            candidate_id: demoInterviews[idx].candidate_id,
            application_id: demoInterviews[idx].application_id,
            job_id: demoInterviews[idx].job_id,
            interview_id: demoInterviews[idx].id,
            type: 'interview',
            title: `Interview ${statusText}: ${candName}`,
            message: input.status === 'completed' 
              ? `Interview with ${candName} completed. Candidate has been moved forward to the Offer Extended stage.`
              : `Interview with ${candName} was cancelled.`,
            link: input.status === 'completed' ? '/employer/pipeline' : '/employer/interviews',
          }).catch(() => {});
        }

        return { data: demoInterviews[idx], error: null };
      }

      const updates: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', interviewId)
        .select('*, candidate:profiles(*), job:jobs(*), company:company_profiles(*)')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      notifyInterviewsChanged();

      if (data && (input.status === 'cancelled' || input.status === 'completed')) {
        const appId = (data as any)?.application_id;
        if (input.status === 'completed' && appId) {
          await applicationService.updateApplicationStage(appId, 'offer');
        }
        const candName = (data as any)?.candidate?.full_name || 'Candidate';
        const statusText = input.status === 'cancelled' ? 'Cancelled' : 'Completed';
        notificationService.createNotification({
          company_id: (data as any).company_id,
          candidate_id: (data as any).candidate_id,
          application_id: (data as any).application_id,
          job_id: (data as any).job_id,
          interview_id: (data as any).id,
          type: 'interview',
          title: `Interview ${statusText}: ${candName}`,
          message: input.status === 'completed'
            ? `Interview with ${candName} completed. Candidate has been moved forward to the Offer Extended stage.`
            : `Interview with ${candName} was cancelled.`,
          link: input.status === 'completed' ? '/employer/pipeline' : '/employer/interviews',
        }).catch(() => {});
      }

      return { data: data as Interview, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Quick status update for interview.
   */
  async updateInterviewStatus(interviewId: string, status: InterviewStatus): Promise<ServiceResult<boolean>> {
    const res = await this.updateInterview(interviewId, { status });
    if (res.error) {
      return { data: null, error: res.error };
    }
    return { data: true, error: null };
  },

  /**
   * Cancel an interview.
   */
  async cancelInterview(interviewId: string): Promise<ServiceResult<Interview>> {
    return this.updateInterview(interviewId, { status: 'cancelled' });
  },
};
