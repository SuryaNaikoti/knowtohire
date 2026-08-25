/**
 * KnowToHire Template Marketplace Service
 * Real Supabase operations for ATS Resume Templates, EIA Contracts, ESG Audits, and Compliance Toolkits.
 * Supports status management (Draft, Published, Archived) and file uploads to Supabase Storage.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';
import { contentStorageService } from './contentStorageService';

export type TemplateStatus = 'draft' | 'published' | 'archived';

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
  download_url?: string | null;
  file_name?: string | null;
  file_path?: string | null;
  file_size?: string | null;
  mime_type?: string | null;
  storage_bucket?: string | null;
  rating: number;
  downloads_count: number;
  price_inr: number;
  is_free: boolean;
  is_active: boolean;
  status: TemplateStatus;
  published_at?: string | null;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface TemplateFilterParams {
  search?: string;
  category?: string;
  isFree?: boolean;
  status?: TemplateStatus | 'all';
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
  file_name?: string;
  file_path?: string;
  file_size?: string;
  mime_type?: string;
  status?: TemplateStatus;
  file?: File;
  onProgress?: (progress: number) => void;
}

const DEMO_TEMPLATES_KEY = 'kth_demo_marketplace_templates';

function getDemoTemplates(): MarketplaceTemplate[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoTemplate(tmpl: MarketplaceTemplate) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getDemoTemplates().filter((t) => t.id !== tmpl.id && t.slug !== tmpl.slug);
    const updated = [tmpl, ...existing];
    window.localStorage.setItem(DEMO_TEMPLATES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kth_templates_changed'));
  } catch {
    // Ignore
  }
}

function updateDemoTemplate(id: string, updates: Partial<MarketplaceTemplate>) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getDemoTemplates();
    const idx = existing.findIndex((t) => t.id === id);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...updates, updated_at: new Date().toISOString() };
      window.localStorage.setItem(DEMO_TEMPLATES_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('kth_templates_changed'));
    }
  } catch {
    // Ignore
  }
}

function mapDatabaseRowToTemplate(t: Record<string, any>): MarketplaceTemplate {
  return {
    id: t.id,
    creator_id: t.creator_id,
    title: t.title || 'Untitled Template',
    slug: t.slug || t.id,
    description: t.description || '',
    category: t.category || 'Professional Documents',
    formats: Array.isArray(t.formats) && t.formats.length > 0 ? t.formats : ['DOCX', 'PDF'],
    cover_url: t.cover_url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&h=250&q=80',
    file_url: t.file_url || t.download_url || null,
    download_url: t.download_url || t.file_url || null,
    file_name: t.file_name || null,
    file_path: t.file_path || null,
    file_size: t.file_size || '1.8 MB',
    mime_type: t.mime_type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    storage_bucket: t.storage_bucket || 'templates',
    rating: Number(t.rating) || 4.9,
    downloads_count: Number(t.downloads_count) || 0,
    price_inr: Number(t.price) || 0,
    is_free: Number(t.price || 0) === 0,
    is_active: t.is_active !== false,
    status: (t.status || 'published') as TemplateStatus,
    published_at: t.published_at || t.created_at,
    tags: Array.isArray(t.tags) ? t.tags : ['ATS Resume', 'Legal', 'ESG'],
    created_at: t.created_at || new Date().toISOString(),
    updated_at: t.updated_at,
  };
}

export const templateService = {
  /**
   * Fetch all marketplace templates with search, category, free/paid, and status filter.
   */
  async getTemplates(params?: TemplateFilterParams): Promise<ServiceResult<MarketplaceTemplate[]>> {
    try {
      let dbTemplates: MarketplaceTemplate[] = [];

      if (isSupabaseConfigured()) {
        try {
          let query = supabase
            .from('templates')
            .select('*')
            .is('deleted_at', null)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (params?.status && params.status !== 'all') {
            query = query.eq('status', params.status);
          } else if (!params?.status) {
            query = query.eq('status', 'published');
          }

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
          if (!error && data) {
            dbTemplates = data.map(mapDatabaseRowToTemplate);
          }
        } catch {
          // Table catch
        }
      }

      // Merge with demo store
      const demoTmpls = getDemoTemplates();
      const combined = [...dbTemplates];

      for (const dt of demoTmpls) {
        const existingIdx = combined.findIndex((c) => c.id === dt.id || c.slug === dt.slug);
        if (existingIdx >= 0) {
          combined[existingIdx] = { ...combined[existingIdx], ...dt };
        } else {
          if (!params?.status && dt.status !== 'published') continue;
          if (params?.status && params.status !== 'all' && dt.status !== params.status) continue;
          combined.push(dt);
        }
      }

      let filtered = combined;
      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((t) => t.category.toLowerCase().includes(params.category!.toLowerCase()));
      }
      if (params?.search && params.search.trim()) {
        const term = params.search.toLowerCase();
        filtered = filtered.filter(
          (t) => t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)
        );
      }
      if (params?.isFree !== undefined) {
        filtered = filtered.filter((t) => (params.isFree ? t.is_free : !t.is_free));
      }

      return { data: filtered, error: null };
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

      if (isSupabaseConfigured()) {
        try {
          let query = supabase.from('templates').select('*').is('deleted_at', null);

          if (isUUID) {
            query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
          } else {
            query = query.eq('slug', idOrSlug);
          }

          const { data, error } = await query.maybeSingle();

          if (!error && data) {
            const mapped = mapDatabaseRowToTemplate(data);
            const demo = getDemoTemplates().find((t) => t.id === data.id || t.slug === data.slug);
            return { data: demo ? { ...mapped, ...demo } : mapped, error: null };
          }
        } catch {
          // Fallback
        }
      }

      const demo = getDemoTemplates().find((t) => t.id === idOrSlug || t.slug === idOrSlug);
      if (demo) {
        return { data: demo, error: null };
      }

      return {
        data: null,
        error: { message: 'Template not found', code: 'NOT_FOUND', status: 404 },
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Track template download / acquisition.
   */
  async trackDownload(templateId: string): Promise<ServiceResult<{ downloadUrl: string }>> {
    try {
      const res = await this.getTemplateByIdOrSlug(templateId);
      if (!res.data) {
        return { data: null, error: { message: 'Template not found', code: 'NOT_FOUND', status: 404 } };
      }

      const tmpl = res.data;
      const newCount = (tmpl.downloads_count || 0) + 1;

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('templates').update({ downloads_count: newCount }).eq('id', templateId);
        } catch {
          // Ignore
        }
      }

      updateDemoTemplate(tmpl.id, { downloads_count: newCount });

      return {
        data: { downloadUrl: tmpl.file_url || tmpl.download_url || 'https://knowtohire.com/templates/download.docx' },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Create new template with file upload.
   */
  async createTemplate(input: CreateTemplateInput): Promise<ServiceResult<MarketplaceTemplate>> {
    try {
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tmpl-${Date.now()}`;
      const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const now = new Date().toISOString();

      let fileUrl = input.file_url || null;
      let fileName = input.file_name || null;
      let fileSize = input.file_size || '1.8 MB';
      let filePath = input.file_path || null;
      let mimeType = input.mime_type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      let formats = input.formats || ['DOCX', 'PDF'];

      if (input.file) {
        const uploadResult = await contentStorageService.uploadFile({
          bucket: 'templates',
          folder: `templates/${newId}`,
          file: input.file,
          onProgress: input.onProgress,
        });

        if (uploadResult.error || !uploadResult.url) {
          return {
            data: null,
            error: { message: uploadResult.error || 'Failed to upload template file.', code: 'UPLOAD_FAILED', status: 400 },
          };
        }

        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        fileSize = uploadResult.fileSize || '1.8 MB';
        filePath = uploadResult.filePath;
        mimeType = uploadResult.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        formats = [uploadResult.format || 'DOCX'];
      }

      const newTemplate: MarketplaceTemplate = {
        id: newId,
        title: input.title.trim(),
        slug,
        description: input.description.trim(),
        category: input.category || 'Professional Documents',
        formats,
        cover_url: input.cover_url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&h=250&q=80',
        file_url: fileUrl,
        download_url: fileUrl,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        storage_bucket: 'templates',
        rating: 4.9,
        downloads_count: 0,
        price_inr: input.price_inr || 0,
        is_free: !input.price_inr || input.price_inr === 0,
        is_active: true,
        status: input.status || 'published',
        published_at: input.status === 'published' ? now : null,
        tags: ['ATS Resume', 'Legal', 'ESG'],
        created_at: now,
        updated_at: now,
      };

      if (isSupabaseConfigured()) {
        try {
          const payload = {
            id: newId,
            title: newTemplate.title,
            slug: newTemplate.slug,
            description: newTemplate.description,
            category: newTemplate.category,
            formats: newTemplate.formats,
            price: newTemplate.price_inr,
            cover_url: newTemplate.cover_url,
            file_url: newTemplate.file_url,
            download_url: newTemplate.download_url,
            file_name: newTemplate.file_name,
            file_path: newTemplate.file_path,
            file_size: newTemplate.file_size,
            mime_type: newTemplate.mime_type,
            storage_bucket: 'templates',
            status: newTemplate.status,
            published_at: newTemplate.published_at,
          };

          await supabase.from('templates').insert(payload);
        } catch {
          // Table catch
        }
      }

      saveDemoTemplate(newTemplate);
      return { data: newTemplate, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Update an existing template.
   */
  async updateTemplate(id: string, input: Partial<CreateTemplateInput>): Promise<ServiceResult<MarketplaceTemplate>> {
    try {
      const existingRes = await this.getTemplateByIdOrSlug(id);
      const existing = existingRes.data;

      let fileUrl = input.file_url || existing?.file_url;
      let fileName = input.file_name || existing?.file_name;
      let fileSize = input.file_size || existing?.file_size;
      let filePath = input.file_path || existing?.file_path;
      let mimeType = input.mime_type || existing?.mime_type;
      let formats = input.formats || existing?.formats || ['DOCX', 'PDF'];

      if (input.file) {
        const uploadResult = await contentStorageService.uploadFile({
          bucket: 'templates',
          folder: `templates/${id}`,
          file: input.file,
          onProgress: input.onProgress,
        });

        if (uploadResult.error || !uploadResult.url) {
          return {
            data: null,
            error: { message: uploadResult.error || 'Failed to upload template file.', code: 'UPLOAD_FAILED', status: 400 },
          };
        }

        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        fileSize = uploadResult.fileSize || '1.8 MB';
        filePath = uploadResult.filePath;
        mimeType = uploadResult.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        formats = [uploadResult.format || 'DOCX'];
      }

      const updates: Partial<MarketplaceTemplate> = {
        ...input,
        file_url: fileUrl,
        download_url: fileUrl,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        formats,
        updated_at: new Date().toISOString(),
      };

      if (input.status === 'published' && !existing?.published_at) {
        updates.published_at = new Date().toISOString();
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('templates').update(updates).eq('id', id);
        } catch {
          // Ignore
        }
      }

      updateDemoTemplate(id, updates);
      return this.getTemplateByIdOrSlug(id);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Soft-delete or archive a template.
   */
  async deleteTemplate(id: string): Promise<ServiceResult<boolean>> {
    try {
      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('templates')
            .update({ deleted_at: new Date().toISOString(), status: 'archived', is_active: false })
            .eq('id', id);
        } catch {
          // Ignore
        }
      }

      updateDemoTemplate(id, { status: 'archived', is_active: false });
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
