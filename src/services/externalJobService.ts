/**
 * KnowToHire Admin-Managed External / Curated Jobs Service
 *
 * ARCHITECTURE NOTE:
 * Dual-layer architecture:
 * 1. REAL SUPABASE MODE: When configured, interacts with public.external_jobs table with RLS.
 * 2. LOCAL / DEMO RESILIENT LAYER: Synchronizes canonical seed external jobs in localStorage,
 *    emitting 'kth_external_jobs_changed' event for instant live multi-tab & CMS reactivity.
 *
 * SECURITY:
 * - Strict URL validation ensuring only http:// and https:// schemes.
 * - Prevents javascript:, data:, and other unsafe execution vectors.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';
import {
  ExternalJob,
  ExternalJobFilterParams,
  CreateExternalJobInput,
  UpdateExternalJobInput,
} from '@/types/externalJob';

const EXTERNAL_JOBS_STORAGE_KEY = 'kth_curated_external_jobs';

/**
 * Validate that a URL uses safe HTTP or HTTPS protocol only.
 */
export function isValidHttpUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Open external redirect URL securely.
 */
export function openExternalJobUrl(url: string): void {
  if (!isValidHttpUrl(url)) {
    console.error('Blocked attempt to open invalid or unsafe URL:', url);
    return;
  }
  window.open(url.trim(), '_blank', 'noopener,noreferrer');
}

