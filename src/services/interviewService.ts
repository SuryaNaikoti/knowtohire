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

export type { Interview, InterviewStatus } from './types';

export const interviewService = {
  /**
   * Fetch all upcoming and past interviews for the authenticated candidate.
   */
  async getMyInterviews(): Promise<ServiceResult<Interview[]>> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const { data, error } = await supabase
        .from('interviews')
        .select('*, job:jobs(title, department, location), company:company_profiles(name, logo_url)')
        .eq('candidate_id', userData.user.id)
        .order('scheduled_start', { ascending: true });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: (data as Interview[]) || [], error: null };
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
        .select('*, candidate:profiles!candidate_id(full_name, email, phone, avatar_url), job:jobs(title, department)')
        .order('scheduled_start', { ascending: true });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: (data as Interview[]) || [], error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single interview by ID.
   */
  async getInterviewById(interviewId: string): Promise<ServiceResult<Interview>> {
    try {
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required to schedule interviews.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const payload = {
        application_id: input.application_id,
        job_id: input.job_id,
        company_id: input.company_id,
        candidate_id: input.candidate_id,
        created_by: userData.user.id,
        interview_type: input.interview_type || 'technical_deep_dive',
        title: input.title.trim(),
        scheduled_start: input.scheduled_start,
        scheduled_end: input.scheduled_end || null,
        meeting_link: input.meeting_link ? input.meeting_link.trim() : null,
        location: input.location ? input.location.trim() : null,
        status: 'scheduled' as const,
        notes: input.notes ? input.notes.trim() : null,
      };

      const { data, error } = await supabase
        .from('interviews')
        .insert(payload)
        .select('*, candidate:profiles(*), job:jobs(*)')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: data as Interview, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update an existing interview's schedule, notes, or status.
   */
  async updateInterview(interviewId: string, input: InterviewUpdateInput): Promise<ServiceResult<Interview>> {
    try {
      const updates: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', interviewId)
        .select('*, candidate:profiles(*), job:jobs(*)')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

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
