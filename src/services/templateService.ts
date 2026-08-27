/**
 * KnowToHire Template Marketplace Service
 * Operations for ATS Resume Templates, EIA Contracts, ESG Audits, and Compliance Toolkits.
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

// Canonical Baseline Seed Templates for KnowToHire Template Marketplace
export const INITIAL_CANONICAL_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Executive ATS Resume — Sustainability & ESG Consultant',
    slug: 'executive-ats-resume-sustainability-esg-consultant',
    description: 'ATS-optimized resume and cover letter template tailored specifically for environmental, ESG, and sustainability professionals in India.',
    category: 'Resume & CV Templates',
    formats: ['DOCX', 'PDF'],
    cover_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&h=250&q=80',
    file_url: 'https://knowtohire.com/templates/sustainability_esg_ats_resume.docx',
    download_url: 'https://knowtohire.com/templates/sustainability_esg_ats_resume.docx',
    file_name: 'sustainability_esg_ats_resume.docx',
    file_path: 'templates/tmpl-1/sustainability_esg_ats_resume.docx',
    file_size: '1.4 MB',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    storage_bucket: 'templates',
    rating: 4.95,
    downloads_count: 8420,
    price_inr: 499,
    is_free: false,
    is_active: true,
    status: 'published',
    published_at: '2026-08-01T10:00:00.000Z',
    tags: ['ATS Resume', 'Sustainability', 'ESG Career', 'Cover Letter'],
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'tmpl-2',
    title: 'Environmental Impact Assessment (EIA) Consultancy Agreement',
    slug: 'eia-consultancy-master-services-agreement',
    description: 'Lawyer-vetted Master Services Agreement (MSA) for environmental consultants rendering EIA, clearance, and monitoring services in India.',
    category: 'Legal & Contracts',
    formats: ['DOCX', 'PDF'],
    cover_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&h=250&q=80',
    file_url: 'https://knowtohire.com/templates/eia_consultancy_agreement_template.docx',
    download_url: 'https://knowtohire.com/templates/eia_consultancy_agreement_template.docx',
    file_name: 'eia_consultancy_agreement_template.docx',
    file_path: 'templates/tmpl-2/eia_consultancy_agreement_template.docx',
    file_size: '2.1 MB',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    storage_bucket: 'templates',
    rating: 4.9,
    downloads_count: 4150,
    price_inr: 999,
    is_free: false,
    is_active: true,
    status: 'published',
    published_at: '2026-08-03T11:00:00.000Z',
    tags: ['EIA', 'Consultancy Contract', 'Legal MSA', 'MoEFCC Compliance'],
    created_at: '2026-08-03T11:00:00.000Z',
    updated_at: '2026-08-03T11:00:00.000Z',
  },
  {
    id: 'tmpl-3',
    title: 'Corporate ESG Compliance Audit Checklist & Scoring Matrix',
    slug: 'corporate-esg-compliance-audit-checklist',
    description: 'Ready-to-print audit matrix for internal compliance teams conducting quarterly ESG reviews across manufacturing and commercial plants.',
    category: 'Compliance Toolkits',
    formats: ['PDF', 'XLSX'],
    cover_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=250&q=80',
    file_url: 'https://knowtohire.com/templates/corporate_esg_audit_matrix_toolkit.xlsx',
    download_url: 'https://knowtohire.com/templates/corporate_esg_audit_matrix_toolkit.xlsx',
    file_name: 'corporate_esg_audit_matrix_toolkit.xlsx',
    file_path: 'templates/tmpl-3/corporate_esg_audit_matrix_toolkit.xlsx',
    file_size: '1.8 MB',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    storage_bucket: 'templates',
    rating: 4.98,
    downloads_count: 12600,
    price_inr: 0,
    is_free: true,
    is_active: true,
    status: 'published',
    published_at: '2026-08-05T09:00:00.000Z',
    tags: ['Audit Matrix', 'BRSR Scoring', 'ISO 14001', 'Free Toolkit'],
    created_at: '2026-08-05T09:00:00.000Z',
    updated_at: '2026-08-05T09:00:00.000Z',
  },
  {
    id: 'tmpl-4',
    title: 'Independent Patent Research & Prior Art Search Contract',
    slug: 'patent-research-consultant-agreement',
    description: 'Standard NDA and freelance research service agreement protecting proprietary patent prior art searches and technical disclosures.',
    category: 'Legal & Contracts',
    formats: ['DOCX', 'PDF'],
    cover_url: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=400&h=250&q=80',
    file_url: 'https://knowtohire.com/templates/patent_research_consultant_contract.docx',
    download_url: 'https://knowtohire.com/templates/patent_research_consultant_contract.docx',
    file_name: 'patent_research_consultant_contract.docx',
    file_path: 'templates/tmpl-4/patent_research_consultant_contract.docx',
    file_size: '1.6 MB',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    storage_bucket: 'templates',
    rating: 4.88,
    downloads_count: 5900,
    price_inr: 799,
    is_free: false,
    is_active: true,
    status: 'published',
    published_at: '2026-08-07T14:00:00.000Z',
    tags: ['Patent Law', 'IP Agreement', 'NDA', 'Prior Art Search'],
    created_at: '2026-08-07T14:00:00.000Z',
    updated_at: '2026-08-07T14:00:00.000Z',
  },
  {
    id: 'tmpl-5',
    title: 'Chief Sustainability Officer (CSO) Executive Bio & Deck',
    slug: 'cso-executive-bio-portfolio-deck',
    description: 'Executive board-level presentation deck and strategic CV format for C-suite sustainability and climate leadership roles.',
    category: 'Professional Documents',
    formats: ['PPTX', 'PDF'],
    cover_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&h=250&q=80',
    file_url: 'https://knowtohire.com/templates/cso_executive_bio_presentation.pptx',
    download_url: 'https://knowtohire.com/templates/cso_executive_bio_presentation.pptx',
    file_name: 'cso_executive_bio_presentation.pptx',
    file_path: 'templates/tmpl-5/cso_executive_bio_presentation.pptx',
    file_size: '4.5 MB',
    mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    storage_bucket: 'templates',
    rating: 4.92,
    downloads_count: 3200,
    price_inr: 1299,
    is_free: false,
    is_active: true,
    status: 'published',
    published_at: '2026-08-10T12:00:00.000Z',
    tags: ['CSO Bio', 'Executive Deck', 'Board Level', 'Climate Leadership'],
    created_at: '2026-08-10T12:00:00.000Z',
    updated_at: '2026-08-10T12:00:00.000Z',
  },
  {
    id: 'tmpl-6',
    title: 'SEBI BRSR Core Readiness & Assurance Workflow Guide',
    slug: 'sebi-brsr-core-readiness-workflow-guide',
    description: 'Comprehensive step-by-step readiness toolkit for top 1000 listed Indian entities adhering to SEBI BRSR Core mandates.',
    category: 'Compliance Toolkits',
    formats: ['PDF', 'DOCX'],
    cover_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=250&q=80',
    file_url: 'https://knowtohire.com/templates/sebi_brsr_readiness_toolkit.pdf',
    download_url: 'https://knowtohire.com/templates/sebi_brsr_readiness_toolkit.pdf',
    file_name: 'sebi_brsr_readiness_toolkit.pdf',
    file_path: 'templates/tmpl-6/sebi_brsr_readiness_toolkit.pdf',
    file_size: '3.1 MB',
    mime_type: 'application/pdf',
    storage_bucket: 'templates',
    rating: 4.96,
    downloads_count: 9800,
    price_inr: 0,
    is_free: true,
    is_active: true,
    status: 'published',
    published_at: '2026-08-12T15:00:00.000Z',
    tags: ['SEBI BRSR', 'Assurance', 'Free Toolkit', 'ESG Reporting'],
    created_at: '2026-08-12T15:00:00.000Z',
    updated_at: '2026-08-12T15:00:00.000Z',
  },
];

let inMemoryDemoTemplates: MarketplaceTemplate[] = [];

function getDemoTemplates(): MarketplaceTemplate[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(DEMO_TEMPLATES_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
  }
  return inMemoryDemoTemplates;
}

function saveDemoTemplate(tmpl: MarketplaceTemplate) {
  const existing = getDemoTemplates().filter((t) => t.id !== tmpl.id && t.slug !== tmpl.slug);
  inMemoryDemoTemplates = [tmpl, ...existing];

  if (typeof window !== 'undefined') {
    if (window.localStorage) {
      try {
        window.localStorage.setItem(DEMO_TEMPLATES_KEY, JSON.stringify(inMemoryDemoTemplates));
      } catch {
        // Ignore
      }
    }
    window.dispatchEvent(new CustomEvent('kth_templates_changed'));
  }
}

function updateDemoTemplate(id: string, updates: Partial<MarketplaceTemplate>) {
  let existing = [...getDemoTemplates()];
  if (existing.length === 0) {
    existing = [...INITIAL_CANONICAL_TEMPLATES];
  }
  const idx = existing.findIndex((t) => t.id === id || t.slug === id);
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...updates, updated_at: new Date().toISOString() };
    inMemoryDemoTemplates = existing;

    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        try {
          window.localStorage.setItem(DEMO_TEMPLATES_KEY, JSON.stringify(existing));
        } catch {
          // Ignore
        }
      }
      window.dispatchEvent(new CustomEvent('kth_templates_changed'));
    }
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
            .order('created_at', { ascending: false });

          if (params?.status && params.status !== 'all') {
            query = query.eq('status', params.status);
          } else if (!params?.status) {
            query = query.eq('status', 'published').eq('is_active', true);
          }

          if (params?.search && params.search.trim()) {
            const term = params.search.trim();
            query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
          }

          if (params?.category && params.category !== 'all') {
            query = query.ilike('category', `%${params.category}%`);
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

      // Base templates from db or fallback seed
      let baseList: MarketplaceTemplate[] = dbTemplates.length > 0 ? dbTemplates : [...INITIAL_CANONICAL_TEMPLATES];

      // Merge with localStorage overrides
      const demoTmpls = getDemoTemplates();
      const combined = [...baseList];

      for (const dt of demoTmpls) {
        const existingIdx = combined.findIndex((c) => c.id === dt.id || c.slug === dt.slug);
        if (existingIdx >= 0) {
          combined[existingIdx] = { ...combined[existingIdx], ...dt };
        } else {
          combined.unshift(dt);
        }
      }

      let filtered = combined;

      // Status Filtering
      const targetStatus = params?.status || 'published';
      if (targetStatus !== 'all') {
        filtered = filtered.filter((t) => t.status === targetStatus && (targetStatus !== 'published' || t.is_active));
      }

      // Category Filtering
      if (params?.category && params.category !== 'all') {
        const cat = params.category.toLowerCase();
        filtered = filtered.filter((t) => t.category.toLowerCase().includes(cat) || t.title.toLowerCase().includes(cat));
      }

      // Search Query Filtering
      if (params?.search && params.search.trim()) {
        const term = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(term) ||
            t.description.toLowerCase().includes(term) ||
            t.category.toLowerCase().includes(term) ||
            (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(term)))
        );
      }

      // Free / Paid Filtering
      if (params?.isFree !== undefined) {
        filtered = filtered.filter((t) => (params.isFree ? t.is_free : !t.is_free));
      }

      // Limit
      if (params?.limit && params.limit > 0) {
        filtered = filtered.slice(0, params.limit);
      }

      return { data: filtered, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single template by ID or Slug with optional published-only enforcement.
   */
  async getTemplateByIdOrSlug(
    idOrSlug: string,
    options?: { requirePublished?: boolean }
  ): Promise<ServiceResult<MarketplaceTemplate>> {
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

          if (options?.requirePublished) {
            query = query.eq('status', 'published').eq('is_active', true);
          }

          const { data, error } = await query.maybeSingle();

          if (!error && data) {
            const mapped = mapDatabaseRowToTemplate(data);
            const demo = getDemoTemplates().find((t) => t.id === data.id || t.slug === data.slug);
            const finalTmpl = demo ? { ...mapped, ...demo } : mapped;
            if (options?.requirePublished && (finalTmpl.status !== 'published' || !finalTmpl.is_active)) {
              return { data: null, error: { message: 'Template not available or unpublished.', code: 'NOT_FOUND', status: 404 } };
            }
            return { data: finalTmpl, error: null };
          }
        } catch {
          // Fallback
        }
      }

      // Fallback search in demo store + canonical seed
      const allTmpls = [...getDemoTemplates(), ...INITIAL_CANONICAL_TEMPLATES];
      const match = allTmpls.find((t) => t.id === idOrSlug || t.slug === idOrSlug);

      if (match) {
        if (options?.requirePublished && (match.status !== 'published' || !match.is_active)) {
          return {
            data: null,
            error: { message: 'Template not available or unpublished.', code: 'NOT_FOUND', status: 404 },
          };
        }
        return { data: match, error: null };
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
   * Fetch a single published template by Slug (Public marketplace).
   */
  async getTemplateBySlug(slug: string): Promise<ServiceResult<MarketplaceTemplate>> {
    return this.getTemplateByIdOrSlug(slug, { requirePublished: true });
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
   * Admin: Create new template with file upload and status handling.
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
        is_active: input.status !== 'archived',
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
            is_active: newTemplate.is_active,
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
        is_free: input.price_inr !== undefined ? input.price_inr === 0 : existing?.is_free,
        is_active: input.status ? input.status !== 'archived' : existing?.is_active,
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
   * Admin: Update template status directly (published, draft, archived).
   */
  async updateTemplateStatus(id: string, status: TemplateStatus): Promise<ServiceResult<boolean>> {
    try {
      const updates = {
        status,
        is_active: status !== 'archived',
        published_at: status === 'published' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('templates').update(updates).eq('id', id);
        } catch {
          // Ignore
        }
      }

      updateDemoTemplate(id, updates);
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Soft-delete or archive a template.
   */
  async deleteTemplate(id: string): Promise<ServiceResult<boolean>> {
    try {
      return this.updateTemplateStatus(id, 'archived');
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Archive a template.
   */
  async archiveTemplate(id: string): Promise<ServiceResult<boolean>> {
    return this.updateTemplateStatus(id, 'archived');
  },
};