export const INITIAL_CANONICAL_EXTERNAL_JOBS: ExternalJob[] = [
  // 1. Latest Jobs
  {
    id: 'ext-job-001',
    title: 'Graduate Trainee Engineer (2026 Batch)',
    company_name: 'Infineon Technologies',
    location: 'Bengaluru, Karnataka',
    description: 'Semiconductor engineering and test automation support.',
    redirect_url: 'https://www.infineon.com/careers/graduate-trainee-2026',
    section: 'latest',
    status: 'published',
    display_order: 1,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 48,
    impression_count: 320,
    created_at: '2026-08-25T10:00:00.000Z',
    updated_at: '2026-08-25T10:00:00.000Z',
  },
  {
    id: 'ext-job-002',
    title: 'Graduate Engineer Trainee (GET)',
    company_name: 'Siemens Energy',
    location: 'Gurugram, Haryana',
    description: 'Power grid operations and clean energy transmission.',
    redirect_url: 'https://jobs.siemens-energy.com/en_US/careers/get-drive-2026',
    section: 'latest',
    status: 'published',
    display_order: 2,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 35,
    impression_count: 280,
    created_at: '2026-08-26T11:00:00.000Z',
    updated_at: '2026-08-26T11:00:00.000Z',
  },
  {
    id: 'ext-job-003',
    title: 'Associate Sustainability Analyst',
    company_name: 'Schneider Electric',
    location: 'Bengaluru, Karnataka',
    description: 'Decarbonization strategy advisory and BRSR reporting.',
    redirect_url: 'https://careers.se.com/jobs/sustainability-analyst-in',
    section: 'latest',
    status: 'published',
    display_order: 3,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 29,
    impression_count: 210,
    created_at: '2026-08-27T09:30:00.000Z',
    updated_at: '2026-08-27T09:30:00.000Z',
  },
  {
    id: 'ext-job-004',
    title: 'Environmental Planning Associate',
    company_name: 'Larsen & Toubro Ltd',
    location: 'Mumbai, Maharashtra',
    description: 'Infrastructure and water management compliance.',
    redirect_url: 'https://www.larsentoubro.com/careers/assessment-2026',
    section: 'latest',
    status: 'published',
    display_order: 4,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 52,
    impression_count: 390,
    created_at: '2026-08-28T14:00:00.000Z',
    updated_at: '2026-08-28T14:00:00.000Z',
  },

  // 2. Fresher Jobs
  {
    id: 'ext-job-005',
    title: 'Junior Software Engineer (Embedded & IoT)',
    company_name: 'Bosch Global Software',
    location: 'Bengaluru, Karnataka',
    description: 'Embedded systems, automotive electronics, and sensor telemetry.',
    redirect_url: 'https://careers.bosch.com/en/job/fresher-campus-2026',
    section: 'fresher',
    status: 'published',
    display_order: 1,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 73,
    impression_count: 540,
    created_at: '2026-08-22T08:00:00.000Z',
    updated_at: '2026-08-22T08:00:00.000Z',
  },
  {
    id: 'ext-job-006',
    title: 'Operations Analyst (BCA / B.Sc)',
    company_name: 'Tata Consultancy Services',
    location: 'Hyderabad, Telangana',
    description: 'Enterprise data operations and systems support.',
    redirect_url: 'https://www.tcs.com/careers/india/tcs-smart-hiring-2026',
    section: 'fresher',
    status: 'published',
    display_order: 2,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 95,
    impression_count: 710,
    created_at: '2026-08-23T12:00:00.000Z',
    updated_at: '2026-08-23T12:00:00.000Z',
  },
  {
    id: 'ext-job-007',
    title: 'Cloud & Applications Analyst',
    company_name: 'Capgemini India',
    location: 'Pune, Maharashtra',
    description: 'Cloud infrastructure, Java platforms, and database tooling.',
    redirect_url: 'https://www.capgemini.com/in-en/careers/exceller-campus-program',
    section: 'fresher',
    status: 'published',
    display_order: 3,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 44,
    impression_count: 360,
    created_at: '2026-08-24T15:30:00.000Z',
    updated_at: '2026-08-24T15:30:00.000Z',
  },

  // 3. Walk-In Interviews
  {
    id: 'ext-job-008',
    title: 'Process Executive (ESG Operations)',
    company_name: 'Cognizant Technology Solutions',
    location: 'Hyderabad, Telangana',
    description: 'In-person drive for process compliance and data validation.',
    redirect_url: 'https://careers.cognizant.com/in/en/walkin-drive-sept2026',
    section: 'walk_in',
    status: 'published',
    display_order: 1,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 61,
    impression_count: 420,
    created_at: '2026-08-29T10:00:00.000Z',
    updated_at: '2026-08-29T10:00:00.000Z',
  },
  {
    id: 'ext-job-009',
    title: 'Network & Cloud Support Associate',
    company_name: 'HCLTech',
    location: 'Noida, Uttar Pradesh',
    description: 'Walk-in screening for network protocols and cloud administration.',
    redirect_url: 'https://www.hcltech.com/careers/walkin-noida-cloud-2026',
    section: 'walk_in',
    status: 'published',
    display_order: 2,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 38,
    impression_count: 290,
    created_at: '2026-08-30T11:30:00.000Z',
    updated_at: '2026-08-30T11:30:00.000Z',
  },
  {
    id: 'ext-job-010',
    title: 'Data Research & Compliance Analyst',
    company_name: 'Wipro Limited',
    location: 'Bengaluru, Karnataka',
    description: 'Spot interview drive for analytical research and reporting.',
    redirect_url: 'https://careers.wipro.com/walk-in-bengaluru-data-2026',
    section: 'walk_in',
    status: 'published',
    display_order: 3,
    published_from: '2026-08-01T00:00:00.000Z',
    published_until: '2026-12-31T23:59:59.000Z',
    link_label: 'View Job',
    click_count: 42,
    impression_count: 310,
    created_at: '2026-08-31T14:00:00.000Z',
    updated_at: '2026-08-31T14:00:00.000Z',
  },
];

class ExternalJobService {
  /**
   * Helper to retrieve jobs from local storage or initialize with canonical seeds.
   */
  private getLocalJobs(): ExternalJob[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return INITIAL_CANONICAL_EXTERNAL_JOBS;
    }

    try {
      const raw = window.localStorage.getItem(EXTERNAL_JOBS_STORAGE_KEY);
      if (!raw) {
        window.localStorage.setItem(
          EXTERNAL_JOBS_STORAGE_KEY,
          JSON.stringify(INITIAL_CANONICAL_EXTERNAL_JOBS)
        );
        return INITIAL_CANONICAL_EXTERNAL_JOBS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_CANONICAL_EXTERNAL_JOBS;
    }
  }

