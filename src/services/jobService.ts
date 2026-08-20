/**
 * KnowToHire Job Service
 * Production Supabase abstraction for Public and Employer Job Marketplace operations.
 */
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

export type {
  Job,
  JobStatus,
  JobFilters,
  JobCreateInput,
  JobUpdateInput,
  EmploymentType,
  WorkMode,
} from './types';

/**
 * Normalizes raw job database entity into guaranteed typed Job structure.
 * Converts stringified JSON, CSV, newline-separated, null/undefined, or native arrays into guaranteed string[].
 * Never throws an exception on malformed metadata.
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
    skills: parseStringArray(raw.skills),
    responsibilities: parseStringArray(raw.responsibilities),
    requirements: parseStringArray(raw.requirements),
    benefits: parseStringArray(raw.benefits),
  } as Job;
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
      if (filters.category && filters.category.trim()) {
        query = query.eq('category', filters.category.trim());
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

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const normalizedJobs = ((data as any[]) || []).map(normalizeJobEntity);

      return {
        data: {
          data: normalizedJobs,
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

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Job posting not found or is no longer active.', code: 'NOT_FOUND', status: 404 },
        };
      }

      return { data: normalizeJobEntity(data), error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch all jobs belonging to the authenticated employer's company (all statuses).
   */
  async getEmployerJobs(filters: { status?: JobStatus; page?: number; pageSize?: number } = {}): Promise<ServiceResult<PaginatedResult<Job>>> {
    try {
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('jobs')
        .select('*, company:company_profiles(*)', { count: 'exact' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const normalizedJobs = ((data as any[]) || []).map(normalizeJobEntity);

      return {
        data: {
          data: normalizedJobs,
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
   * Fetch a single job by ID for the authorized employer.
   */
  async getEmployerJobById(jobId: string): Promise<ServiceResult<Job>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, company:company_profiles(*)')
        .eq('id', jobId)
        .maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Job requisition not found.', code: 'NOT_FOUND', status: 404 },
        };
      }

      return { data: normalizeJobEntity(data), error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Create a new job requisition (Draft or Published).
   */
  async createJob(input: JobCreateInput): Promise<ServiceResult<Job>> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required to post a job opening.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      // 1. Authoritative lookup of authenticated employer's company_id
      let targetCompanyId = input.company_id;
      if (!targetCompanyId) {
        const { data: employerProfile, error: empError } = await supabase
          .from('employer_profiles')
          .select('company_id')
          .eq('profile_id', userData.user.id)
          .maybeSingle();

        if (empError || !employerProfile?.company_id) {
          return {
            data: null,
            error: {
              message: 'Employer enterprise profile not found. Please complete employer onboarding first.',
              code: 'COMPANY_NOT_FOUND',
              status: 404,
            },
          };
        }
        targetCompanyId = employerProfile.company_id;
      }

      const generatedSlug =
        input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        Math.random().toString(36).substring(2, 8);

      const payload = {
        company_id: targetCompanyId,
        created_by: userData.user.id,
        employer_id: userData.user.id,
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
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(payload)
        .select('*, company:company_profiles(*)')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: normalizeJobEntity(data), error: null };
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
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: normalizeJobEntity(data), error: null };
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
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('status', 'draft');

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
