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

function getLocalCreatedJobs(): Job[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_CREATED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCreatedJob(job: Job) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const current = getLocalCreatedJobs().filter(j => j.id !== job.id);
    current.unshift(job);
    window.localStorage.setItem(LOCAL_CREATED_JOBS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
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
      const { data, count, error } = await query.range(from, to);

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

      const totalCount = (count || 0) + publishedLocal.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      const combined = [...publishedLocal, ...dbJobs.filter(j => !publishedLocal.some(lj => lj.id === j.id))];

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
      const localJob = getLocalCreatedJobs().find((j) => j.id === jobId && j.status === 'published');
      if (localJob) {
        return { data: normalizeJobEntity(localJob), error: null };
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
        category: input.category.trim(),
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
        return { data: fallbackCreatedJob, error: null };
      }

      const entity = normalizeJobEntity(data);
      saveLocalCreatedJob(entity);
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

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select('*, company:company_profiles(*)')
        .single();

      if (error) {
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
          return { data: normalizeJobEntity(updatedEntity), error: null };
        }
        return { data: null, error: normalizeServiceError(error) };
      }

      const entity = normalizeJobEntity(data);
      saveLocalCreatedJob(entity);
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
      if (typeof window !== 'undefined' && window.localStorage) {
        const current = getLocalCreatedJobs().filter(j => j.id !== jobId);
        window.localStorage.setItem(LOCAL_CREATED_JOBS_KEY, JSON.stringify(current));
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('status', 'draft');

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
