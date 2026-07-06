import { supabase } from '../supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author_id?: string;
  featured_image?: string;
  read_time_minutes: number;
  seo_title?: string;
  seo_description?: string;
  is_featured: boolean;
  is_gated: boolean;
  lead_magnet_id?: string;
  view_count: number;
  like_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: string;
  tags?: string[];
  // joined
  author?: { id: string; full_name: string; avatar_url: string };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  description?: string;
  post_count: number;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id?: string;
  parent_id?: string;
  content: string;
  is_approved: boolean;
  is_deleted: boolean;
  like_count: number;
  created_at: string;
  author?: { id: string; full_name: string; avatar_url: string };
  replies?: BlogComment[];
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  is_featured?: boolean;
  is_gated?: boolean;
  page?: number;
  limit?: number;
}

// ─── Blog Service ─────────────────────────────────────────────────────────────

export const blogService = {
  // ── Posts ──────────────────────────────────────────────────────────────────

  async getPosts(filters: BlogFilters = {}) {
    const { page = 1, limit = 12, search, is_featured } = filters;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_posts')
      .select('*, author:profiles(id, full_name, avatar_url)', { count: 'exact' })
      .is('deleted_at', null)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }
    if (typeof is_featured === 'boolean') {
      query = query.eq('is_featured', is_featured);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { posts: data as BlogPost[], total: count ?? 0, page, limit };
  },

  async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) throw error;

    // Increment view count atomically via RPC (fire-and-forget)
    void supabase.rpc('increment_blog_post_view_count' as any, { post_id: data.id });

    return data as BlogPost;
  },

  async getFeaturedPosts(limit = 3) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('is_featured', true)
      .is('deleted_at', null)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as BlogPost[];
  },

  async getRelatedPosts(postId: string, category: string, limit = 3) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, read_time_minutes, published_at, category')
      .eq('category', category)
      .neq('id', postId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // ── Categories ─────────────────────────────────────────────────────────────

  async getCategories() {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as BlogCategory[];
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*, author:profiles(id, full_name, avatar_url)')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as BlogComment[];
  },

  async addComment(postId: string, content: string, parentId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_id: parentId ?? null,
        is_approved: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ── Admin ──────────────────────────────────────────────────────────────────

  async createPost(payload: Partial<BlogPost>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ ...payload, author_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async updatePost(id: string, payload: Partial<BlogPost>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async publishPost(id: string) {
    return blogService.updatePost(id, { published_at: new Date().toISOString() } as any);
  },

  async unpublishPost(id: string) {
    return blogService.updatePost(id, { published_at: null } as any);
  },

  async approveComment(commentId: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .update({ is_approved: true })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('blog_comments')
      .update({ is_deleted: true })
      .eq('id', commentId);

    if (error) throw error;
  },
};
