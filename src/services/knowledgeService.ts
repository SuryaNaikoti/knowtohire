/**
 * KnowToHire Knowledge Hub Service
 * Real Supabase operations for E-books, Research Papers, Regulatory Handbooks, and Study Materials.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export interface KnowledgeResource {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  format: string;
  file_url: string | null;
  file_size?: string | null;
  cover_url?: string | null;
  author?: string;
  pageCount?: number;
  rating: number;
  downloads_count: number;
  is_free?: boolean;
  price_inr?: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ResourceFilterParams {
  search?: string;
  category?: string;
  format?: string;
  isFree?: boolean;
  limit?: number;
}

export interface CreateResourceInput {
  title: string;
  slug?: string;
  description: string;
  category?: string;
  format?: string;
  file_url?: string;
  file_size?: string;
  cover_url?: string;
  rating?: number;
  tags?: string[];
}

export const knowledgeService = {
  /**
   * Fetch all knowledge resources with optional search, category, and limit filtering.
   */
  async getResources(params?: ResourceFilterParams): Promise<ServiceResult<KnowledgeResource[]>> {
    try {
      let query = supabase
        .from('resources')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (params?.search && params.search.trim()) {
        const term = params.search.trim();
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
      }

      if (params?.category && params.category !== 'all') {
        query = query.ilike('category', `%${params.category}%`);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const normalized: KnowledgeResource[] = (data || []).map((r) => ({
        id: r.id,
        title: r.title || 'Untitled Resource',
        slug: r.slug || r.id,
        description: r.description || '',
        category: r.category || 'Environmental & ESG',
        format: r.format || 'PDF',
        file_url: r.file_url,
        file_size: r.file_size || '2.4 MB',
        cover_url: r.cover_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=250&q=80',
        author: r.author || 'KnowToHire Regulatory Team',
        pageCount: r.page_count || 48,
        rating: Number(r.rating) || 4.8,
        downloads_count: Number(r.downloads_count) || 0,
        is_free: r.price === undefined || r.price === 0,
        price_inr: Number(r.price) || 0,
        tags: Array.isArray(r.tags) ? r.tags : ['ESG', 'Compliance', 'Research'],
        created_at: r.created_at || new Date().toISOString(),
        updated_at: r.updated_at,
      }));

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single resource by ID or Slug.
   */
  async getResourceByIdOrSlug(idOrSlug: string): Promise<ServiceResult<KnowledgeResource>> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      let query = supabase.from('resources').select('*').is('deleted_at', null);

      if (isUUID) {
        query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
      } else {
        query = query.eq('slug', idOrSlug);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Resource not found', code: 'NOT_FOUND', status: 404 },
        };
      }

      const normalized: KnowledgeResource = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category || 'Environmental & ESG',
        format: data.format || 'PDF',
        file_url: data.file_url,
        file_size: data.file_size || '2.4 MB',
        cover_url: data.cover_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=250&q=80',
        author: data.author || 'KnowToHire Regulatory Team',
        pageCount: data.page_count || 48,
        rating: Number(data.rating) || 4.8,
        downloads_count: Number(data.downloads_count) || 0,
        is_free: data.price === undefined || data.price === 0,
        price_inr: Number(data.price) || 0,
        tags: Array.isArray(data.tags) ? data.tags : ['ESG', 'Compliance', 'Research'],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Track a download event and increment download counter.
   */
  async trackDownload(resourceId: string): Promise<ServiceResult<{ downloadUrl: string }>> {
    try {
      const { data: resource, error: getErr } = await supabase
        .from('resources')
        .select('id, file_url, downloads_count')
        .eq('id', resourceId)
        .single();

      if (getErr || !resource) {
        return { data: null, error: { message: 'Resource not found', code: 'NOT_FOUND', status: 404 } };
      }

      const newCount = (resource.downloads_count || 0) + 1;
      await supabase.from('resources').update({ downloads_count: newCount }).eq('id', resourceId);

      // Record in resource_downloads if user authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.from('resource_downloads').insert({
          user_id: userData.user.id,
          resource_id: resourceId,
        });
      }

      return {
        data: { downloadUrl: resource.file_url || 'https://knowtohire.com/resources/download.pdf' },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Create a new resource.
   */
  async createResource(input: CreateResourceInput): Promise<ServiceResult<KnowledgeResource>> {
    try {
      const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = {
        title: input.title.trim(),
        slug,
        description: input.description.trim(),
        format: input.format || 'PDF',
        file_url: input.file_url || null,
        file_size: input.file_size || null,
        cover_url: input.cover_url || null,
        rating: input.rating || 4.8,
        downloads_count: 0,
      };

      const { data, error } = await supabase.from('resources').insert(payload).select('*').single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return this.getResourceByIdOrSlug(data.id);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Update an existing resource.
   */
  async updateResource(id: string, input: Partial<CreateResourceInput>): Promise<ServiceResult<KnowledgeResource>> {
    try {
      const updates: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('resources').update(updates).eq('id', id);

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return this.getResourceByIdOrSlug(id);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Soft-delete a resource.
   */
  async deleteResource(id: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
