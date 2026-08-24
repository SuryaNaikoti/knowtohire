/**
 * KnowToHire Interview Service
 * Manages interview scheduling, status updates, and calendar integrations.
 */

import { supabase } from '@/lib/supabase';
import {
  Interview,
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

function getDemoInterviews(): Interview[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_INTERVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoInterview(interview: Interview) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getDemoInterviews().filter((i) => i.id !== interview.id);
    existing.unshift(interview);
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
   * Fetch all interviews scheduled for the authenticated employer's company.
   */
  async getEmployerInterviews(): Promise<ServiceResult<Interview[]>> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*, candidate:profiles!candidate_id(full_name, email, phone, avatar_url), job:jobs(title, department), company:company_profiles(*)')
        .order('scheduled_start', { ascending: true });

      const dbInterviews = (!error && data) ? (data as Interview[]) : [];
      const demoInterviews = getDemoInterviews();

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
   * Fetch a single interview by ID.
   */
  async getInterviewById(interviewId: string): Promise<ServiceResult<Interview>> {
    try {
      const demoMatch = getDemoInterviews().find((i) => i.id === interviewId);
      if (demoMatch) {
        return { data: demoMatch, error: null };
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
        title: input.title.trim(),
        round_name: input.round_name?.trim() || null,
        scheduled_start: input.scheduled_start,
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
        interviewer_name: input.interviewer_name ? input.interviewer_name.trim() : null,
        interviewer_role: input.interviewer_role ? input.interviewer_role.trim() : null,
        required_documents: input.required_documents || [],
        instructions: input.instructions ? input.instructions.trim() : null,
        status: 'scheduled' as const,
        notes: input.notes ? input.notes.trim() : null,
      };

      const { data, error } = await supabase
        .from('interviews')
        .insert(payload)
        .select('*, candidate:profiles(*), job:jobs(*), company:company_profiles(*)')
        .single();

      if (!error && data) {
        notifyInterviewsChanged();
        return { data: data as Interview, error: null };
      }

      // Demo mode fallback
      const demoId = `interview-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const demoRecord: Interview = {
        id: demoId,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      saveDemoInterview(demoRecord);
      notifyInterviewsChanged();
      return { data: demoRecord, error: null };
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
      return { data: data as Interview, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Cancel an interview.
   */
  async cancelInterview(interviewId: string): Promise<ServiceResult<Interview>> {
    return this.updateInterview(interviewId, { status: 'cancelled' });
  },
};
