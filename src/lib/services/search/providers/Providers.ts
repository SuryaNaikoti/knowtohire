import type { SearchProvider, SearchResult } from '../types';
import { jobsService, type Job } from '../../jobsService';

export class JobsSearchProvider implements SearchProvider {
  type = 'job' as const;

  async search(query: string): Promise<SearchResult[]> {
    try {
      const jobs = await jobsService.getPublishedJobs();
      const matched = jobs.filter(
        (j: Job) =>
          j.title.toLowerCase().includes(query) ||
          j.description?.toLowerCase().includes(query) ||
          j.company_name?.toLowerCase().includes(query)
      );

      return matched.map((j: Job) => ({
        id: j.id,
        title: j.title,
        subtitle: j.company_name || 'Hiring Company',
        description: j.description || `${j.employment_type} position in ${j.city}`,
        type: 'job',
        score: 0,
        url: `/jobs/${j.id}`,
        iconName: 'Briefcase',
      }));
    } catch (err) {
      console.error('JobsSearchProvider error:', err);
      return [];
    }
  }
}

export class BlogSearchProvider implements SearchProvider {
  type = 'blog' as const;

  async search(query: string): Promise<SearchResult[]> {
    const mockPosts = [
      { id: 'b1', title: 'Top 10 Tech Resume Strategies for 2026', excerpt: 'Optimize your tech resume with high impact metrics.' },
      { id: 'b2', title: 'Mastering System Design Interviews', excerpt: 'Key patterns and scalability tactics for senior engineers.' },
    ];

    const matched = mockPosts.filter(
      (p) => p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query)
    );

    return matched.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: 'Career Advice & Insights',
      description: p.excerpt,
      type: 'blog',
      score: 0,
      url: `/blog/${p.id}`,
      iconName: 'FileText',
    }));
  }
}
