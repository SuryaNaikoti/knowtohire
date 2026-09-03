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
  creator_id?: string;
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

const INITIAL_CANONICAL_RESOURCES: KnowledgeResource[] = [
  {
    id: 'res-tech-1',
    title: 'Kubernetes & Cloud Infrastructure Best Practices',
    slug: 'kubernetes-cloud-infrastructure-best-practices',
    description: 'Container orchestration, Kubernetes ingress controllers, zero-downtime rolling updates, and microservices clustering.',
    category: 'Technology',
    format: 'PDF',
    file_url: 'https://knowtohire.com/resources/kubernetes_infrastructure_guide.pdf',
    file_size: '3.8 MB',
    file_name: 'kubernetes_infrastructure_guide.pdf',
    file_path: 'resources/res-tech-1/kubernetes_infrastructure_guide.pdf',
    mime_type: 'application/pdf',
    storage_bucket: 'knowledge-hub',
    cover_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=400&h=250&q=80',
    author: 'KnowToHire Cloud Engineering Desk',
    pageCount: 120,
    rating: 4.9,
    downloads_count: 21400,
    is_free: true,
    price_inr: 0,
    tags: ['Kubernetes', 'Cloud Infrastructure', 'Docker', 'DevOps'],
    status: 'published',
    published_at: '2026-08-01T10:00:00.000Z',
    created_from_request_id: null,
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'res-tech-2',
    title: 'Infrastructure as Code with Terraform & AWS',
    slug: 'infrastructure-as-code-terraform-aws',
    description: 'Declarative cloud provisioning, state management, security groups, and automated pipeline deployments with Terraform.',
    category: 'Technology',
    format: 'PDF',
    file_url: 'https://knowtohire.com/resources/terraform_aws_iac_handbook.pdf',
    file_size: '2.9 MB',
    file_name: 'terraform_aws_iac_handbook.pdf',
    file_path: 'resources/res-tech-2/terraform_aws_iac_handbook.pdf',
    mime_type: 'application/pdf',
    storage_bucket: 'knowledge-hub',
    cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&h=250&q=80',
    author: 'DevOps & Cloud Architecture Team',
    pageCount: 85,
    rating: 4.8,
    downloads_count: 15100,
    is_free: true,
    price_inr: 0,
    tags: ['Terraform', 'AWS', 'Infrastructure as Code', 'Cloud Security'],
    status: 'published',
    published_at: '2026-08-05T12:00:00.000Z',
    created_from_request_id: null,
    created_at: '2026-08-05T12:00:00.000Z',
    updated_at: '2026-08-05T12:00:00.000Z',
  },
  {
    id: 'res-tech-3',
    title: 'Enterprise System Architecture & Microservices Design',
    slug: 'enterprise-system-architecture-microservices-design',
    description: 'High-throughput microservices architecture, event-driven systems, fault tolerance, and domain-driven design patterns.',
    category: 'Technology',
    format: 'PDF',
    file_url: 'https://knowtohire.com/resources/enterprise_microservices_architecture.pdf',
    file_size: '4.2 MB',
    file_name: 'enterprise_microservices_architecture.pdf',
    file_path: 'resources/res-tech-3/enterprise_microservices_architecture.pdf',
    mime_type: 'application/pdf',
    storage_bucket: 'knowledge-hub',
    cover_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&h=250&q=80',
    author: 'KnowToHire Architecture Review Board',
    pageCount: 110,
    rating: 4.9,
    downloads_count: 18300,
    is_free: true,
    price_inr: 0,
    tags: ['System Architecture', 'Microservices', 'Distributed Systems', 'API Architecture'],
    status: 'published',
    published_at: '2026-08-10T14:30:00.000Z',
    created_from_request_id: null,
    created_at: '2026-08-10T14:30:00.000Z',
    updated_at: '2026-08-10T14:30:00.000Z',
  },
  {
    id: 'res-1',
    title: 'Environmental Compliance Calendar & SPCB Guide 2026',
    slug: 'environmental-compliance-calendar-spcb-guide-2026',
    description: 'A comprehensive regulatory roadmap covering monthly, quarterly, and annual SPCB & MoEFCC filing deadlines across all Indian states.',
    category: 'Environmental & ESG',
    format: 'PDF',
    file_url: 'https://knowtohire.com/resources/environmental_compliance_calendar_2026.pdf',
    file_size: '4.6 MB',
    file_name: 'environmental_compliance_calendar_2026.pdf',
    file_path: 'resources/res-1/environmental_compliance_calendar_2026.pdf',
    mime_type: 'application/pdf',
    storage_bucket: 'knowledge-hub',
    cover_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&h=250&q=80',
    author: 'KnowToHire Legal & Environmental Desk',
    pageCount: 140,
    rating: 4.9,
    downloads_count: 14200,
    is_free: true,
    price_inr: 0,
    tags: ['SPCB Compliance', 'CTE/CTO Renewal', 'Hazardous Waste Rules', 'BRSR Framework'],
    status: 'published',
    published_at: '2026-08-12T09:15:00.000Z',
    created_from_request_id: null,
    created_at: '2026-08-12T09:15:00.000Z',
    updated_at: '2026-08-12T09:15:00.000Z',
  },
  {
    id: 'res-2',
    title: 'Patent Filing & IPR Guide for Tech Startups',
    slug: 'patent-filing-ipr-guide-tech-startups',
    description: 'Step-by-step guide to navigating the Indian Patent Office, expedited examination for startups, and international PCT applications.',
    category: 'Patent & IPR',
    format: 'PDF',
    file_url: 'https://knowtohire.com/resources/patent_filing_ipr_startups.pdf',
    file_size: '3.1 MB',
    file_name: 'patent_filing_ipr_startups.pdf',
    file_path: 'resources/res-2/patent_filing_ipr_startups.pdf',
    mime_type: 'application/pdf',
    storage_bucket: 'knowledge-hub',
    cover_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&h=250&q=80',
    author: 'Dr. R. Sharma, Patent Attorney',
    pageCount: 95,
    rating: 4.8,
    downloads_count: 9800,
    is_free: false,
    price_inr: 499,
    tags: ['Indian Patent Act', 'Prior Art Search', 'Patentability Criteria', 'IP Licensing'],
    status: 'published',
    published_at: '2026-08-14T11:45:00.000Z',
    created_from_request_id: null,
    created_at: '2026-08-14T11:45:00.000Z',
    updated_at: '2026-08-14T11:45:00.000Z',
  },
  {
    id: 'res-3',
    title: 'SEBI BRSR Core & ESG Reporting Handbook',
    slug: 'sebi-brsr-core-esg-reporting-handbook',
    description: 'Complete analysis of SEBI BRSR mandatory disclosure indicators for India top 1000 listed companies.',
    category: 'Sustainability',
    format: 'PDF',
    file_url: 'https://knowtohire.com/resources/sebi_brsr_reporting_handbook.pdf',
    file_size: '3.4 MB',
    file_name: 'sebi_brsr_reporting_handbook.pdf',
    file_path: 'resources/res-3/sebi_brsr_reporting_handbook.pdf',
    mime_type: 'application/pdf',
    storage_bucket: 'knowledge-hub',
    cover_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=250&q=80',
    author: 'KnowToHire Intelligence Team',
    pageCount: 110,
    rating: 4.9,
    downloads_count: 18500,
    is_free: true,
    price_inr: 0,
    tags: ['SEBI BRSR', 'Scope 1 & 2 Emissions', 'Supply Chain ESG', 'Assurance Metrics'],
    status: 'published',
    published_at: '2026-08-16T16:00:00.000Z',
    created_from_request_id: null,
    created_at: '2026-08-16T16:00:00.000Z',
    updated_at: '2026-08-16T16:00:00.000Z',
  },
  {
    id: 'res-4',
    title: 'Industrial Sustainability Audit Protocol',
    slug: 'industrial-sustainability-audit-protocol',
    description: 'Field inspection checklists and quantitative audit methodology for industrial energy, water, and effluent compliance.',
    category: 'Environmental & ESG',
    format: 'PDF',
    file_url: 'https://knowtohire.com/resources/industrial_sustainability_audit_protocol.pdf',
    file_size: '2.7 MB',
    file_name: 'industrial_sustainability_audit_protocol.pdf',
    file_path: 'resources/res-4/industrial_sustainability_audit_protocol.pdf',
    mime_type: 'application/pdf',
    storage_bucket: 'knowledge-hub',
    cover_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&h=250&q=80',
    author: 'Indian Energy & Environmental Institute',
    pageCount: 88,
    rating: 4.7,
    downloads_count: 6200,
    is_free: false,
    price_inr: 799,
    tags: ['Energy Audit', 'Water Balance', 'ETP Compliance', 'ISO 50001'],
    status: 'published',
    published_at: '2026-08-18T08:30:00.000Z',
    created_from_request_id: null,
    created_at: '2026-08-18T08:30:00.000Z',
    updated_at: '2026-08-18T08:30:00.000Z',
  },
];

