/**
 * KnowToHire On-Demand Content Request Service
 * Supports submission, lifecycle tracking, admin review, and deliverable delivery.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export type RequestStatus = 'pending' | 'under_review' | 'completed' | 'rejected';

export interface ContentRequest {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  title: string;
  description: string;
  category: string;
  type?: string | null;
  status: RequestStatus;
  upvote_count: number;
  admin_notes?: string | null;
  completed_resource_id?: string | null;
  deliverable_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  category: string;
  type?: string;
}

export const requestService = {
  /**
   * Fetch all requests submitted by the authenticated user.
   */
  async getMyRequests(): Promise<ServiceResult<ContentRequest[]>> {
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const { data, error } = await supabase
        .from('resource_requests')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const normalized: ContentRequest[] = (data || []).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        description: r.description,
        category: r.category || 'General',
        type: r.type,
        status: r.status as RequestStatus,
        upvote_count: r.upvote_count || 0,
        admin_notes: r.admin_notes,
        completed_resource_id: r.completed_resource_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single request by ID.
   */
  async getRequestById(id: string): Promise<ServiceResult<ContentRequest>> {
    try {
      const { data, error } = await supabase
        .from('resource_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Request not found', code: 'NOT_FOUND', status: 404 },
        };
      }

      return {
        data: {
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          description: data.description,
          category: data.category || 'General',
          type: data.type,
          status: data.status as RequestStatus,
          upvote_count: data.upvote_count || 0,
          admin_notes: data.admin_notes,
          completed_resource_id: data.completed_resource_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Submit a new on-demand content request.
   */
  async createRequest(input: CreateRequestInput): Promise<ServiceResult<ContentRequest>> {
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required to create a request', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const payload = {
        user_id: userData.user.id,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category || 'Environmental & ESG',
        type: input.type || 'Custom Study Material',
        status: 'pending',
        upvote_count: 0,
      };

      const { data, error } = await supabase.from('resource_requests').insert(payload).select('*').single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return {
        data: {
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          description: data.description,
          category: data.category,
          type: data.type,
          status: data.status as RequestStatus,
          upvote_count: data.upvote_count,
          created_at: data.created_at,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Fetch all requests across all users.
   */
  async getAllRequests(): Promise<ServiceResult<ContentRequest[]>> {
    try {
      const { data, error } = await supabase
        .from('resource_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const normalized: ContentRequest[] = (data || []).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        description: r.description,
        category: r.category || 'General',
        type: r.type,
        status: r.status as RequestStatus,
        upvote_count: r.upvote_count || 0,
        admin_notes: r.admin_notes,
        completed_resource_id: r.completed_resource_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Update request status, admin notes, or attach completed resource ID.
   */
  async updateRequestStatus(
    id: string,
    status: RequestStatus,
    adminNotes?: string,
    completedResourceId?: string
  ): Promise<ServiceResult<ContentRequest>> {
    try {
      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (adminNotes !== undefined) updates.admin_notes = adminNotes;
      if (completedResourceId !== undefined) updates.completed_resource_id = completedResourceId;

      const { data, error } = await supabase
        .from('resource_requests')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return {
        data: {
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          description: data.description,
          category: data.category,
          type: data.type,
          status: data.status as RequestStatus,
          upvote_count: data.upvote_count,
          admin_notes: data.admin_notes,
          completed_resource_id: data.completed_resource_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
