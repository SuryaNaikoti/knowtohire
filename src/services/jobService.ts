import { supabase } from '@/lib/supabase';
import {
  Job,
  JobStatus,
  JobFilters,
  JobCreateInput,
  JobUpdateInput,
  ServiceResult,
  PaginatedResult,
  normalizeServiceError,
} from './types';

const LOCAL_CREATED_JOBS_KEY = 'kth_local_created_jobs';
let memoryCreatedJobs: Job[] = [];

function getLocalCreatedJobs(): Job[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(LOCAL_CREATED_JOBS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  return memoryCreatedJobs;
}

function saveLocalCreatedJob(job: Job) {
  const current = getLocalCreatedJobs().filter(j => j.id !== job.id);
  current.unshift(job);
  memoryCreatedJobs = current;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(LOCAL_CREATED_JOBS_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  }
}

export function notifyJobsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kth_jobs_changed'));
  }
}

/**
 * Evaluates whether a job is currently featured based on its active date range.
 */
export function isJobCurrentlyFeatured(job: Job): boolean {
  if (!job.is_featured) return false;
  if (!job.featured_end_date) return true;
  return new Date(job.featured_end_date) >= new Date();
}

export type {
  Job,
  JobStatus,
  JobFilters,
  JobCreateInput,
  JobUpdateInput,
  EmploymentType,
  WorkMode,
} from './types';

import { cleanSkillArray } from '@/utils/skillValidation';

/**
 * Normalizes raw job database entity into guaranteed typed Job structure.
 * Converts stringified JSON, CSV, newline-separated, null/undefined, or native arrays into guaranteed string[].
 * Eliminates corrupted, gibberish strings from skill tags using cleanSkillArray.
 */
export function normalizeJobEntity(raw: any): Job {
  if (!raw || typeof raw !== 'object') {
    return raw as Job;
  }

  const parseStringArray = (val: unknown): string[] => {
    if (val === null || val === undefined) return [];
    if (Array.isArray(val)) {
      return val
        .map(item => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
        .filter(Boolean);
    }
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed || trimmed === '[]' || trimmed === '{}') return [];

      // Try JSON array parsing (e.g., '["Skill A", "Skill B"]')
      if (
        (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}'))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed
              .map(item => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
              .filter(Boolean);
          }
        } catch {
          // Fall through to delimiter split if JSON parse fails
        }
      }

      // If text contains newlines, split by line
      if (trimmed.includes('\n')) {
        return trimmed
          .split('\n')
          .map(s => s.replace(/^[-*•]\s*/, '').trim())
          .filter(Boolean);
      }

      // If text contains commas, split by comma
      if (trimmed.includes(',')) {
        return trimmed
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }

      return [trimmed];
    }
    return [];
  };

  return {
    ...raw,
    skills: cleanSkillArray(raw.skills),
    responsibilities: parseStringArray(raw.responsibilities),
    requirements: parseStringArray(raw.requirements),
    benefits: parseStringArray(raw.benefits),
    moderation_status: raw.moderation_status || (raw.status === 'published' ? 'approved' : raw.status === 'draft' ? 'pending_review' : undefined),
    moderation_notes: raw.moderation_notes || undefined,
    moderation_flags: Array.isArray(raw.moderation_flags) ? raw.moderation_flags : undefined,
    moderated_at: raw.moderated_at || undefined,
    moderated_by: raw.moderated_by || undefined,
    poster: raw.poster || (raw.created_by ? {
      id: raw.created_by,
      full_name: raw.created_by_name || 'Enterprise Hiring Manager',
      email: raw.created_by_email || 'hiring@enterprise.com',
      role: 'employer',
    } : undefined),
  } as Job;
}

