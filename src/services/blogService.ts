/**
 * KnowToHire Editorial & Insights Blog Service
 * Operations for news, regulatory briefings, ESG compliance insights, and career guides.
 *
 * ARCHITECTURE NOTE:
 * Dual-layer architecture:
 * 1. REAL SUPABASE MODE: When configured, reads from and writes to public.blog_posts with RLS.
 * 2. LOCAL / DEMO RESILIENT LAYER: Synchronizes canonical editorial seed posts in shared in-memory/localStorage store,
 *    emitting 'kth_blog_changed' for live reactive updates across Admin and Public portals.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  author_id?: string | null;
  author_name: string;
  category: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  read_time: string;
  is_featured: boolean;
  status: BlogStatus;
  is_active: boolean;
  tags: string[];
  view_count: number;
  published_at: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface BlogFilterParams {
  search?: string;
  category?: string;
  tag?: string;
  isFeatured?: boolean;
  status?: BlogStatus | 'all';
  limit?: number;
}

export interface CreateBlogPostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category?: string;
  cover_url?: string;
  read_time?: string;
  author_name?: string;
  is_featured?: boolean;
  status?: BlogStatus;
  tags?: string[];
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  cover_url?: string;
  read_time?: string;
  author_name?: string;
  is_featured?: boolean;
  status?: BlogStatus;
  tags?: string[];
}

const DEMO_BLOG_STORAGE_KEY = 'kth_demo_blog_posts';

export const INITIAL_CANONICAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    author_id: 'admin-1',
    author_name: 'KnowToHire Regulatory Research Group',
    category: 'ESG & BRSR Compliance',
    title: 'Navigating SEBI BRSR Core Mandates: What Listed Entities Need in FY 2026-27',
    slug: 'sebi-brsr-core-mandates-guide-2026',
    excerpt: "A comprehensive breakdown of SEBI's updated BRSR Core framework, reasonable assurance mandates, and supply chain ESG disclosures for the top 1000 listed companies.",
    content: `## The Evolution of ESG Disclosure in India\n\nThe Securities and Exchange Board of India (SEBI) has systematically strengthened corporate sustainability governance through the Business Responsibility and Sustainability Report (BRSR) Core framework.\n\n### Key Pillars of Reasonable Assurance\n1. **Scope 1 & 2 Emissions Verification**: Third-party verification protocols and emission intensity metrics.\n2. **Water Footprint & Zero Liquid Discharge (ZLD)**: Water consumption per unit of turnover.\n3. **Gender Diversity & Fair Wages**: Median compensation disclosures and workplace safety compliance.\n\n### Practical Implementation Roadmap\nOrganizations must establish internal audit controls and integrate telemetry tracking across vendor tiers to satisfy reasonable assurance requirements.`,
    cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=450&q=80',
    read_time: '6 min read',
    is_featured: true,
    status: 'published',
    is_active: true,
    tags: ['SEBI BRSR', 'ESG Reporting', 'Compliance', 'Regulatory Briefing'],
    view_count: 14280,
    published_at: '2026-08-20T08:00:00.000Z',
    created_at: '2026-08-20T08:00:00.000Z',
    updated_at: '2026-08-20T08:00:00.000Z',
  },
  {
    id: 'post-2',
    author_id: 'admin-1',
    author_name: 'Adv. Rohan Sengupta (IPR Lead)',
    category: 'Patent & IPR',
    title: 'CleanTech Patent Landscaping: Overcoming Section 3(d) Hurdles in India',
    slug: 'cleantech-patent-landscaping-section-3d-india',
    excerpt: 'Strategic guidance for green chemistry and carbon capture inventors navigating patent eligibility, therapeutic efficacy objections, and Prior Art searches under the Indian Patents Act.',
    content: `## Environmental Inventions & Indian Patent Law\n\nSection 3(d) of the Indian Patents Act, 1970 represents a rigorous benchmark for patentability, preventing the mere discovery of a new form of a known substance.\n\n### Strategies for Green Technologies\n- **Establishing Technical Advancement**: Demonstrating significantly enhanced carbon capture kinetic rates.\n- **Overcoming Section 3(k) Algorithm Objections**: Patenting smart grid algorithms as integrated hardware-firmware systems.\n- **Drafting Robust Independent Claims**: Ensuring claims are bounded by measurable thermodynamic parameters.`,
    cover_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=450&q=80',
    read_time: '8 min read',
    is_featured: true,
    status: 'published',
    is_active: true,
    tags: ['Patent Law', 'CleanTech', 'IPR', 'Patent Prosecution'],
    view_count: 9450,
    published_at: '2026-08-18T10:30:00.000Z',
    created_at: '2026-08-18T10:30:00.000Z',
    updated_at: '2026-08-18T10:30:00.000Z',
  },
  {
    id: 'post-3',
    author_id: 'admin-1',
    author_name: 'KnowToHire Talent Intelligence',
    category: 'Environmental Careers',
    title: 'Chief Sustainability Officer (CSO) Executive Hiring Trends in Indian Corporates',
    slug: 'cso-executive-hiring-trends-india',
    excerpt: 'Analysis of compensation bands, board-level responsibilities, and skill requisites for sustainability leaders across manufacturing, IT, and energy sectors.',
    content: `## The Modern Chief Sustainability Officer\n\nNo longer a peripheral CSR role, the modern CSO commands direct executive board access and oversees enterprise-wide decarbonization budgets.\n\n### Key Market Findings\n- **Compensation Growth**: 35% YoY increase in executive compensation bands for technical sustainability leads.\n- **Cross-Functional Prerequisites**: Strong demand for dual competencies in chemical engineering and GHG accounting.\n- **Board Oversight**: 78% of top Indian conglomerates now report direct CSO reporting to the Managing Director or Board Risk Committee.`,
    cover_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&h=450&q=80',
    read_time: '5 min read',
    is_featured: false,
    status: 'published',
    is_active: true,
    tags: ['Executive Search', 'CSO Leadership', 'Green Jobs', 'Compensation Bands'],
    view_count: 11800,
    published_at: '2026-08-15T12:00:00.000Z',
    created_at: '2026-08-15T12:00:00.000Z',
    updated_at: '2026-08-15T12:00:00.000Z',
  },
  {
    id: 'post-4',
    author_id: 'admin-1',
    author_name: 'Dr. Sunita Deshmukh (Climate Strategy Lead)',
    category: 'CleanTech & Energy',
    title: 'Carbon Credit Verification & Article 6 Alignment: An Industry Playbook',
    slug: 'carbon-credit-verification-article-6-playbook',
    excerpt: 'Understanding the transition from voluntary carbon markets (VCM) to compliance mechanisms under the Energy Conservation (Amendment) Act and Article 6 of the Paris Agreement.',
    content: `## India's Domestic Carbon Credit Trading Scheme (CCTS)\n\nThe Bureau of Energy Efficiency (BEE) and Ministry of Power have established the foundational architecture for the Indian Carbon Market (ICM).\n\n### Operational Guidelines for Heavy Industries\n1. **Obligated Entities Baseline Calculation**: Establishing designated consumer greenhouse gas intensity limits.\n2. **Carbon Credit Certificates (CCCs)**: Electronic issuance and trading mechanisms on registered power exchanges.\n3. **Corresponding Adjustments (CA)**: Ensuring non-double-counting under Paris Agreement Article 6.2 and 6.4 transfers.`,
    cover_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&h=450&q=80',
    read_time: '7 min read',
    is_featured: false,
    status: 'published',
    is_active: true,
    tags: ['Carbon Markets', 'Article 6', 'VCM', 'Decarbonization'],
    view_count: 7620,
    published_at: '2026-08-12T14:15:00.000Z',
    created_at: '2026-08-12T14:15:00.000Z',
    updated_at: '2026-08-12T14:15:00.000Z',
  },
];

let inMemoryDemoBlogPosts: BlogPost[] = [];

function getDemoBlogPosts(): BlogPost[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(DEMO_BLOG_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
  }
  return inMemoryDemoBlogPosts;
}

function saveDemoBlogPost(post: BlogPost) {
  const existing = getDemoBlogPosts().filter((p) => p.id !== post.id && p.slug !== post.slug);
  inMemoryDemoBlogPosts = [post, ...existing];

  if (typeof window !== 'undefined') {
    if (window.localStorage) {
      try {
        window.localStorage.setItem(DEMO_BLOG_STORAGE_KEY, JSON.stringify(inMemoryDemoBlogPosts));
      } catch {
        // Ignore
      }
    }
    window.dispatchEvent(new CustomEvent('kth_blog_changed'));
  }
}

function updateDemoBlogPost(id: string, updates: Partial<BlogPost>) {
  let existing = [...getDemoBlogPosts()];
  if (existing.length === 0) {
    existing = [...INITIAL_CANONICAL_BLOG_POSTS];
  }
  const idx = existing.findIndex((p) => p.id === id || p.slug === id);
  if (idx >= 0) {
    existing[idx] = {
      ...existing[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    inMemoryDemoBlogPosts = existing;

    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        try {
          window.localStorage.setItem(DEMO_BLOG_STORAGE_KEY, JSON.stringify(existing));
        } catch {
          // Ignore
        }
      }
      window.dispatchEvent(new CustomEvent('kth_blog_changed'));
    }
  }
}

function mapDatabaseRowToBlogPost(p: Record<string, any>): BlogPost {
  return {
    id: p.id,
    author_id: p.author_id,
    author_name: p.author_name || 'KnowToHire Editorial Team',
    category: p.category || 'Environmental Policy',
    title: p.title || 'Untitled Article',
    slug: p.slug || p.id,
    excerpt: p.excerpt || '',
    content: p.content || '',
    cover_url:
      p.cover_url ||
      p.featured_image ||
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=400&q=80',
    read_time: p.read_time || `${p.read_time_minutes || 5} min read`,
    is_featured: Boolean(p.is_featured),
    status: (p.status || 'published') as BlogStatus,
    is_active: p.is_active !== undefined ? Boolean(p.is_active) : true,
    tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['ESG', 'Compliance'],
    view_count: Number(p.view_count) || 0,
    published_at: p.published_at || p.created_at || new Date().toISOString(),
    deleted_at: p.deleted_at || null,
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString(),
  };
}

export const blogService = {
  /**
   * Fetch blog articles with search, category, status, and featured filters.
   */
  async getBlogPosts(params?: BlogFilterParams): Promise<ServiceResult<BlogPost[]>> {
    try {
      let dbPosts: BlogPost[] = [];

      if (isSupabaseConfigured()) {
        try {
          let query = supabase
            .from('blog_posts')
            .select('*')
            .is('deleted_at', null)
            .order('published_at', { ascending: false });

          if (params?.status && params.status !== 'all') {
            query = query.eq('status', params.status);
          } else if (!params?.status) {
            query = query.eq('status', 'published').eq('is_active', true);
          }

          if (params?.isFeatured !== undefined) {
            query = query.eq('is_featured', params.isFeatured);
          }

          if (params?.limit) {
            query = query.limit(params.limit);
          }

          const { data, error } = await query;
          if (!error && data) {
            dbPosts = data.map(mapDatabaseRowToBlogPost);
          }
        } catch {
          // Table catch
        }
      }

      const baseList = dbPosts.length > 0 ? dbPosts : [...INITIAL_CANONICAL_BLOG_POSTS];
      const demoPosts = getDemoBlogPosts();
      const combined = [...baseList];

      for (const dp of demoPosts) {
        const existingIdx = combined.findIndex((c) => c.id === dp.id || c.slug === dp.slug);
        if (existingIdx >= 0) {
          combined[existingIdx] = { ...combined[existingIdx], ...dp };
        } else {
          combined.unshift(dp);
        }
      }

      // Filter by status
      let filtered = combined.filter((p) => !p.deleted_at);

      if (params?.status === 'all') {
        // Admin view: all statuses
      } else if (params?.status) {
        filtered = filtered.filter((p) => p.status === params.status);
      } else {
        // Public default: strictly published and active
        filtered = filtered.filter((p) => p.status === 'published' && p.is_active);
      }

      // Filter by search keyword
      if (params?.search && params.search.trim()) {
        const term = params.search.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(term) ||
            p.excerpt.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term) ||
            p.tags.some((t) => t.toLowerCase().includes(term))
        );
      }

      // Filter by category
      if (params?.category && params.category !== 'all') {
        const cat = params.category.toLowerCase();
        filtered = filtered.filter(
          (p) => p.category.toLowerCase().includes(cat) || p.title.toLowerCase().includes(cat)
        );
      }

      // Filter by isFeatured
      if (params?.isFeatured !== undefined) {
        filtered = filtered.filter((p) => p.is_featured === params.isFeatured);
      }

      // Sort by publication timestamp descending
      filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

      if (params?.limit && params.limit > 0) {
        filtered = filtered.slice(0, params.limit);
      }

      return { data: filtered, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single blog post by slug or ID with published-only enforcement by default.
   */
  async getBlogPostBySlug(
    slugOrId: string,
    options: { requirePublished?: boolean } = { requirePublished: true }
  ): Promise<ServiceResult<BlogPost>> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

      if (isSupabaseConfigured()) {
        try {
          let query = supabase.from('blog_posts').select('*');

          if (isUUID) {
            query = query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
          } else {
            query = query.eq('slug', slugOrId);
          }

          if (options?.requirePublished) {
            query = query.is('deleted_at', null).eq('status', 'published').eq('is_active', true);
          }

          const { data, error } = await query.maybeSingle();

          if (!error && data) {
            const parsed = mapDatabaseRowToBlogPost(data);
            const demo = getDemoBlogPosts().find((p) => p.id === parsed.id || p.slug === parsed.slug);
            const merged = demo ? { ...parsed, ...demo } : parsed;

            if (options?.requirePublished && (merged.status !== 'published' || !merged.is_active || merged.deleted_at)) {
              return {
                data: null,
                error: { message: 'Blog article not found or unavailable', code: 'NOT_FOUND', status: 404 },
              };
            }

            return { data: merged, error: null };
          }
        } catch {
          // Fallback
        }
      }

      const all = [...getDemoBlogPosts(), ...INITIAL_CANONICAL_BLOG_POSTS];
      const match = all.find((p) => p.id === slugOrId || p.slug === slugOrId);

      if (match) {
        if (options?.requirePublished && (match.status !== 'published' || !match.is_active || match.deleted_at)) {
          return {
            data: null,
            error: { message: 'Blog article not found or unavailable', code: 'NOT_FOUND', status: 404 },
          };
        }
        return { data: match, error: null };
      }

      return {
        data: null,
        error: { message: 'Blog article not found', code: 'NOT_FOUND', status: 404 },
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Create new blog post.
   */
  async createBlogPost(input: CreateBlogPostInput): Promise<ServiceResult<BlogPost>> {
    try {
      const slug =
        input.slug?.trim() ||
        input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `post-${Date.now()}`;
      const now = new Date().toISOString();

      const newPost: BlogPost = {
        id: newId,
        author_id: 'admin-1',
        author_name: input.author_name?.trim() || 'KnowToHire Editorial Team',
        title: input.title.trim(),
        slug,
        excerpt: input.excerpt.trim(),
        content: input.content.trim(),
        category: input.category || 'Environmental Policy',
        cover_url:
          input.cover_url?.trim() ||
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=450&q=80',
        read_time: input.read_time?.trim() || '5 min read',
        is_featured: Boolean(input.is_featured),
        status: input.status || 'published',
        is_active: true,
        tags: input.tags && input.tags.length > 0 ? input.tags : ['ESG', 'Compliance'],
        view_count: 0,
        published_at: input.status === 'draft' ? '' : now,
        created_at: now,
        updated_at: now,
      };

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.from('blog_posts').insert(newPost).select('*').single();
          if (!error && data) {
            newPost.id = data.id;
          }
        } catch {
          // Table catch
        }
      }

      saveDemoBlogPost(newPost);

      return { data: newPost, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Update blog post metadata and content.
   */
  async updateBlogPost(id: string, input: UpdateBlogPostInput): Promise<ServiceResult<BlogPost>> {
    try {
      const existingRes = await this.getBlogPostBySlug(id, { requirePublished: false });
      const existing = existingRes.data;

      const updates: Partial<BlogPost> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      if (input.status === 'published' && (!existing?.published_at || existing?.status === 'draft')) {
        updates.published_at = new Date().toISOString();
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('blog_posts').update(updates).eq('id', id);
        } catch {
          // Table catch
        }
      }

      updateDemoBlogPost(id, updates);

      const updated = await this.getBlogPostBySlug(id, { requirePublished: false });
      return updated;
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Quick status update (publish / draft / archive).
   */
  async updateBlogPostStatus(id: string, status: BlogStatus): Promise<ServiceResult<boolean>> {
    const res = await this.updateBlogPost(id, {
      status,
      ...(status === 'archived' ? { is_active: false } : { is_active: true }),
    });
    if (res.error) {
      return { data: null, error: res.error };
    }
    return { data: true, error: null };
  },

  /**
   * Admin: Soft-delete / archive blog post.
   */
  async deleteBlogPost(id: string): Promise<ServiceResult<boolean>> {
    try {
      const now = new Date().toISOString();
      const updates = {
        status: 'archived' as BlogStatus,
        is_active: false,
        deleted_at: now,
        updated_at: now,
      };

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('blog_posts').update(updates).eq('id', id);
        } catch {
          // Table catch
        }
      }

      updateDemoBlogPost(id, updates);

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Archive blog post.
   */
  async archiveBlogPost(id: string): Promise<ServiceResult<boolean>> {
    return this.updateBlogPostStatus(id, 'archived');
  },
};
