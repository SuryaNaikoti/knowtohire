import { supabase } from '../supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LeadMagnet {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: 'ebook' | 'checklist' | 'template' | 'course' | 'webinar' | 'report';
  file_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
  gate_type: 'email' | 'account' | 'subscription';
  required_plan?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface LeadMagnetCapture {
  lead_magnet_id: string;
  user_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface ResourceRequest {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  category?: string;
  type?: 'template' | 'guide' | 'video' | 'tool' | 'other';
  status: 'pending' | 'under_review' | 'planned' | 'completed' | 'rejected';
  upvote_count: number;
  admin_notes?: string;
  completed_resource_id?: string;
  created_at: string;
  updated_at: string;
  has_upvoted?: boolean;
}

// ─── Lead Magnet Service ──────────────────────────────────────────────────────

export const leadMagnetService = {
  async getAll() {
    const { data, error } = await supabase
      .from('lead_magnets')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as LeadMagnet[];
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('lead_magnets')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data as LeadMagnet;
  },

  async capture(payload: LeadMagnetCapture) {
    // Record capture
    const { error: captureError } = await supabase
      .from('lead_magnet_captures')
      .insert(payload);

    if (captureError) throw captureError;

    // Increment download count (fire-and-forget)
    supabase
      .from('lead_magnets')
      .update({ download_count: supabase.rpc('increment', { x: 1 }) as any })
      .eq('id', payload.lead_magnet_id)
      .then(() => {});
  },

  async getUserCaptures(userId: string) {
    const { data, error } = await supabase
      .from('lead_magnet_captures')
      .select('*, lead_magnet:lead_magnets(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin
  async create(payload: Partial<LeadMagnet>) {
    const { data, error } = await supabase
      .from('lead_magnets')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as LeadMagnet;
  },

  async update(id: string, payload: Partial<LeadMagnet>) {
    const { data, error } = await supabase
      .from('lead_magnets')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as LeadMagnet;
  },

  async getAllCaptures() {
    const { data, error } = await supabase
      .from('lead_magnet_captures')
      .select('*, lead_magnet:lead_magnets(title, slug)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ─── Resource Request Service ─────────────────────────────────────────────────

export const resourceRequestService = {
  async getAll(status?: string) {
    let query = supabase
      .from('resource_requests')
      .select('*')
      .order('upvote_count', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ResourceRequest[];
  },

  async create(payload: { title: string; description: string; category?: string; type?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('resource_requests')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as ResourceRequest;
  },

  async upvote(requestId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('resource_request_upvotes')
      .insert({ resource_request_id: requestId, user_id: user.id });

    if (error) {
      if (error.code === '23505') {
        // Already upvoted — remove upvote
        await supabase
          .from('resource_request_upvotes')
          .delete()
          .eq('resource_request_id', requestId)
          .eq('user_id', user.id);
        return false;
      }
      throw error;
    }
    return true;
  },

  async getUserUpvotes(userId: string) {
    const { data, error } = await supabase
      .from('resource_request_upvotes')
      .select('resource_request_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data ?? []).map((r) => r.resource_request_id);
  },

  // Admin
  async updateStatus(id: string, status: ResourceRequest['status'], adminNotes?: string) {
    const { data, error } = await supabase
      .from('resource_requests')
      .update({ status, admin_notes: adminNotes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ResourceRequest;
  },
};