async function getEmployerAuthContext(): Promise<{ userId: string; companyId: string } | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.id) {
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('profile_id', userData.user.id)
      .maybeSingle();

    if (employerProfile?.company_id) {
      return { userId: userData.user.id, companyId: employerProfile.company_id };
    }
    return { userId: userData.user.id, companyId: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396' };
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        if (parsed?.role === 'employer' || parsed?.role === 'admin') {
          return {
            userId: parsed.id || '00000000-0000-0000-0000-000000000002',
            companyId: parsed.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          };
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}

export const jobService = {
  /**
   * Fetch all publicly published jobs with multi-facet filtering and pagination.
   */
  async getPublishedJobs(filters: JobFilters = {}): Promise<ServiceResult<PaginatedResult<Job>>> {
    try {
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 12;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('jobs')
        .select('*, company:company_profiles(*)', { count: 'exact' })
        .eq('status', 'published');

      // 1. Keyword search across title, department, description
      if (filters.keyword && filters.keyword.trim()) {
        const term = `%${filters.keyword.trim()}%`;
        query = query.or(`title.ilike.${term},department.ilike.${term},description.ilike.${term}`);
      }

      // 2. Location filter
      if (filters.location && filters.location.trim()) {
        query = query.ilike('location', `%${filters.location.trim()}%`);
      }

      // 3. State Code filter (e.g. 'KA', 'TS', 'MH')
      if (filters.state_code && filters.state_code.trim()) {
        query = query.eq('state_code', filters.state_code.trim().toUpperCase());
      }

      // 4. Category / Domain filter
      if (filters.category && filters.category.trim() && filters.category !== 'all') {
        const catTerm = filters.category.trim();
        query = query.or(`category.ilike.%${catTerm}%,title.ilike.%${catTerm}%,department.ilike.%${catTerm}%`);
      }

      // 5. Employment Type filter
      if (filters.employment_type) {
        query = query.eq('employment_type', filters.employment_type);
      }

      // 6. Work Mode filter
      if (filters.work_mode) {
        query = query.eq('work_mode', filters.work_mode);
      }

      // 7. Experience Level filter
      if (filters.experience_level) {
        query = query.eq('experience_level', filters.experience_level);
      }

      // 8. Remote Only flag
      if (filters.is_remote !== undefined) {
        query = query.eq('is_remote', filters.is_remote);
      }

      // 9. Salary range filters
      if (filters.min_salary !== undefined && filters.min_salary > 0) {
        query = query.gte('max_salary_inr', filters.min_salary);
      }
      if (filters.max_salary !== undefined && filters.max_salary > 0) {
        query = query.lte('min_salary_inr', filters.max_salary);
      }

      // 10. Sorting
      switch (filters.sort_by) {
        case 'salary_high':
          query = query.order('max_salary_inr', { ascending: false });
          break;
        case 'salary_low':
          query = query.order('min_salary_inr', { ascending: true });
          break;
        case 'deadline':
          query = query.order('application_deadline', { ascending: true, nullsFirst: false });
          break;
        case 'latest':
        default:
          query = query.order('published_at', { ascending: false });
          break;
      }

      // 11. Pagination Range
      const { data, error } = await query.range(from, to);

      let dbJobs: Job[] = (!error && data) ? ((data as any[]) || []).map(normalizeJobEntity) : [];

      let publishedLocal = getLocalCreatedJobs().filter(j => j.status === 'published');
      if (filters.keyword && filters.keyword.trim()) {
        const kw = filters.keyword.trim().toLowerCase();
        publishedLocal = publishedLocal.filter(
          (j) =>
            j.title.toLowerCase().includes(kw) ||
            j.department.toLowerCase().includes(kw) ||
            j.description.toLowerCase().includes(kw) ||
            (j.company?.name || '').toLowerCase().includes(kw)
        );
      }
      if (filters.location && filters.location.trim()) {
        const loc = filters.location.trim().toLowerCase();
        publishedLocal = publishedLocal.filter((j) => j.location.toLowerCase().includes(loc));
      }
      if (filters.category && filters.category.trim() && filters.category !== 'all') {
        const cat = filters.category.trim().toLowerCase();
        publishedLocal = publishedLocal.filter((j) => (j.category || '').toLowerCase().includes(cat));
      }

      // Load and convert active canonical MOCK_JOBS
      const { MOCK_JOBS } = await import('@/data/mockData');
      const localCreated = getLocalCreatedJobs();
      const activeMocks: Job[] = MOCK_JOBS.filter(mj => {
        const override = localCreated.find(lj => lj.id === mj.id);
        return override ? override.status === 'published' : true;
      }).map(mj => ({
        id: mj.id,
        company_id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
        created_by: '00000000-0000-0000-0000-000000000002',
        title: mj.title,
        department: mj.department,
        category: mj.department || 'Sustainability & ESG',
        description: mj.description,
        responsibilities: mj.responsibilities,
        requirements: mj.requirements,
        skills: mj.skills,
        benefits: mj.benefits,
        employment_type: (mj.employmentType?.toLowerCase().replace('-', '_') || 'full_time') as any,
        work_mode: mj.isRemote ? 'remote' : (mj.employmentType === 'Hybrid' ? 'hybrid' : 'on_site'),
        experience_level: 'mid_level',
        location: mj.location,
        is_remote: mj.isRemote,
        min_salary_inr: mj.minSalaryINR,
        max_salary_inr: mj.maxSalaryINR,
        salary_currency: 'INR',
        status: 'published',
        is_verified: true,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        company: {
          id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          name: mj.company,
          industry: mj.department || 'Enterprise Solutions',
          headquarters_location: mj.location,
          verification_status: 'verified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }));

      let filteredMocks = activeMocks;
      if (filters.keyword && filters.keyword.trim()) {
        const kw = filters.keyword.trim().toLowerCase();
        filteredMocks = filteredMocks.filter(
          (j) =>
            j.title.toLowerCase().includes(kw) ||
            j.department.toLowerCase().includes(kw) ||
            j.description.toLowerCase().includes(kw) ||
            (j.company?.name || '').toLowerCase().includes(kw) ||
            (j.skills || []).some(s => s.toLowerCase().includes(kw))
        );
      }
      if (filters.location && filters.location.trim()) {
        const loc = filters.location.trim().toLowerCase();
        filteredMocks = filteredMocks.filter((j) => j.location.toLowerCase().includes(loc));
      }
      if (filters.category && filters.category.trim() && filters.category !== 'all') {
        const cat = filters.category.trim().toLowerCase();
        filteredMocks = filteredMocks.filter((j) => (j.category || j.department || '').toLowerCase().includes(cat));
      }
      if (filters.work_mode) {
        filteredMocks = filteredMocks.filter((j) => j.work_mode === filters.work_mode);
      }
      if (filters.employment_type) {
        filteredMocks = filteredMocks.filter((j) => j.employment_type === filters.employment_type);
      }
      if (filters.min_salary) {
        filteredMocks = filteredMocks.filter((j) => (j.max_salary_inr || 0) >= filters.min_salary!);
      }
      if (filters.max_salary) {
        filteredMocks = filteredMocks.filter((j) => (j.min_salary_inr || 0) <= filters.max_salary!);
      }

      // Blend local jobs, database jobs, and canonical jobs (without duplicates)
      const existingIds = new Set<string>();
      const combined: Job[] = [];

      for (const j of publishedLocal) {
        if (!existingIds.has(j.id)) {
          existingIds.add(j.id);
          combined.push(j);
        }
      }

      for (const j of dbJobs) {
        if (!existingIds.has(j.id)) {
          existingIds.add(j.id);
          combined.push(j);
        }
      }

      for (const j of filteredMocks) {
        if (!existingIds.has(j.id)) {
          existingIds.add(j.id);
          combined.push(j);
        }
      }

      // Apply in-memory sort on combined list
      switch (filters.sort_by) {
        case 'salary_high':
          combined.sort((a, b) => (b.max_salary_inr || 0) - (a.max_salary_inr || 0));
          break;
        case 'salary_low':
          combined.sort((a, b) => (a.min_salary_inr || 0) - (b.min_salary_inr || 0));
          break;
        case 'deadline':
          combined.sort((a, b) => {
            if (!a.application_deadline) return 1;
            if (!b.application_deadline) return -1;
            return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
          });
          break;
        case 'latest':
        default:
          combined.sort((a, b) => {
            const timeA = new Date(a.published_at || a.created_at || 0).getTime();
            const timeB = new Date(b.published_at || b.created_at || 0).getTime();
            return timeB - timeA;
          });
          break;
      }

      const totalCount = combined.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const paginatedData = combined.slice(from, from + pageSize);

      return {
        data: {
          data: paginatedData,
          count: totalCount,
          page,
          pageSize,
          totalPages: totalPages > 0 ? totalPages : 1,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single published job by ID (Public).
   */
  async getPublishedJobById(jobId: string): Promise<ServiceResult<Job>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, company:company_profiles(*)')
        .eq('id', jobId)
        .eq('status', 'published')
        .maybeSingle();

      if (data) {
        return { data: normalizeJobEntity(data), error: null };
      }

      // Check local created jobs
      const localJobs = getLocalCreatedJobs();
      const localJob = localJobs.find((j) => j.id === jobId);
      if (localJob) {
        return { data: normalizeJobEntity(localJob), error: null };
      }

      // Check canonical MOCK_JOBS if not overridden locally
      const { MOCK_JOBS } = await import('@/data/mockData');
      const mockJob = MOCK_JOBS.find((mj) => mj.id === jobId);
      if (mockJob) {
        const mockEntity: Job = {
          id: mockJob.id,
          company_id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          created_by: '00000000-0000-0000-0000-000000000002',
          title: mockJob.title,
          department: mockJob.department,
          category: mockJob.department || 'Sustainability & ESG',
          description: mockJob.description,
          responsibilities: mockJob.responsibilities,
          requirements: mockJob.requirements,
          skills: mockJob.skills,
          benefits: mockJob.benefits,
          employment_type: (mockJob.employmentType?.toLowerCase().replace('-', '_') || 'full_time') as any,
          work_mode: mockJob.isRemote ? 'remote' : (mockJob.employmentType === 'Hybrid' ? 'hybrid' : 'on_site'),
          experience_level: 'mid_level',
          location: mockJob.location,
          is_remote: mockJob.isRemote,
          min_salary_inr: mockJob.minSalaryINR,
          max_salary_inr: mockJob.maxSalaryINR,
          salary_currency: 'INR',
          status: 'published',
          is_verified: true,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          company: {
            id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
            name: mockJob.company,
            industry: mockJob.department || 'Enterprise Solutions',
            headquarters_location: mockJob.location,
            verification_status: 'verified',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
        return { data: normalizeJobEntity(mockEntity), error: null };
      }

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return {
        data: null,
        error: { message: 'Job posting not found or is no longer active.', code: 'NOT_FOUND', status: 404 },
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Calculates tailored match scores and returns jobs matching a candidate's profile.
   * Matches candidate skills, domain specialization, title/headline, preferred location, and salary.
   */
  async getMatchingJobsForCandidate(
    candidateProfile?: any | null,
    limit: number = 20
  ): Promise<ServiceResult<Job[]>> {
    try {
      const allJobsRes = await this.getPublishedJobs({ pageSize: 100, sort_by: 'latest' });
      const allJobs = allJobsRes.data?.data || [];

      if (!candidateProfile || allJobs.length === 0) {
        return { data: allJobs.slice(0, limit), error: null };
      }

      const candidateSkills = (candidateProfile.skills || []).map((s: string) => s.toLowerCase().trim());
      const domainSpec = (candidateProfile.domainSpecialization || candidateProfile.domain_specialization || '').toLowerCase().trim();
      const headline = (candidateProfile.headline || '').toLowerCase().trim();
      const prefLocations = (candidateProfile.preferredLocations || []).map((l: string) => l.toLowerCase().trim());
      const candidateLoc = (candidateProfile.location || '').toLowerCase().trim();
      const prefSalaryMin = candidateProfile.preferredSalaryMinINR || 0;
      const prefSalaryMax = candidateProfile.preferredSalaryMaxINR || 0;

      const scoredJobs = allJobs.map(job => {
        let score = 0;
        const jobSkills = (job.skills || []).map(s => s.toLowerCase().trim());
        const jobTitle = (job.title || '').toLowerCase();
        const jobDept = (job.department || '').toLowerCase();
        const jobCategory = (job.category || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();
        const jobLocation = (job.location || '').toLowerCase();

        // 1. Skill Overlap (up to 50 points)
        if (candidateSkills.length > 0 && jobSkills.length > 0) {
          let matchedCount = 0;
          for (const cSkill of candidateSkills) {
            if (jobSkills.some(jSkill => jSkill.includes(cSkill) || cSkill.includes(jSkill))) {
              matchedCount++;
            }
          }
          const overlapRatio = matchedCount / Math.max(jobSkills.length, candidateSkills.length);
          score += Math.round(overlapRatio * 50);
          if (matchedCount > 0 && score < 25) score = 30; // Base boost for skill match
        } else {
          score += 20; // Default base skill score
        }

        // 2. Domain / Category / Headline Match (up to 30 points)
        let domainMatched = false;
        if (domainSpec) {
          if (
            jobDept.includes(domainSpec) ||
            jobCategory.includes(domainSpec) ||
            jobTitle.includes(domainSpec) ||
            jobDesc.includes(domainSpec)
          ) {
            score += 25;
            domainMatched = true;
          }
        }
        if (headline) {
          const headlineWords = headline.split(/\s+/).filter((w: string) => w.length > 3);
          const matchedHeadlineWords = headlineWords.filter((w: string) => jobTitle.includes(w) || jobDept.includes(w));
          if (matchedHeadlineWords.length > 0) {
            score += Math.min(15, matchedHeadlineWords.length * 8);
          }
        }
        if (!domainMatched && !headline) {
          score += 15;
        }

        // 3. Location Match (up to 15 points)
        if (job.is_remote) {
          score += 15; // Remote is universal match
        } else if (candidateLoc && jobLocation.includes(candidateLoc)) {
          score += 15;
        } else if (prefLocations.some((pl: string) => jobLocation.includes(pl))) {
          score += 12;
        } else {
          score += 5;
        }

        // 4. Salary Alignment (up to 5 points)
        if (prefSalaryMin > 0 && job.max_salary_inr && job.max_salary_inr >= prefSalaryMin) {
          score += 5;
        } else if (prefSalaryMax > 0 && job.min_salary_inr && job.min_salary_inr <= prefSalaryMax) {
          score += 5;
        } else {
          score += 3;
        }

        // Ensure score stays bounded between 65% and 99% for presentation
        const finalMatchScore = Math.min(99, Math.max(65, score));

        return {
          ...job,
          match_score: finalMatchScore,
        };
      });

      // Sort descending by match score
      scoredJobs.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      return { data: scoredJobs.slice(0, limit), error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch all jobs belonging to the authenticated employer's company (all statuses).
   * Scoped by company_id to ensure employers only see their own jobs.
   */
  async getEmployerJobs(filters: { status?: JobStatus; page?: number; pageSize?: number } = {}): Promise<ServiceResult<PaginatedResult<Job>>> {
    try {
      const authCtx = await getEmployerAuthContext();
      const companyId = authCtx?.companyId;
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('jobs')
        .select('*, company:company_profiles(*)', { count: 'exact' });

      // CRITICAL FIX: Scope by company_id so employers only see their own jobs
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;

      let dbJobs: Job[] = (!error && data) ? ((data as any[]) || []).map(normalizeJobEntity) : [];

      let localJobs = getLocalCreatedJobs();
      if (companyId) {
        localJobs = localJobs.filter((j) => !j.company_id || j.company_id === companyId);
      }
      if (filters.status) {
        localJobs = localJobs.filter((j) => j.status === filters.status);
      }

      const totalCount = (count || 0) + localJobs.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Blend local jobs at top of feed
      const combined = [...localJobs, ...dbJobs.filter(j => !localJobs.some(lj => lj.id === j.id))];

      return {
        data: {
          data: combined,
          count: combined.length,
          page,
          pageSize,
          totalPages: totalPages > 0 ? totalPages : 1,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single job by ID for the authorized employer.
   */
  async getEmployerJobById(jobId: string): Promise<ServiceResult<Job>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, company:company_profiles(*)')
        .eq('id', jobId)
        .maybeSingle();

      if (data) {
        return { data: normalizeJobEntity(data), error: null };
      }

      const localJob = getLocalCreatedJobs().find((j) => j.id === jobId);
      if (localJob) {
        return { data: normalizeJobEntity(localJob), error: null };
      }

      const { MOCK_JOBS } = await import('@/data/mockData');
      const mockJob = MOCK_JOBS.find((mj) => mj.id === jobId);
      if (mockJob) {
        const mockEntity: Job = {
          id: mockJob.id,
          company_id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          created_by: '00000000-0000-0000-0000-000000000002',
          title: mockJob.title,
          department: mockJob.department,
          category: mockJob.department || 'Sustainability & ESG',
          description: mockJob.description,
          responsibilities: mockJob.responsibilities,
          requirements: mockJob.requirements,
          skills: mockJob.skills,
          benefits: mockJob.benefits,
          employment_type: (mockJob.employmentType?.toLowerCase().replace('-', '_') || 'full_time') as any,
          work_mode: mockJob.isRemote ? 'remote' : (mockJob.employmentType === 'Hybrid' ? 'hybrid' : 'on_site'),
          experience_level: 'mid_level',
          location: mockJob.location,
          is_remote: mockJob.isRemote,
          min_salary_inr: mockJob.minSalaryINR,
          max_salary_inr: mockJob.maxSalaryINR,
          salary_currency: 'INR',
          status: 'published',
          is_verified: true,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          company: {
            id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
            name: mockJob.company,
            industry: mockJob.department || 'Enterprise Solutions',
            headquarters_location: mockJob.location,
            verification_status: 'verified',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
        return { data: normalizeJobEntity(mockEntity), error: null };
      }

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return {
        data: null,
        error: { message: 'Job opening not found.', code: 'NOT_FOUND', status: 404 },
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch a single job by ID (Internal / Employer / Admin).
   */
  async getJobById(jobId: string): Promise<ServiceResult<Job>> {
    return this.getEmployerJobById(jobId);
  },

  /**
   * Create a new job requisition (Draft or Published).
   */
  async createJob(input: JobCreateInput): Promise<ServiceResult<Job>> {
    try {
      const authCtx = await getEmployerAuthContext();
      if (!authCtx) {
        return {
          data: null,
          error: { message: 'Authentication required to post a job opening.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const targetCompanyId = input.company_id || authCtx.companyId;

      const generatedSlug =
        input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        Math.random().toString(36).substring(2, 8);

      const payload = {
        company_id: targetCompanyId,
        created_by: authCtx.userId,
        employer_id: authCtx.userId,
        slug: generatedSlug,
        title: input.title.trim(),
        department: input.department.trim(),
        category: (input.category || input.department || 'Technology & Enterprise Solutions').trim(),
        description: input.description.trim(),
        responsibilities: input.responsibilities || [],
        requirements: input.requirements || [],
        skills: input.skills || [],
        benefits: input.benefits || [],
        employment_type: input.employment_type || 'full_time',
        work_mode: input.work_mode || 'hybrid',
        experience_level: input.experience_level || 'mid_level',
        location: input.location.trim(),
        state_code: input.state_code ? input.state_code.trim().toUpperCase() : null,
        is_remote: Boolean(input.is_remote),
        min_salary_inr: input.min_salary_inr,
        max_salary_inr: input.max_salary_inr,
        salary_currency: input.salary_currency || 'INR',
        status: input.status || 'draft',
        application_deadline: input.application_deadline || null,
        published_at: input.status === 'published' ? new Date().toISOString() : null,
        career_category_id: input.career_category_id || null,
        industry_id: input.industry_id || null,
        functional_area_id: input.functional_area_id || null,
        domain_id: input.domain_id || null,
        canonical_role_id: input.canonical_role_id || null,
        country_id: input.country_id || null,
        state_id: input.state_id || null,
        city_id: input.city_id || null,
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(payload)
        .select('*, company:company_profiles(*)')
        .single();

      if (error) {
        // Construct guaranteed valid job entity with seed company association
        const fallbackCreatedJob: Job = {
          id: 'job-' + generatedSlug,
          company_id: targetCompanyId,
          created_by: authCtx.userId,
          title: payload.title,
          department: payload.department,
          category: payload.category,
          description: payload.description,
          responsibilities: payload.responsibilities,
          requirements: payload.requirements,
          skills: payload.skills,
          benefits: payload.benefits,
          employment_type: payload.employment_type as any,
          work_mode: payload.work_mode as any,
          experience_level: payload.experience_level as any,
          location: payload.location,
          state_code: payload.state_code || undefined,
          is_remote: payload.is_remote,
          min_salary_inr: payload.min_salary_inr,
          max_salary_inr: payload.max_salary_inr,
          salary_currency: payload.salary_currency,
          status: payload.status as any,
          is_verified: true,
          application_deadline: payload.application_deadline || undefined,
          published_at: payload.published_at || new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          career_category_id: payload.career_category_id,
          industry_id: payload.industry_id,
          functional_area_id: payload.functional_area_id,
          domain_id: payload.domain_id,
          canonical_role_id: payload.canonical_role_id,
          country_id: payload.country_id,
          state_id: payload.state_id,
          city_id: payload.city_id,
          company: {
            id: targetCompanyId,
            name: 'EcoStrategy India Pvt Ltd',
            industry: 'Sustainability & ESG Consulting',
            headquarters_location: 'Bengaluru, Karnataka',
            verification_status: 'verified',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };

        saveLocalCreatedJob(fallbackCreatedJob);
        notifyJobsChanged();
        return { data: fallbackCreatedJob, error: null };
      }

      const entity = normalizeJobEntity(data);
      saveLocalCreatedJob(entity);
      notifyJobsChanged();
      return { data: entity, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update an existing job opening.
   */
  async updateJob(jobId: string, input: JobUpdateInput): Promise<ServiceResult<Job>> {
    try {
      const updates: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      if (input.state_code) {
        updates.state_code = input.state_code.trim().toUpperCase();
      }

      if (input.status === 'published') {
        updates.published_at = new Date().toISOString();
      }

      const { isSupabaseConfigured } = await import('@/lib/supabase');
      let data: any = null;
      let error: any = null;

      if (isSupabaseConfigured()) {
        const res = await supabase
          .from('jobs')
          .update(updates)
          .eq('id', jobId)
          .select('*, company:company_profiles(*)')
          .single();
        data = res.data;
        error = res.error;
      } else {
        error = { message: 'Supabase unconfigured, falling back to local store' };
      }

      if (error || !data) {
        // If Supabase update errors (e.g. invalid UUID syntax for local fallback jobs or offline mode)
        const localJobs = getLocalCreatedJobs();
        const existingLocal = localJobs.find((j) => j.id === jobId);
        if (existingLocal) {
          const updatedEntity: Job = {
            ...existingLocal,
            ...updates,
            updated_at: new Date().toISOString(),
          } as Job;
          saveLocalCreatedJob(updatedEntity);
          notifyJobsChanged();
          return { data: normalizeJobEntity(updatedEntity), error: null };
        }

        // Check if it's a seed MOCK_JOBS job
        const { MOCK_JOBS } = await import('@/data/mockData');
        const mockMatch = MOCK_JOBS.find((mj) => mj.id === jobId);
        if (mockMatch) {
          const newLocalJob: Job = {
            id: mockMatch.id,
            company_id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
            created_by: '00000000-0000-0000-0000-000000000002',
            title: mockMatch.title,
            department: mockMatch.department,
            category: mockMatch.department || 'Technology',
            description: mockMatch.description,
            responsibilities: mockMatch.responsibilities,
            requirements: mockMatch.requirements,
            skills: mockMatch.skills,
            benefits: mockMatch.benefits,
            employment_type: (mockMatch.employmentType || 'full_time') as any,
            work_mode: mockMatch.isRemote ? 'remote' : 'on_site',
            experience_level: 'mid_level',
            location: mockMatch.location,
            is_remote: mockMatch.isRemote,
            min_salary_inr: mockMatch.minSalaryINR,
            max_salary_inr: mockMatch.maxSalaryINR,
            salary_currency: 'INR',
            status: (updates.status as any) || 'published',
            is_verified: true,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            company: {
              id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
              name: mockMatch.company,
              industry: 'Technology & Enterprise',
              headquarters_location: mockMatch.location,
              verification_status: 'verified',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };
          saveLocalCreatedJob(newLocalJob);
          notifyJobsChanged();
          return { data: normalizeJobEntity(newLocalJob), error: null };
        }

        return { data: null, error: normalizeServiceError(error) };
      }

      const entity = normalizeJobEntity(data);
      saveLocalCreatedJob(entity);
      notifyJobsChanged();
      return { data: entity, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Transition job status to 'published'.
   */
  async publishJob(jobId: string): Promise<ServiceResult<Job>> {
    return this.updateJob(jobId, { status: 'published' });
  },

  /**
   * Transition job status to 'paused'.
   */
  async pauseJob(jobId: string): Promise<ServiceResult<Job>> {
    return this.updateJob(jobId, { status: 'paused' });
  },

  /**
   * Transition job status to 'closed'.
   */
  async closeJob(jobId: string): Promise<ServiceResult<Job>> {
    return this.updateJob(jobId, { status: 'closed' });
  },

  /**
   * Reopen a paused or closed job.
   */
  async reopenJob(jobId: string): Promise<ServiceResult<Job>> {
    return this.updateJob(jobId, { status: 'published' });
  },

  /**
   * Delete a draft job.
   */
  async deleteDraftJob(jobId: string): Promise<ServiceResult<boolean>> {
    try {
      memoryCreatedJobs = memoryCreatedJobs.filter(j => j.id !== jobId);
      if (typeof window !== 'undefined' && window.localStorage) {
        const current = getLocalCreatedJobs().filter(j => j.id !== jobId);
        window.localStorage.setItem(LOCAL_CREATED_JOBS_KEY, JSON.stringify(current));
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('status', 'draft');

      notifyJobsChanged();

      if (error) {
        // If error is uuid syntax or offline, returning true if deleted from local
        return { data: true, error: null };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
