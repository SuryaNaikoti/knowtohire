/**
 * KnowToHire Template Marketplace Service
 * Real Supabase operations for ATS Resume Templates, EIA Contracts, ESG Audits, and Compliance Toolkits.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export interface MarketplaceTemplate {
  id: string;
  creator_id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  formats: string[];
  cover_url?: string | null;
  file_url?: string | null;
  rating: number;
  downloads_count: number;
  price_inr: number;
  is_free: boolean;
  is_active: boolean;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface TemplateFilterParams {
  search?: string;
  category?: string;
  isFree?: boolean;
  limit?: number;
}

export interface CreateTemplateInput {
  title: string;
  slug?: string;
  description: string;
  category?: string;
  formats?: string[];
  price_inr?: number;
  cover_url?: string;
  file_url?: string;
}

export const templateService = {
  /**
   * Fetch all marketplace templates.
   */
  async getTemplates(params?: TemplateFilterParams): Promise<ServiceResult<MarketplaceTemplate[]>> {
    try {
      let query = supabase
        .from('templates')
        .select('*')
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (params?.search && params.search.trim()) {
        const term = params.search.trim();
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
      }

      if (params?.category && params.category !== 'all') {
        query = query.ilike('title', `%${params.category}%`);
      }

      if (params?.isFree !== undefined) {
        if (params.isFree) {
          query = query.eq('price', 0);
        } else {
          query = query.gt('price', 0);
        }
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const normalized: MarketplaceTemplate[] = (data || []).map((t) => ({
        id: t.id,
        creator_id: t.creator_id,
        title: t.title || 'Untitled Template',
        slug: t.slug || t.id,
        description: t.description || '',
        category: t.category || 'Professional Documents',
        formats: Array.isArray(t.formats) && t.formats.length > 0 ? t.formats : ['DOCX', 'PDF'],
        cover_url: t.cover_url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&h=250&q=80',
        file_url: t.file_url || t.download_url,
        rating: Number(t.rating) || 4.9,
        downloads_count: Number(t.downloads_count) || 0,
        price_inr: Number(t.price) || 0,
        is_free: Number(t.price || 0) === 0,
        is_active: t.is_active !== false,
        tags: ['ATS Resume', 'Legal', 'ESG'],
        created_at: t.created_at || new Date().toISOString(),
        updated_at: t.updated_at,
      }));

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single template by ID or Slug.
   */
  async getTemplateByIdOrSlug(idOrSlug: string): Promise<ServiceResult<MarketplaceTemplate>> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      let query = supabase.from('templates').select('*').is('deleted_at', null);

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
          error: { message: 'Template not found', code: 'NOT_FOUND', status: 404 },
        };
      }

      const normalized: MarketplaceTemplate = {
        id: data.id,
        creator_id: data.creator_id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category || 'Professional Documents',
        formats: Array.isArray(data.formats) && data.formats.length > 0 ? data.formats : ['DOCX', 'PDF'],
        cover_url: data.cover_url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&h=250&q=80',
        file_url: data.file_url || data.download_url,
        rating: Number(data.rating) || 4.9,
        downloads_count: Number(data.downloads_count) || 0,
        price_inr: Number(data.price) || 0,
        is_free: Number(data.price || 0) === 0,
        is_active: data.is_active !== false,
        tags: ['ATS Resume', 'Legal', 'ESG'],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Track template download / acquisition.
   */
  async trackDownload(templateId: string): Promise<ServiceResult<{ downloadUrl: string }>> {
    try {
      const { data: tmpl, error } = await supabase
        .from('templates')
        .select('id, file_url, download_url, downloads_count')
        .eq('id', templateId)
        .single();

      if (error || !tmpl) {
        return { data: null, error: { message: 'Template not found', code: 'NOT_FOUND', status: 404 } };
      }

      const newCount = (tmpl.downloads_count || 0) + 1;
      await supabase.from('templates').update({ downloads_count: newCount }).eq('id', templateId);

      return {
        data: { downloadUrl: tmpl.file_url || tmpl.download_url || 'https://knowtohire.com/templates/download.docx' },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Create new template.
   */
  async createTemplate(input: CreateTemplateInput): Promise<ServiceResult<MarketplaceTemplate>> {
    try {
      const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = {
        title: input.title.trim(),
        slug,
        description: input.description.trim(),
        price: input.price_inr || 0,
        formats: input.formats || ['DOCX', 'PDF'],
        cover_url: input.cover_url || null,
        file_url: input.file_url || null,
        rating: 4.9,
        downloads_count: 0,
        is_active: true,
      };

      const { data, error } = await supabase.from('templates').insert(payload).select('*').single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return this.getTemplateByIdOrSlug(data.id);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Update template.
   */
  async updateTemplate(id: string, input: Partial<CreateTemplateInput>): Promise<ServiceResult<MarketplaceTemplate>> {
    try {
      const updates: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
      };
      if (input.price_inr !== undefined) {
        updates.price = input.price_inr;
      }

      const { error } = await supabase.from('templates').update(updates).eq('id', id);

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return this.getTemplateByIdOrSlug(id);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Soft-delete template.
   */
  async deleteTemplate(id: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('templates')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
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