let memoryDemoResources: KnowledgeResource[] = [...INITIAL_CANONICAL_RESOURCES];

function getDemoResources(): KnowledgeResource[] {
  if (typeof window === 'undefined' || !window.localStorage) return memoryDemoResources;
  try {
    const raw = window.localStorage.getItem(DEMO_RESOURCES_KEY);
    if (!raw) {
      window.localStorage.setItem(DEMO_RESOURCES_KEY, JSON.stringify(INITIAL_CANONICAL_RESOURCES));
      return INITIAL_CANONICAL_RESOURCES;
    }
    return JSON.parse(raw);
  } catch {
    return memoryDemoResources;
  }
}

function saveDemoResource(res: KnowledgeResource) {
  const existing = getDemoResources().filter((r) => r.id !== res.id && r.slug !== res.slug);
  const updated = [res, ...existing];
  memoryDemoResources = updated;
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(DEMO_RESOURCES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kth_resources_changed'));
  } catch {
    // Ignore
  }
}

function updateDemoResource(id: string, updates: Partial<KnowledgeResource>) {
  const existing = getDemoResources();
  const idx = existing.findIndex((r) => r.id === id);
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...updates, updated_at: new Date().toISOString() };
    memoryDemoResources = [...existing];
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(DEMO_RESOURCES_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('kth_resources_changed'));
    } catch {
      // Ignore
    }
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
   * Fetch a single resource by ID.
   */
  async getResourceById(id: string): Promise<ServiceResult<KnowledgeResource>> {
    return this.getResourceByIdOrSlug(id);
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
