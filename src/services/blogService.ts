/**
 * KnowToHire Editorial & Insights Blog Service
 * Real Supabase operations for news, regulatory briefings, ESG compliance insights, and career guides.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export interface BlogPost {
  id: string;
  author_id?: string | null;
  author_name?: string;
  category: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url?: string | null;
  read_time: string;
  is_featured: boolean;
  published_at: string;
  tags?: string[];
  view_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface BlogFilterParams {
  search?: string;
  category?: string;
  tag?: string;
  isFeatured?: boolean;
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
  is_featured?: boolean;
  tags?: string[];
}

export const blogService = {
  /**
   * Fetch all published blog articles.
   */
  async getBlogPosts(params?: BlogFilterParams): Promise<ServiceResult<BlogPost[]>> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .is('deleted_at', null)
        .order('published_at', { ascending: false });

      if (params?.search && params.search.trim()) {
        const term = params.search.trim();
        query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`);
      }

      if (params?.category && params.category !== 'all') {
        query = query.ilike('title', `%${params.category}%`);
      }

      if (params?.isFeatured !== undefined) {
        query = query.eq('is_featured', params.isFeatured);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const normalized: BlogPost[] = (data || []).map((p) => ({
        id: p.id,
        author_id: p.author_id,
        author_name: 'KnowToHire Editorial Team',
        category: p.category || 'Environmental Policy',
        title: p.title || 'Untitled Article',
        slug: p.slug || p.id,
        excerpt: p.excerpt || '',
        content: p.content || '',
        cover_url: p.cover_url || p.featured_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=400&q=80',
        read_time: p.read_time || `${p.read_time_minutes || 5} min read`,
        is_featured: Boolean(p.is_featured),
        published_at: p.published_at || p.created_at || new Date().toISOString(),
        tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['EIA', 'ESG', 'Compliance'],
        view_count: Number(p.view_count) || 0,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single blog post by slug or ID.
   */
  async getBlogPostBySlug(slugOrId: string): Promise<ServiceResult<BlogPost>> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

      let query = supabase.from('blog_posts').select('*').is('deleted_at', null);

      if (isUUID) {
        query = query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
      } else {
        query = query.eq('slug', slugOrId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Blog article not found', code: 'NOT_FOUND', status: 404 },
        };
      }

      const normalized: BlogPost = {
        id: data.id,
        author_id: data.author_id,
        author_name: 'KnowToHire Editorial Team',
        category: data.category || 'Environmental Policy',
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        cover_url: data.cover_url || data.featured_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=400&q=80',
        read_time: data.read_time || `${data.read_time_minutes || 5} min read`,
        is_featured: Boolean(data.is_featured),
        published_at: data.published_at || data.created_at,
        tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : ['EIA', 'ESG', 'Compliance'],
        view_count: Number(data.view_count) || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      // Increment view count in background
      supabase
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)
        .then(() => {});

      return { data: normalized, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Create new blog post.
   */
  async createBlogPost(input: CreateBlogPostInput): Promise<ServiceResult<BlogPost>> {
    try {
      const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = {
        title: input.title.trim(),
        slug,
        excerpt: input.excerpt.trim(),
        content: input.content.trim(),
        category: input.category || 'Industry Analysis',
        cover_url: input.cover_url || null,
        read_time: input.read_time || '5 min read',
        is_featured: Boolean(input.is_featured),
        published_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('blog_posts').insert(payload).select('*').single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return this.getBlogPostBySlug(data.slug);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Update blog post.
   */
  async updateBlogPost(id: string, input: Partial<CreateBlogPostInput>): Promise<ServiceResult<BlogPost>> {
    try {
      const updates: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('blog_posts').update(updates).eq('id', id);

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return this.getBlogPostBySlug(id);
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Delete blog post.
   */
  async deleteBlogPost(id: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('blog_posts')
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
