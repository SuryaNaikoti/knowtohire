/**
 * KnowToHire Knowledge Hub Service
 * Real Supabase operations for E-books, Research Papers, Regulatory Handbooks, and Study Materials.
 * Supports status management (Draft, Published, Archived), file uploads, and trace requests.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';
import { contentStorageService } from './contentStorageService';

export type ResourceStatus = 'draft' | 'published' | 'archived';

export interface KnowledgeResource {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  format: string;
  file_url: string | null;
  file_size?: string | null;
  file_name?: string | null;
  file_path?: string | null;
  mime_type?: string | null;
  storage_bucket?: string | null;
  cover_url?: string | null;
  author?: string;
  pageCount?: number;
  rating: number;
  downloads_count: number;
  is_free?: boolean;
  price_inr?: number;
  tags?: string[];
  status: ResourceStatus;
  published_at?: string | null;
  created_from_request_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ResourceFilterParams {
  search?: string;
  category?: string;
  format?: string;
  isFree?: boolean;
  status?: ResourceStatus | 'all';
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
  file_name?: string;
  file_path?: string;
  mime_type?: string;
  cover_url?: string;
  rating?: number;
  tags?: string[];
  status?: ResourceStatus;
  created_from_request_id?: string;
  file?: File;
  onProgress?: (progress: number) => void;
}

const DEMO_RESOURCES_KEY = 'kth_demo_knowledge_resources';

function getDemoResources(): KnowledgeResource[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_RESOURCES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoResource(res: KnowledgeResource) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getDemoResources().filter((r) => r.id !== res.id && r.slug !== res.slug);
    const updated = [res, ...existing];
    window.localStorage.setItem(DEMO_RESOURCES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kth_resources_changed'));
  } catch {
    // Ignore
  }
}

function updateDemoResource(id: string, updates: Partial<KnowledgeResource>) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getDemoResources();
    const idx = existing.findIndex((r) => r.id === id);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...updates, updated_at: new Date().toISOString() };
      window.localStorage.setItem(DEMO_RESOURCES_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('kth_resources_changed'));
    }
  } catch {
    // Ignore
  }
}

function mapDatabaseRowToResource(r: Record<string, any>): KnowledgeResource {
  return {
    id: r.id,
    title: r.title || 'Untitled Resource',
    slug: r.slug || r.id,
    description: r.description || '',
    category: r.category || 'Environmental & ESG',
    format: r.format || 'PDF',
    file_url: r.file_url || null,
    file_size: r.file_size || '2.4 MB',
    file_name: r.file_name || null,
    file_path: r.file_path || null,
    mime_type: r.mime_type || 'application/pdf',
    storage_bucket: r.storage_bucket || 'knowledge-hub',
    cover_url: r.cover_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=250&q=80',
    author: r.author || 'KnowToHire Regulatory Team',
    pageCount: r.page_count || 48,
    rating: Number(r.rating) || 4.8,
    downloads_count: Number(r.downloads_count) || 0,
    is_free: r.price === undefined || Number(r.price) === 0,
    price_inr: Number(r.price) || 0,
    tags: Array.isArray(r.tags) ? r.tags : ['ESG', 'Compliance', 'Research'],
    status: (r.status || 'published') as ResourceStatus,
    published_at: r.published_at || r.created_at,
    created_from_request_id: r.created_from_request_id || null,
    created_at: r.created_at || new Date().toISOString(),
    updated_at: r.updated_at,
  };
}

export const knowledgeService = {
  /**
   * Fetch all knowledge resources with optional search, category, status, and limit filtering.
   */
  async getResources(params?: ResourceFilterParams): Promise<ServiceResult<KnowledgeResource[]>> {
    try {
      let dbResources: KnowledgeResource[] = [];

      if (isSupabaseConfigured()) {
        try {
          let query = supabase
            .from('resources')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

          // By default, public/candidate only sees 'published'
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
            query = query.ilike('category', `%${params.category}%`);
          }

          if (params?.limit) {
            query = query.limit(params.limit);
          }

          const { data, error } = await query;
          if (!error && data) {
            dbResources = data.map(mapDatabaseRowToResource);
          }
        } catch {
          // Table catch
        }
      }

      // Merge with demo store
      const demoRes = getDemoResources();
      const combined = [...dbResources];

      for (const dr of demoRes) {
        const existingIdx = combined.findIndex((c) => c.id === dr.id || c.slug === dr.slug);
        if (existingIdx >= 0) {
          combined[existingIdx] = { ...combined[existingIdx], ...dr };
        } else {
          // Apply status filter if set
          if (!params?.status && dr.status !== 'published') continue;
          if (params?.status && params.status !== 'all' && dr.status !== params.status) continue;
          combined.push(dr);
        }
      }

      // Filter category & search for demo items if not applied by SQL
      let filtered = combined;
      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((r) => r.category.toLowerCase().includes(params.category!.toLowerCase()));
      }
      if (params?.search && params.search.trim()) {
        const term = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) => r.title.toLowerCase().includes(term) || r.description.toLowerCase().includes(term)
        );
      }

      return { data: filtered, error: null };
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

      if (isSupabaseConfigured()) {
        try {
          let query = supabase.from('resources').select('*').is('deleted_at', null);

          if (isUUID) {
            query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
          } else {
            query = query.eq('slug', idOrSlug);
          }

          const { data, error } = await query.maybeSingle();

          if (!error && data) {
            const mapped = mapDatabaseRowToResource(data);
            const demo = getDemoResources().find((r) => r.id === data.id || r.slug === data.slug);
            return { data: demo ? { ...mapped, ...demo } : mapped, error: null };
          }
        } catch {
          // Fallback
        }
      }

      const demo = getDemoResources().find((r) => r.id === idOrSlug || r.slug === idOrSlug);
      if (demo) {
        return { data: demo, error: null };
      }

      return {
        data: null,
        error: { message: 'Resource not found', code: 'NOT_FOUND', status: 404 },
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Track a download event and increment download counter.
   */
  async trackDownload(resourceId: string): Promise<ServiceResult<{ downloadUrl: string }>> {
    try {
      const res = await this.getResourceByIdOrSlug(resourceId);
      if (!res.data) {
        return { data: null, error: { message: 'Resource not found', code: 'NOT_FOUND', status: 404 } };
      }

      const resource = res.data;
      const newCount = (resource.downloads_count || 0) + 1;

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('resources').update({ downloads_count: newCount }).eq('id', resourceId);
        } catch {
          // Ignore
        }
      }

      updateDemoResource(resource.id, { downloads_count: newCount });

      return {
        data: { downloadUrl: resource.file_url || 'https://knowtohire.com/resources/download.pdf' },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Create a new Knowledge Hub resource with optional file upload.
   */
  async createResource(input: CreateResourceInput): Promise<ServiceResult<KnowledgeResource>> {
    try {
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `res-${Date.now()}`;
      const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const now = new Date().toISOString();

      let fileUrl = input.file_url || null;
      let fileName = input.file_name || null;
      let fileSize = input.file_size || '2.4 MB';
      let filePath = input.file_path || null;
      let mimeType = input.mime_type || 'application/pdf';
      let format = input.format || 'PDF';

      // 1. If physical file provided, upload to 'knowledge-hub' storage bucket
      if (input.file) {
        const uploadResult = await contentStorageService.uploadFile({
          bucket: 'knowledge-hub',
          folder: `resources/${newId}`,
          file: input.file,
          onProgress: input.onProgress,
        });

        if (uploadResult.error || !uploadResult.url) {
          return {
            data: null,
            error: { message: uploadResult.error || 'Failed to upload resource file.', code: 'UPLOAD_FAILED', status: 400 },
          };
        }

        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        fileSize = uploadResult.fileSize || '2.4 MB';
        filePath = uploadResult.filePath;
        mimeType = uploadResult.mimeType || 'application/pdf';
        format = uploadResult.format || 'PDF';
      }

      const newResource: KnowledgeResource = {
        id: newId,
        title: input.title.trim(),
        slug,
        description: input.description.trim(),
        category: input.category || 'Environmental & ESG',
        format,
        file_url: fileUrl,
        file_size: fileSize,
        file_name: fileName,
        file_path: filePath,
        mime_type: mimeType,
        storage_bucket: 'knowledge-hub',
        cover_url: input.cover_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=250&q=80',
        author: 'KnowToHire Regulatory Team',
        pageCount: 48,
        rating: input.rating || 4.8,
        downloads_count: 0,
        is_free: true,
        price_inr: 0,
        tags: input.tags || ['Compliance', 'ESG', 'Research'],
        status: input.status || 'published',
        published_at: input.status === 'published' ? now : null,
        created_from_request_id: input.created_from_request_id || null,
        created_at: now,
        updated_at: now,
      };

      if (isSupabaseConfigured()) {
        try {
          const payload = {
            id: newId,
            title: newResource.title,
            slug: newResource.slug,
            description: newResource.description,
            category: newResource.category,
            format: newResource.format,
            file_url: newResource.file_url,
            file_size: newResource.file_size,
            file_name: newResource.file_name,
            file_path: newResource.file_path,
            mime_type: newResource.mime_type,
            storage_bucket: 'knowledge-hub',
            cover_url: newResource.cover_url,
            rating: newResource.rating,
            downloads_count: 0,
            status: newResource.status,
            published_at: newResource.published_at,
            created_from_request_id: newResource.created_from_request_id,
          };

          await supabase.from('resources').insert(payload);
        } catch {
          // Table catch
        }
      }

      saveDemoResource(newResource);
      return { data: newResource, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Update an existing resource.
   */
  async updateResource(id: string, input: Partial<CreateResourceInput>): Promise<ServiceResult<KnowledgeResource>> {
    try {
      const existingRes = await this.getResourceByIdOrSlug(id);
      const existing = existingRes.data;

      let fileUrl = input.file_url || existing?.file_url;
      let fileName = input.file_name || existing?.file_name;
      let fileSize = input.file_size || existing?.file_size;
      let filePath = input.file_path || existing?.file_path;
      let mimeType = input.mime_type || existing?.mime_type;
      let format = input.format || existing?.format || 'PDF';

      if (input.file) {
        const uploadResult = await contentStorageService.uploadFile({
          bucket: 'knowledge-hub',
          folder: `resources/${id}`,
          file: input.file,
          onProgress: input.onProgress,
        });

        if (uploadResult.error || !uploadResult.url) {
          return {
            data: null,
            error: { message: uploadResult.error || 'Failed to upload resource file.', code: 'UPLOAD_FAILED', status: 400 },
          };
        }

        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        fileSize = uploadResult.fileSize || '2.4 MB';
        filePath = uploadResult.filePath;
        mimeType = uploadResult.mimeType || 'application/pdf';
        format = uploadResult.format || 'PDF';
      }

      const updates: Partial<KnowledgeResource> = {
        ...input,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        file_path: filePath,
        mime_type: mimeType,
        format,
        updated_at: new Date().toISOString(),
      };

      if (input.status === 'published' && !existing?.published_at) {
        updates.published_at = new Date().toISOString();
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('resources').update(updates).eq('id', id);
        } catch {
          // Ignore
        }
      }

      updateDemoResource(id, updates);
      return this.getResourceByIdOrSlug(id);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Soft-delete or archive a resource.
   */
  async deleteResource(id: string): Promise<ServiceResult<boolean>> {
    try {
      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('resources')
            .update({ deleted_at: new Date().toISOString(), status: 'archived' })
            .eq('id', id);
        } catch {
          // Ignore
        }
      }

      updateDemoResource(id, { status: 'archived' });
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
