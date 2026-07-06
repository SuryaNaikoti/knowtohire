import { supabase } from '../supabase';

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  type: 'job' | 'blog' | 'resource' | 'template' | 'lead_magnet';
  link: string;
  created_at: string;
}

export const searchService = {
  async globalSearch(queryText: string): Promise<SearchResultItem[]> {
    if (!queryText || queryText.trim().length < 2) return [];

    const formattedQuery = queryText.trim().split(/\s+/).join(' & ');

    // Query in parallel
    const [jobsRes, blogsRes, resourcesRes, templatesRes, magnetsRes] = await Promise.all([
      supabase
        .from('jobs')
        .select('id, title, description, created_at')
        .textSearch('search_vector', formattedQuery)
        .limit(5),
      supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, created_at')
        .textSearch('search_vector', formattedQuery)
        .limit(5),
      supabase
        .from('resources')
        .select('id, title, description, created_at')
        .textSearch('search_vector', formattedQuery)
        .limit(5),
      supabase
        .from('templates')
        .select('id, title, description, created_at')
        .textSearch('search_vector', formattedQuery)
        .limit(5),
      supabase
        .from('lead_magnets')
        .select('id, title, description, slug, created_at')
        .textSearch('search_vector', formattedQuery)
        .limit(5)
    ]);

    const results: SearchResultItem[] = [];

    if (jobsRes.data) {
      results.push(...jobsRes.data.map(j => ({
        id: j.id,
        title: j.title,
        description: j.description || '',
        type: 'job' as const,
        link: `/jobs/${j.id}`,
        created_at: j.created_at
      })));
    }

    if (blogsRes.data) {
      results.push(...blogsRes.data.map(b => ({
        id: b.id,
        title: b.title,
        description: b.excerpt || '',
        type: 'blog' as const,
        link: `/blog/${b.slug}`,
        created_at: b.created_at
      })));
    }

    if (resourcesRes.data) {
      results.push(...resourcesRes.data.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        type: 'resource' as const,
        link: `/resources-hub`,
        created_at: r.created_at
      })));
    }

    if (templatesRes.data) {
      results.push(...templatesRes.data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        type: 'template' as const,
        link: `/templates/${t.id}`,
        created_at: t.created_at
      })));
    }

    if (magnetsRes.data) {
      results.push(...magnetsRes.data.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description || '',
        type: 'lead_magnet' as const,
        link: `/resources-hub`,
        created_at: m.created_at
      })));
    }

    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
};