  private saveLocalJobs(jobs: ExternalJob[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(EXTERNAL_JOBS_STORAGE_KEY, JSON.stringify(jobs));
      window.dispatchEvent(new Event('kth_external_jobs_changed'));
    }
  }

  /**
   * Fetch external jobs with optional filters (section, status, search, limit).
   * For public inquiries (status != 'all' and not explicitly 'draft'),
   * automatically checks published_from <= now and published_until >= now.
   */
  async getExternalJobs(
    params?: ExternalJobFilterParams,
    isAdminView = false
  ): Promise<ServiceResult<ExternalJob[]>> {
    // 1. If Supabase is configured and reachable
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('external_jobs').select('*');

        if (params?.section && params.section !== 'all') {
          query = query.eq('section', params.section);
        }

        if (params?.status && params.status !== 'all') {
          query = query.eq('status', params.status);
        } else if (!isAdminView) {
          query = query.eq('status', 'published');
        }

        if (!isAdminView) {
          const nowIso = new Date().toISOString();
          query = query
            .or(`published_from.is.null,published_from.lte.${nowIso}`)
            .or(`published_until.is.null,published_until.gte.${nowIso}`);
        }

        query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });

        if (params?.limit) {
          query = query.limit(params.limit);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let results = data as ExternalJob[];
          if (params?.search?.trim()) {
            const q = params.search.trim().toLowerCase();
            results = results.filter(
              (j) =>
                j.title.toLowerCase().includes(q) ||
                (j.company_name && j.company_name.toLowerCase().includes(q)) ||
                (j.location && j.location.toLowerCase().includes(q))
            );
          }
          return { data: results, error: null };
        }
      } catch {
        // fall through to local store
      }
    }

    // 2. Local Fallback Layer
    try {
      let jobs = this.getLocalJobs();
      const now = new Date().getTime();

      if (params?.section && params.section !== 'all') {
        jobs = jobs.filter((j) => j.section === params.section);
      }

      if (params?.status && params.status !== 'all') {
        jobs = jobs.filter((j) => j.status === params.status);
      } else if (!isAdminView) {
        jobs = jobs.filter((j) => j.status === 'published');
      }

      if (!isAdminView) {
        jobs = jobs.filter((j) => {
          if (j.published_from) {
            const pFrom = new Date(j.published_from).getTime();
            if (pFrom > now) return false;
          }
          if (j.published_until) {
            const pUntil = new Date(j.published_until).getTime();
            if (pUntil < now) return false;
          }
          return true;
        });
      }

      if (params?.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        jobs = jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            (j.company_name && j.company_name.toLowerCase().includes(q)) ||
            (j.location && j.location.toLowerCase().includes(q))
        );
      }

      // Sort display_order ASC, then created_at DESC
      jobs.sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      if (params?.limit) {
        jobs = jobs.slice(0, params.limit);
      }

      return { data: jobs, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * Get single external job by ID.
   */
  async getExternalJobById(id: string): Promise<ServiceResult<ExternalJob>> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('external_jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return { data: data as ExternalJob, error: null };
        }
      } catch {
        // fallback
      }
    }

    const jobs = this.getLocalJobs();
    const found = jobs.find((j) => j.id === id);
    if (!found) {
      return { data: null, error: { message: 'External job not found', code: 'NOT_FOUND' } };
    }
    return { data: found, error: null };
  }

  /**
   * Create a new external job (Admin only).
   */
  async createExternalJob(
    input: CreateExternalJobInput,
    userId?: string
  ): Promise<ServiceResult<ExternalJob>> {
    // 1. Validate required fields & safe URL
    if (!input.title?.trim()) {
      return { data: null, error: { message: 'Job title is required', code: 'VALIDATION_ERROR' } };
    }
    if (!input.redirect_url?.trim()) {
      return { data: null, error: { message: 'Redirect URL is required', code: 'VALIDATION_ERROR' } };
    }
    if (!isValidHttpUrl(input.redirect_url)) {
      return {
        data: null,
        error: {
          message: 'Invalid redirect URL. Must start with http:// or https://',
          code: 'SECURITY_VALIDATION_FAILED',
        },
      };
    }

    const nowIso = new Date().toISOString();
    const newJob: ExternalJob = {
      id: `ext-job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: input.title.trim(),
      redirect_url: input.redirect_url.trim(),
      section: input.section,
      status: input.status || 'draft',
      company_name: input.company_name?.trim() || null,
      location: input.location?.trim() || null,
      description: input.description?.trim() || null,
      display_order: Number(input.display_order) || 0,
      published_from: input.published_from || null,
      published_until: input.published_until || null,
      link_label: input.link_label?.trim() || 'View Job',
      click_count: 0,
      impression_count: 0,
      created_by: userId || null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('external_jobs')
          .insert([newJob])
          .select()
          .single();

        if (!error && data) {
          const created = data as ExternalJob;
          const local = this.getLocalJobs();
          this.saveLocalJobs([created, ...local]);
          return { data: created, error: null };
        }
      } catch {
        // fallback
      }
    }

    const current = this.getLocalJobs();
    this.saveLocalJobs([newJob, ...current]);
    return { data: newJob, error: null };
  }

  /**
   * Update an existing external job (Admin only).
   */
  async updateExternalJob(
    id: string,
    updates: UpdateExternalJobInput
  ): Promise<ServiceResult<ExternalJob>> {
    if (updates.redirect_url !== undefined) {
      if (!isValidHttpUrl(updates.redirect_url)) {
        return {
          data: null,
          error: {
            message: 'Invalid redirect URL. Must start with http:// or https://',
            code: 'SECURITY_VALIDATION_FAILED',
          },
        };
      }
    }

    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('external_jobs')
          .update({ ...updates, updated_at: nowIso })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const updated = data as ExternalJob;
          const current = this.getLocalJobs().map((j) => (j.id === id ? updated : j));
          this.saveLocalJobs(current);
          return { data: updated, error: null };
        }
      } catch {
        // fallback
      }
    }

    const current = this.getLocalJobs();
    const idx = current.findIndex((j) => j.id === id);
    if (idx === -1) {
      return { data: null, error: { message: 'External job not found', code: 'NOT_FOUND' } };
    }

    const updated: ExternalJob = {
      ...current[idx],
      ...updates,
      updated_at: nowIso,
    };
    current[idx] = updated;
    this.saveLocalJobs(current);
    return { data: updated, error: null };
  }

  /**
   * Delete an external job (Admin only).
   */
  async deleteExternalJob(id: string): Promise<ServiceResult<boolean>> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('external_jobs').delete().eq('id', id);
        if (!error) {
          const current = this.getLocalJobs().filter((j) => j.id !== id);
          this.saveLocalJobs(current);
          return { data: true, error: null };
        }
      } catch {
        // fallback
      }
    }

    const current = this.getLocalJobs().filter((j) => j.id !== id);
    this.saveLocalJobs(current);
    return { data: true, error: null };
  }

  /**
   * Track an impression on external jobs (lightweight analytics).
   */
  async recordImpressions(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;

    try {
      const current = this.getLocalJobs();
      let changed = false;
      ids.forEach((id) => {
        const item = current.find((j) => j.id === id);
        if (item) {
          item.impression_count = (item.impression_count || 0) + 1;
          changed = true;
        }
      });
      if (changed) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(EXTERNAL_JOBS_STORAGE_KEY, JSON.stringify(current));
        }
      }
    } catch {
      // non-blocking
    }
  }

  /**
   * Track a click on an external job (lightweight analytics).
   */
  async recordClick(id: string): Promise<void> {
    try {
      const current = this.getLocalJobs();
      const item = current.find((j) => j.id === id);
      if (item) {
        item.click_count = (item.click_count || 0) + 1;
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(EXTERNAL_JOBS_STORAGE_KEY, JSON.stringify(current));
        }
      }
    } catch {
      // non-blocking
    }
  }
}

export const externalJobService = new ExternalJobService();
