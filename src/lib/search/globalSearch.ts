import { supabase, isSupabaseConfigured } from '../supabase';

export type SearchDocumentType = 'Job' | 'Resource' | 'Template' | 'Blog' | 'ResearchDocument';

export interface SearchResultItem {
  id: string;
  title: string;
  type: SearchDocumentType;
  snippet: string;
  relevanceScore: number;
  linkUrl: string;
}

// Simulated documents for static resource search
const STATIC_DOCUMENTS: Omit<SearchResultItem, 'relevanceScore'>[] = [
  {
    id: 'res-1',
    title: 'ESG Reporting Best Practices for Environmental Engineers',
    type: 'Resource',
    snippet: 'A comprehensive guide on environmental impact assessments and ESG disclosure compliance frameworks.',
    linkUrl: '/resources/esg-reporting-guide',
  },
  {
    id: 'res-2',
    title: 'IPR and Patent Filing Checklist',
    type: 'Resource',
    snippet: 'Step-by-step checklist for patent drafting and filing for patent analysts and research scientists.',
    linkUrl: '/resources/ipr-filing-checklist',
  },
  {
    id: 'temp-1',
    title: 'Sustainability Officer Resume Template',
    type: 'Template',
    snippet: 'Tailored resume template highlights ESG metrics, carbon auditing skills, and regulatory compliance projects.',
    linkUrl: '/templates/sustainability-officer-resume',
  },
  {
    id: 'temp-2',
    title: 'Recruiter Outreach Template - Patent Engineer',
    type: 'Template',
    snippet: 'Cold email templates optimized for sourcing specialized patent agents and patent attorneys.',
    linkUrl: '/templates/patent-recruiter-outreach',
  },
  {
    id: 'blog-1',
    title: 'The Rise of ESG and Green Careers',
    type: 'Blog',
    snippet: 'Exploring job growth and in-demand skills in carbon accounting, renewable energy, and corporate governance.',
    linkUrl: '/blog/rise-of-esg-green-careers',
  },
  {
    id: 'blog-2',
    title: 'Navigating Patent Agent Examinations',
    type: 'Blog',
    snippet: 'Tips and study strategies for passing the patent agent exam and starting a career in patent law.',
    linkUrl: '/blog/patent-agent-exam-tips',
  },
  {
    id: 'doc-1',
    title: 'Global Carbon Market Trends 2026',
    type: 'ResearchDocument',
    snippet: 'Academic research paper analyzing carbon pricing, compliance vs voluntary offsets, and regulatory forecasts.',
    linkUrl: '/research/carbon-trends-2026',
  },
];

export const globalSearch = {
  searchAll: async (query: string, filterTypes?: SearchDocumentType[]): Promise<SearchResultItem[]> => {
    const term = query.toLowerCase().trim();
    if (!term) return [];

    let jobsList: any[] = [];

    // 1. Load jobs from DB or fallback
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, description, company:companies(name)')
          .eq('status', 'published')
          .eq('approval_status', 'approved');

        if (!error && data) {
          jobsList = data.map(j => ({
            id: j.id,
            title: j.title,
            type: 'Job',
            snippet: `${(j.company as any)?.name || 'Unknown Company'} is hiring for ${j.title}. ${j.description || ''}`,
            linkUrl: `/jobs/${j.id}`,
          }));
        }
      } catch (err) {
        console.warn('Supabase job search failed, falling back to local storage', err);
      }
    }

    if (jobsList.length === 0) {
      try {
        const kthJobs = localStorage.getItem('kth_jobs');
        if (kthJobs) {
          const parsed = JSON.parse(kthJobs);
          jobsList = parsed
            .filter((j: any) => j.status === 'published' && j.approval_status === 'approved')
            .map((j: any) => ({
              id: j.id,
              title: j.title,
              type: 'Job',
              snippet: `${j.company_name || 'Unknown Company'} is hiring for ${j.title}. ${j.description || ''}`,
              linkUrl: `/jobs/${j.id}`,
            }));
        }
      } catch (err) {
        console.warn('Failed to parse jobs from localStorage', err);
      }
    }

    // 2. Combine with static documents
    const allDocs: SearchResultItem[] = [
      ...jobsList,
      ...STATIC_DOCUMENTS.map(doc => ({ ...doc, relevanceScore: 0 })),
    ] as SearchResultItem[];

    // 3. Filter by type if requested
    const filteredDocs = filterTypes && filterTypes.length > 0
      ? allDocs.filter(doc => filterTypes.includes(doc.type))
      : allDocs;

    // 4. Calculate relevance and match terms
    const results: SearchResultItem[] = [];

    for (const doc of filteredDocs) {
      const titleMatch = doc.title.toLowerCase().includes(term);
      const snippetMatch = doc.snippet.toLowerCase().includes(term);

      if (titleMatch || snippetMatch) {
        let score = 0;
        if (titleMatch) score += 10;
        // Exact prefix match gets higher score
        if (doc.title.toLowerCase().startsWith(term)) score += 5;
        if (snippetMatch) score += 2;

        results.push({
          ...doc,
          relevanceScore: score,
        });
      }
    }

    // 5. Sort by score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  },
};
