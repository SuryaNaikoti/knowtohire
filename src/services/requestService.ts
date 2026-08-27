/**
 * KnowToHire On-Demand Content Request Service
 * Supports submission, lifecycle tracking, admin review, file uploading, and deliverable fulfillment.
 *
 * ARCHITECTURE NOTE:
 * Dual support:
 * 1. REAL SUPABASE MODE: Authenticated users persist to public.resource_requests and Supabase Storage.
 * 2. DEMO MODE / HYBRID: Synchronizes shared store for seamless testability across Candidate and Admin portals.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';
import { contentStorageService } from './contentStorageService';

export type RequestStatus =
  | 'pending'
  | 'under_review'
  | 'in_progress'
  | 'ready_for_delivery'
  | 'completed'
  | 'rejected'
  | 'cancelled';

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
  deliverable_title?: string | null;
  deliverable_description?: string | null;
  deliverable_url?: string | null;
  deliverable_format?: string | null;
  deliverable_size?: string | null;
  deliverable_name?: string | null;
  storage_path?: string | null;
  storage_bucket?: string | null;
  fulfilled_by_resource_id?: string | null;
  completed_at?: string | null;
  price_inr?: number;
  is_paid?: boolean;
  payment_id?: string | null;
  paid_at?: string | null;
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

export interface FulfillRequestInput {
  status: RequestStatus;
  admin_notes?: string;
  deliverable_title?: string;
  deliverable_description?: string;
  deliverable_url?: string;
  deliverable_format?: string;
  deliverable_size?: string;
  deliverable_name?: string;
  storage_path?: string;
  storage_bucket?: string;
  completed_resource_id?: string;
  price_inr?: number;
  file?: File;
  onProgress?: (progress: number) => void;
}

const DEMO_REQUESTS_STORAGE_KEY = 'kth_demo_resource_requests';

// Canonical Baseline Seed Requests for KnowToHire Bespoke Content Hub
export const INITIAL_CANONICAL_REQUESTS: ContentRequest[] = [
  {
    id: 'req-1',
    user_id: 'cand-1',
    user_name: 'Aarav Mehta',
    user_email: 'aarav.mehta@example.com',
    title: 'SEBI BRSR Core KPI Assurance & Scope 3 Emissions Calculator Methodology',
    description: 'Requesting a dedicated calculation methodology and data audit sheet for Scope 3 emissions verification conforming with SEBI BRSR Core requirements.',
    category: 'Sustainability & ESG',
    type: 'Compliance Checklist',
    preferred_format: 'XLSX',
    additional_requirements: 'Must include emission factor references from CEA India Grid and IPCC 2026 guidelines.',
    status: 'in_progress',
    upvote_count: 14,
    admin_notes: 'Research team drafting standard emissions factor lookup sheet; scheduled for review.',
    completed_resource_id: null,
    deliverable_title: null,
    deliverable_description: null,
    deliverable_url: null,
    deliverable_format: null,
    deliverable_size: null,
    deliverable_name: null,
    storage_path: null,
    storage_bucket: 'content',
    fulfilled_by_resource_id: null,
    completed_at: null,
    price_inr: 0,
    is_paid: true,
    payment_id: 'pay_demo_req_1',
    paid_at: '2026-08-24T10:00:00.000Z',
    created_at: '2026-08-24T10:00:00.000Z',
    updated_at: '2026-08-25T14:00:00.000Z',
  },
  {
    id: 'req-2',
    user_id: 'cand-2',
    user_name: 'Ananya Rao',
    user_email: 'ananya.rao@example.com',
    title: 'EIA Clearance Checklist for Industrial Park Expansion (Category B1 Projects)',
    description: 'Step-by-step statutory clearance matrix for State EAC submissions, public hearing compliance, and SEIAA clearances.',
    category: 'Environmental Health & Safety',
    type: 'Legal & Contract',
    preferred_format: 'PDF',
    additional_requirements: 'Please cite the latest MoEFCC notifications for State EIA clearance timelines.',
    status: 'under_review',
    upvote_count: 9,
    admin_notes: 'Under review by legal and environmental compliance panel.',
    completed_resource_id: null,
    deliverable_title: null,
    deliverable_description: null,
    deliverable_url: null,
    deliverable_format: null,
    deliverable_size: null,
    deliverable_name: null,
    storage_path: null,
    storage_bucket: 'content',
    fulfilled_by_resource_id: null,
    completed_at: null,
    price_inr: 0,
    is_paid: false,
    payment_id: null,
    paid_at: null,
    created_at: '2026-08-22T09:30:00.000Z',
    updated_at: '2026-08-22T09:30:00.000Z',
  },
  {
    id: 'req-3',
    user_id: 'cand-4',
    user_name: 'Kavya Nair',
    user_email: 'kavya.nair@example.com',
    title: 'Renewable Energy Corporate Power Purchase Agreement (PPA) Master Template',
    description: 'Drafting guide and open-access tariff contract structure for rooftop solar & captive green energy procurement across Indian states.',
    category: 'Legal & Contracts',
    type: 'Business Contract',
    preferred_format: 'DOCX',
    additional_requirements: 'Include state-specific wheeling charge clauses for Maharashtra and Karnataka.',
    status: 'completed',
    upvote_count: 22,
    admin_notes: 'Fulfilled using standard verified corporate PPA legal asset.',
    completed_resource_id: 'res-1',
    deliverable_title: 'Renewable Energy Corporate PPA Template & Tariff Schedule',
    deliverable_description: 'Standard master power purchase contract with tariff escalation and default protection schedules.',
    deliverable_url: 'https://knowtohire.com/content/requests/req-3/renewable_ppa_template.docx',
    deliverable_format: 'DOCX',
    deliverable_size: '2.4 MB',
    deliverable_name: 'renewable_ppa_template.docx',
    storage_path: 'requests/req-3/renewable_ppa_template.docx',
    storage_bucket: 'content',
    fulfilled_by_resource_id: 'res-1',
    completed_at: '2026-08-26T16:00:00.000Z',
    price_inr: 0,
    is_paid: true,
    payment_id: 'pay_demo_req_3',
    paid_at: '2026-08-20T11:00:00.000Z',
    created_at: '2026-08-20T11:00:00.000Z',
    updated_at: '2026-08-26T16:00:00.000Z',
  },
  {
    id: 'req-4',
    user_id: 'cand-5',
    user_name: 'Vikramaditya Sen',
    user_email: 'vikram.sen@example.com',
    title: 'Patent Claims Drafting Matrix for CleanTech & Carbon Capture Inventions',
    description: 'Standard claim structuring handbook addressing patentability hurdles under Section 3(d) & 3(k) of the Indian Patents Act for environmental technologies.',
    category: 'Intellectual Property',
    type: 'Study Material',
    preferred_format: 'PDF',
    additional_requirements: 'Provide comparative case study examples from Indian Patent Office IPO decisions.',
    status: 'pending',
    upvote_count: 7,
    admin_notes: null,
    completed_resource_id: null,
    deliverable_title: null,
    deliverable_description: null,
    deliverable_url: null,
    deliverable_format: null,
    deliverable_size: null,
    deliverable_name: null,
    storage_path: null,
    storage_bucket: 'content',
    fulfilled_by_resource_id: null,
    completed_at: null,
    price_inr: 0,
    is_paid: false,
    payment_id: null,
    paid_at: null,
    created_at: '2026-08-26T08:15:00.000Z',
    updated_at: '2026-08-26T08:15:00.000Z',
  },
];

let inMemoryDemoRequests: ContentRequest[] = [];

function getDemoRequests(): ContentRequest[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(DEMO_REQUESTS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
  }
  return inMemoryDemoRequests;
}

function saveDemoRequest(req: ContentRequest) {
  const existing = getDemoRequests().filter((r) => r.id !== req.id);
  inMemoryDemoRequests = [req, ...existing];

  if (typeof window !== 'undefined') {
    if (window.localStorage) {
      try {
        window.localStorage.setItem(DEMO_REQUESTS_STORAGE_KEY, JSON.stringify(inMemoryDemoRequests));
      } catch {
        // Ignore
      }
    }
    window.dispatchEvent(new CustomEvent('kth_requests_changed'));
  }
}

function updateDemoRequest(id: string, updates: Partial<ContentRequest>) {
  let existing = [...getDemoRequests()];
  if (existing.length === 0) {
    existing = [...INITIAL_CANONICAL_REQUESTS];
  }
  const targetIndex = existing.findIndex((r) => r.id === id);
  if (targetIndex >= 0) {
    existing[targetIndex] = {
      ...existing[targetIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    inMemoryDemoRequests = existing;

    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        try {
          window.localStorage.setItem(DEMO_REQUESTS_STORAGE_KEY, JSON.stringify(existing));
        } catch {
          // Ignore
        }
      }
      window.dispatchEvent(new CustomEvent('kth_requests_changed'));
    }
  }
}

function mapDatabaseRowToContentRequest(r: Record<string, any>): ContentRequest {
  return {
    id: r.id,
    user_id: r.user_id,
    title: r.title,
    description: r.description,
    category: r.category || 'General',
    type: r.type || 'Study Material',
    preferred_format: r.preferred_format || 'PDF',
    additional_requirements: r.additional_requirements || null,
    status: (r.status || 'pending') as RequestStatus,
    upvote_count: r.upvote_count || 0,
    admin_notes: r.admin_notes || null,
    completed_resource_id: r.completed_resource_id || r.fulfilled_by_resource_id || null,
    deliverable_title: r.deliverable_title || null,
    deliverable_description: r.deliverable_description || null,
    deliverable_url: r.deliverable_url || null,
    deliverable_format: r.deliverable_format || null,
    deliverable_size: r.deliverable_size || null,
    deliverable_name: r.deliverable_name || null,
    storage_path: r.storage_path || null,
    storage_bucket: r.storage_bucket || 'content',
    fulfilled_by_resource_id: r.fulfilled_by_resource_id || r.completed_resource_id || null,
    completed_at: r.completed_at || null,
    price_inr: Number(r.price_inr || 0),
    is_paid: Boolean(r.is_paid),
    payment_id: r.payment_id || null,
    paid_at: r.paid_at || null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
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
          // Supabase session lookup fallback
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
            dbRequests = data.map(mapDatabaseRowToContentRequest);
          }
        } catch {
          // Table / network catch
        }
      }

      // Base canonical seed requests matching current user
      const baseUserReqs = INITIAL_CANONICAL_REQUESTS.filter((r) => r.user_id === currentUserId);
      const combined = dbRequests.length > 0 ? [...dbRequests] : [...baseUserReqs];

      // Merge with demo store for local testing consistency
      const demoReqs = getDemoRequests().filter((r) => r.user_id === currentUserId);
      for (const dr of demoReqs) {
        const existingIndex = combined.findIndex((c) => c.id === dr.id);
        if (existingIndex >= 0) {
          combined[existingIndex] = { ...combined[existingIndex], ...dr };
        } else {
          combined.unshift(dr);
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
            const parsed = mapDatabaseRowToContentRequest(data);
            const demo = getDemoRequests().find((r) => r.id === id);
            if (demo) {
              return { data: { ...parsed, ...demo }, error: null };
            }
            return { data: parsed, error: null };
          }
        } catch {
          // Fallback to demo store
        }
      }

      const all = [...getDemoRequests(), ...INITIAL_CANONICAL_REQUESTS];
      const match = all.find((r) => r.id === id);
      if (match) {
        return { data: match, error: null };
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
        currentUserId = '00000000-0000-0000-0000-000000000001';
        userEmail = 'candidate@knowtohire.com';
        userName = 'Aarav Sharma';
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
        deliverable_title: null,
        deliverable_description: null,
        deliverable_url: null,
        deliverable_format: null,
        deliverable_size: null,
        deliverable_name: null,
        storage_path: null,
        storage_bucket: 'content',
        fulfilled_by_resource_id: null,
        completed_at: null,
        price_inr: 0,
        is_paid: false,
        payment_id: null,
        paid_at: null,
        created_at: now,
        updated_at: now,
      };

      if (isSupabaseConfigured()) {
        try {
          const payload = {
            id: newId,
            user_id: currentUserId,
            title: newRequest.title,
            description: newRequest.description,
            category: newRequest.category,
            type: newRequest.type,
            preferred_format: newRequest.preferred_format,
            additional_requirements: newRequest.additional_requirements,
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
            dbRequests = data.map(mapDatabaseRowToContentRequest);
          }
        } catch {
          // Table catch
        }
      }

      const baseList = dbRequests.length > 0 ? dbRequests : [...INITIAL_CANONICAL_REQUESTS];
      const demoReqs = getDemoRequests();
      const combined = [...baseList];

      for (const dr of demoReqs) {
        const existingIndex = combined.findIndex((c) => c.id === dr.id);
        if (existingIndex >= 0) {
          combined[existingIndex] = { ...combined[existingIndex], ...dr };
        } else {
          combined.unshift(dr);
        }
      }

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { data: combined, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Fulfill or update a content request.
   * Handles file uploading to Supabase Storage, linking existing resources,
   * and enforcing that a request cannot be marked 'completed' without a deliverable.
   */
  async updateAndFulfillRequest(
    id: string,
    input: FulfillRequestInput
  ): Promise<ServiceResult<ContentRequest>> {
    try {
      const existingRes = await this.getRequestById(id);
      const existing = existingRes.data;

      let deliverableUrl = input.deliverable_url || existing?.deliverable_url;
      let deliverableName = input.deliverable_name || existing?.deliverable_name;
      let deliverableSize = input.deliverable_size || existing?.deliverable_size;
      let deliverableFormat = input.deliverable_format || existing?.deliverable_format;
      let storagePath = input.storage_path || existing?.storage_path;
      let storageBucket = input.storage_bucket || existing?.storage_bucket || 'content';
      let completedResourceId = input.completed_resource_id !== undefined ? input.completed_resource_id : existing?.completed_resource_id;

      // 1. If a new file was provided, upload to Supabase Storage in 'content' bucket
      if (input.file) {
        const uploadResult = await contentStorageService.uploadFile({
          bucket: 'content',
          folder: `requests/${id}`,
          file: input.file,
          onProgress: input.onProgress,
        });

        if (uploadResult.error || !uploadResult.url) {
          return {
            data: null,
            error: { message: uploadResult.error || 'Failed to upload deliverable file.', code: 'UPLOAD_FAILED', status: 400 },
          };
        }

        deliverableUrl = uploadResult.url;
        deliverableName = uploadResult.fileName;
        deliverableSize = uploadResult.fileSize;
        deliverableFormat = uploadResult.format;
        storagePath = uploadResult.filePath;
        storageBucket = 'content';
      }

      // 2. Enforce Fulfillment Governance:
      // A request cannot be marked as 'completed' unless an uploaded deliverable or attached resource exists.
      const hasDeliverable = Boolean(deliverableUrl || completedResourceId);
      if (input.status === 'completed' && !hasDeliverable) {
        return {
          data: null,
          error: {
            message: 'A completed resource or file deliverable must be uploaded or attached before this request can be marked as fulfilled.',
            code: 'DELIVERABLE_REQUIRED',
            status: 422,
          },
        };
      }

      const completedAt = input.status === 'completed' ? (existing?.completed_at || new Date().toISOString()) : null;

      const updates: Partial<ContentRequest> = {
        status: input.status,
        admin_notes: input.admin_notes !== undefined ? input.admin_notes : existing?.admin_notes,
        deliverable_title: input.deliverable_title !== undefined ? input.deliverable_title : existing?.deliverable_title,
        deliverable_description: input.deliverable_description !== undefined ? input.deliverable_description : existing?.deliverable_description,
        deliverable_url: deliverableUrl,
        deliverable_name: deliverableName,
        deliverable_size: deliverableSize,
        deliverable_format: deliverableFormat,
        storage_path: storagePath,
        storage_bucket: storageBucket,
        completed_resource_id: completedResourceId,
        fulfilled_by_resource_id: completedResourceId,
        price_inr: input.price_inr !== undefined ? input.price_inr : existing?.price_inr,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('resource_requests').update(updates).eq('id', id);
        } catch {
          // Table catch
        }
      }

      updateDemoRequest(id, updates);

      const updated = await this.getRequestById(id);
      return updated;
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Candidate / Payment Flow: Mark request as paid upon successful transaction.
   */
  async markRequestPaid(id: string, paymentId: string): Promise<ServiceResult<ContentRequest>> {
    try {
      const now = new Date().toISOString();
      const updates = {
        is_paid: true,
        payment_id: paymentId,
        paid_at: now,
        updated_at: now,
      };

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('resource_requests').update(updates).eq('id', id);
        } catch {
          // Ignore
        }
      }

      updateDemoRequest(id, updates);
      return this.getRequestById(id);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Status and notes update.
   */
  async updateRequestStatus(
    id: string,
    status: RequestStatus,
    adminNotes?: string,
    completedResourceId?: string
  ): Promise<ServiceResult<ContentRequest>> {
    return this.updateAndFulfillRequest(id, {
      status,
      admin_notes: adminNotes,
      completed_resource_id: completedResourceId,
    });
  },
};
