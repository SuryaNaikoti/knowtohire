/**
 * KnowToHire On-Demand Content Request Service
 * Supports submission, lifecycle tracking, admin review, and deliverable delivery.
 *
 * ARCHITECTURE NOTE:
 * Dual support:
 * 1. REAL SUPABASE MODE: Authenticated users persist to public.resource_requests.
 * 2. DEMO MODE / HYBRID: Synchronizes shared store for seamless testability across Candidate and Admin portals.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
  preferred_format?: string | null;
  additional_requirements?: string | null;
  status: RequestStatus;
  upvote_count: number;
  admin_notes?: string | null;
  completed_resource_id?: string | null;
  deliverable_url?: string | null;
  deliverable_title?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  category: string;
  type: string;
  preferred_format?: string;
  additional_requirements?: string;
}

const DEMO_REQUESTS_STORAGE_KEY = 'kth_demo_resource_requests';

function getDemoRequests(): ContentRequest[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_REQUESTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoRequest(req: ContentRequest) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getDemoRequests().filter((r) => r.id !== req.id);
    const updated = [req, ...existing];
    window.localStorage.setItem(DEMO_REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kth_requests_changed'));
  } catch {
    // Ignore storage errors
  }
}

function updateDemoRequest(id: string, updates: Partial<ContentRequest>) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getDemoRequests();
    const targetIndex = existing.findIndex((r) => r.id === id);
    if (targetIndex >= 0) {
      existing[targetIndex] = { ...existing[targetIndex], ...updates, updated_at: new Date().toISOString() };
      window.localStorage.setItem(DEMO_REQUESTS_STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('kth_requests_changed'));
    }
  } catch {
    // Ignore
  }
}

export const requestService = {
  /**
   * Fetch all requests submitted by the authenticated user.
   */
  async getMyRequests(): Promise<ServiceResult<ContentRequest[]>> {
    try {
      let currentUserId: string | null = null;

      // 1. Check active Supabase Auth
      if (isSupabaseConfigured()) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.id) {
            currentUserId = userData.user.id;
          }
        } catch {
          // Supabase session lookup error fallback
        }
      }

      // 2. Check Demo Auth Session
      if (!currentUserId && typeof window !== 'undefined' && window.localStorage) {
        try {
          const stored = window.localStorage.getItem('kth_demo_auth_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.id) {
              currentUserId = parsed.id;
            }
          }
        } catch {
          // Ignore parse error
        }
      }

      if (!currentUserId) {
        return {
          data: null,
          error: { message: 'Authentication required to view content requests', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      // Try database fetch
      let dbRequests: ContentRequest[] = [];
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('resource_requests')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false });

          if (!error && data) {
            dbRequests = data.map((r) => ({
              id: r.id,
              user_id: r.user_id,
              title: r.title,
              description: r.description,
              category: r.category || 'General',
              type: r.type || 'Study Material',
              preferred_format: r.preferred_format || 'PDF',
              additional_requirements: r.additional_requirements || null,
              status: r.status as RequestStatus,
              upvote_count: r.upvote_count || 0,
              admin_notes: r.admin_notes,
              completed_resource_id: r.completed_resource_id,
              created_at: r.created_at,
              updated_at: r.updated_at,
            }));
          }
        } catch {
          // Table / network catch
        }
      }

      // Merge with demo store for local testing consistency
      const demoReqs = getDemoRequests().filter((r) => r.user_id === currentUserId);
      const combined = [...dbRequests];
      for (const dr of demoReqs) {
        if (!combined.some((c) => c.id === dr.id)) {
          combined.push(dr);
        }
      }

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { data: combined, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single request by ID.
   */
  async getRequestById(id: string): Promise<ServiceResult<ContentRequest>> {
    try {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('resource_requests')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (!error && data) {
            return {
              data: {
                id: data.id,
                user_id: data.user_id,
                title: data.title,
                description: data.description,
                category: data.category || 'General',
                type: data.type || 'Study Material',
                preferred_format: data.preferred_format || 'PDF',
                additional_requirements: data.additional_requirements || null,
                status: data.status as RequestStatus,
                upvote_count: data.upvote_count || 0,
                admin_notes: data.admin_notes,
                completed_resource_id: data.completed_resource_id,
                created_at: data.created_at,
                updated_at: data.updated_at,
              },
              error: null,
            };
          }
        } catch {
          // Fallback to demo store
        }
      }

      const demo = getDemoRequests().find((r) => r.id === id);
      if (demo) {
        return { data: demo, error: null };
      }

      return {
        data: null,
        error: { message: 'Request not found', code: 'NOT_FOUND', status: 404 },
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
      let currentUserId: string | null = null;
      let userEmail: string | undefined;
      let userName: string | undefined;

      if (isSupabaseConfigured()) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.id) {
            currentUserId = userData.user.id;
            userEmail = userData.user.email;
            userName = userData.user.user_metadata?.full_name;
          }
        } catch {
          // Fallback
        }
      }

      if (!currentUserId && typeof window !== 'undefined' && window.localStorage) {
        try {
          const stored = window.localStorage.getItem('kth_demo_auth_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.id) {
              currentUserId = parsed.id;
              userEmail = parsed.email;
              userName = parsed.full_name;
            }
          }
        } catch {
          // Ignore
        }
      }

      if (!currentUserId) {
        return {
          data: null,
          error: { message: 'Authentication required to submit a content request', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
      const now = new Date().toISOString();

      const newRequest: ContentRequest = {
        id: newId,
        user_id: currentUserId,
        user_email: userEmail,
        user_name: userName,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category || 'Technology',
        type: input.type || 'Study Material',
        preferred_format: input.preferred_format || 'PDF',
        additional_requirements: input.additional_requirements?.trim() || null,
        status: 'pending',
        upvote_count: 0,
        admin_notes: null,
        completed_resource_id: null,
        created_at: now,
        updated_at: now,
      };

      // Save to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const payload = {
            id: newId,
            user_id: currentUserId,
            title: newRequest.title,
            description: newRequest.description,
            category: newRequest.category,
            type: newRequest.type,
            status: 'pending',
            upvote_count: 0,
          };
          const { data, error } = await supabase.from('resource_requests').insert(payload).select('*').single();
          if (!error && data) {
            newRequest.id = data.id;
          }
        } catch {
          // Supabase insert catch
        }
      }

      // Always save to demo shared store for seamless multi-portal testing
      saveDemoRequest(newRequest);

      return {
        data: newRequest,
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
      let dbRequests: ContentRequest[] = [];
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('resource_requests')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            dbRequests = data.map((r) => ({
              id: r.id,
              user_id: r.user_id,
              title: r.title,
              description: r.description,
              category: r.category || 'General',
              type: r.type || 'Study Material',
              preferred_format: r.preferred_format || 'PDF',
              additional_requirements: r.additional_requirements || null,
              status: r.status as RequestStatus,
              upvote_count: r.upvote_count || 0,
              admin_notes: r.admin_notes,
              completed_resource_id: r.completed_resource_id,
              created_at: r.created_at,
              updated_at: r.updated_at,
            }));
          }
        } catch {
          // Table catch
        }
      }

      const demoReqs = getDemoRequests();
      const combined = [...dbRequests];
      for (const dr of demoReqs) {
        if (!combined.some((c) => c.id === dr.id)) {
          combined.push(dr);
        }
      }

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { data: combined, error: null };
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

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('resource_requests')
            .update(updates)
            .eq('id', id);
        } catch {
          // Ignore
        }
      }

      // Update in demo shared storage
      updateDemoRequest(id, {
        status,
        admin_notes: adminNotes,
        completed_resource_id: completedResourceId,
      });

      const updated = await this.getRequestById(id);
      return updated;
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};

