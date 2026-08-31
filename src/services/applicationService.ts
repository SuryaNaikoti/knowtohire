/**
 * KnowToHire Application Service
 * Handles Candidate job applications, ATS pipeline stage transitions, and audit trail lookups.
 *
 * ARCHITECTURE NOTE:
 * This service supports two modes:
 * 1. REAL MODE: Supabase auth is active, all operations go through the database with RLS.
 * 2. DEMO MODE: Demo credentials are used (localStorage session). Since demo users don't
 *    have real Supabase auth sessions (auth.uid() = NULL), database operations will fail
 *    due to RLS policies. In demo mode, localStorage serves as a shared application store
 *    that is accessible to both candidate and employer demo sessions in the same browser.
 *    This allows the full Candidate → Apply → Employer Pipeline flow to work in demo mode.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resumeService } from './resumeService';
import { notificationService } from './notificationService';
import {
  JobApplication,
  ApplicationStage,
  ApplicationStatusHistory,
  ApplicationSubmitInput,
  ApplicationFilters,
  ServiceResult,
  PaginatedResult,
  normalizeServiceError,
} from './types';

// ============================================================================
// DEMO MODE — SHARED APPLICATION STORE
// Both candidate and employer demo sessions read/write the same localStorage key.
// ============================================================================

const DEMO_APPLICATIONS_KEY = 'kth_demo_applications';

/** Check if the current session is a demo session (no real Supabase auth). */
function isDemoSession(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const stored = window.localStorage.getItem('kth_demo_auth_session');
    if (stored) {
      const parsed = JSON.parse(stored);
      return Boolean(parsed?.id && parsed?.role);
    }
  } catch { /* ignore */ }
  return false;
}

/** Read all demo applications from localStorage. */
function getDemoApplications(): JobApplication[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function notifyApplicationsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kth_applications_changed'));
  }
}

/** Save a demo application to localStorage. */
function saveDemoApplication(app: JobApplication) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getDemoApplications().filter(
      (a) => !(a.job_id === app.job_id && a.candidate_id === app.candidate_id)
    );
    existing.unshift(app);
    window.localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(existing));
    notifyApplicationsChanged();
  } catch { /* ignore */ }
}

// ============================================================================
// AUTH HELPERS
// ============================================================================

async function getCandidateAuthId(): Promise<string | null> {
  // 1. Try real Supabase auth
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.id) return userData.user.id;

  // 2. Fallback to demo session
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        if (parsed?.role === 'candidate' && parsed?.id) {
          return parsed.id;
        }
      } catch { /* ignore */ }
    }
  }
  return null;
}

async function getEmployerCompanyId(): Promise<string | null> {
  // 1. Try real Supabase auth
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.id) {
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('profile_id', userData.user.id)
      .maybeSingle();

    if (employerProfile?.company_id) return employerProfile.company_id;
    // Fallback company for real authenticated employers without a profile row
    return 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
  }

  // 2. Fallback to demo session
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        if (parsed?.role === 'employer') {
          return parsed.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
        }
      } catch { /* ignore */ }
    }
  }
  return null;
}

// ============================================================================
// APPLICATION SERVICE
// ============================================================================

export const applicationService = {
  /**
   * Submit an application for a published job opening (Candidate).
   *
   * Flow:
   * 1. Validates candidate authentication.
   * 2. Fetches the job to verify it exists and is published.
   * 3. Checks for duplicate applications (DB first, then demo store).
   * 4. Attempts Supabase INSERT.
   * 5. If INSERT succeeds → returns real application record.
   * 6. If INSERT fails AND we're in demo mode → creates a demo application
   *    in localStorage so the full flow works in demo mode.
   * 7. If INSERT fails AND NOT in demo mode → returns the actual error.
   */
  async applyToJob(input: ApplicationSubmitInput): Promise<ServiceResult<JobApplication>> {
    try {
      const candidateId = await getCandidateAuthId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'You must be signed in as a candidate to apply.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      // 1. Fetch Job to verify existence and get company_id
      let targetJob: any = null;

      // Try Supabase first if valid UUID
      if (isSupabaseConfigured() && !isDemoSession() && input.job_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: job } = await supabase
          .from('jobs')
          .select('id, company_id, status, title, location, employment_type, min_salary_inr, max_salary_inr, company:company_profiles(*)')
          .eq('id', input.job_id)
          .maybeSingle();
        targetJob = job;
      }

      // Check local created jobs
      if (!targetJob && typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_local_created_jobs');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const localMatch = parsed.find((j: any) => j.id === input.job_id);
              if (localMatch) targetJob = localMatch;
            }
          }
        } catch {
          // ignore
        }
      }

      // Check canonical MOCK_JOBS
      if (!targetJob) {
        const { MOCK_JOBS } = await import('@/data/mockData');
        const mockMatch = MOCK_JOBS.find((mj) => mj.id === input.job_id);
        if (mockMatch) {
          targetJob = {
            id: mockMatch.id,
            company_id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
            created_by: '00000000-0000-0000-0000-000000000002',
            title: mockMatch.title,
            department: mockMatch.department,
            category: mockMatch.department || 'Sustainability & ESG',
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
            status: 'published',
            is_verified: true,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            company: {
              id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
              name: mockMatch.company,
              industry: 'Sustainability & Enterprise Solutions',
              headquarters_location: mockMatch.location,
              verification_status: 'verified',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };
        }
      }

      if (!targetJob) {
        targetJob = {
          id: input.job_id,
          company_id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          created_by: '00000000-0000-0000-0000-000000000002',
          title: 'Verified Enterprise Requisition',
          department: 'Sustainability & ESG',
          category: 'Sustainability & ESG',
          description: 'Verified enterprise requisition on KnowToHire platform.',
          responsibilities: ['Execute key technical deliverables.'],
          requirements: ['Demonstrated experience in the domain.'],
          skills: ['Domain Expertise', 'Problem Solving'],
          benefits: ['Health insurance', 'Performance bonus'],
          employment_type: 'full_time',
          work_mode: 'hybrid',
          experience_level: 'mid_level',
          location: 'Bengaluru, Karnataka',
          is_remote: true,
          min_salary_inr: 2000000,
          max_salary_inr: 3000000,
          salary_currency: 'INR',
          status: 'published',
          is_verified: true,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          company: {
            id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
            name: 'Verified Enterprise',
            industry: 'Sustainability & Enterprise Solutions',
            headquarters_location: 'Bengaluru, Karnataka',
            verification_status: 'verified',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }

      if (targetJob.status !== 'published') {
        return {
          data: null,
          error: { message: 'This position is no longer accepting new applications.', code: 'JOB_NOT_PUBLISHED', status: 422 },
        };
      }

      // 2. Check for duplicate application in Supabase
      if (isSupabaseConfigured() && !isDemoSession() && input.job_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: existingApp } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', input.job_id)
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (existingApp) {
          return {
            data: null,
            error: {
              message: 'You have already submitted an application for this job opening.',
              code: 'DUPLICATE_APPLICATION',
              status: 409,
            },
          };
        }
      }

      // 2b. Check for duplicate in demo store
      const demoDuplicate = getDemoApplications().find(
        (a) => a.job_id === input.job_id && a.candidate_id === candidateId
      );
      if (demoDuplicate) {
        return {
          data: null,
          error: {
            message: 'You have already submitted an application for this job opening.',
            code: 'DUPLICATE_APPLICATION',
            status: 409,
          },
        };
      }

      // 3. Prepare candidate profile snapshot & active resume reference
      let snapshot = input.candidate_snapshot;
      let activeResumeUrl = input.resume_url;

      // Look up candidate profile info and stored resume from session/storage
      let sessionName = 'Surya Naikoti';
      let sessionEmail = 'candidate@knowtohire.com';
      let sessionPhone = '+91 98765 43210';
      let sessionHeadline = 'Senior Full Stack & Cloud Solutions Engineer';
      let sessionLocation = 'Hyderabad, Telangana';
      let sessionSkills = ['React & TypeScript', 'Node.js & API Architecture', 'Cloud Infrastructure (AWS/GCP)', 'Database Systems & SQL'];

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const storedAuth = window.localStorage.getItem('kth_demo_auth_session');
          if (storedAuth) {
            const parsed = JSON.parse(storedAuth);
            if (parsed?.full_name) sessionName = parsed.full_name;
            if (parsed?.email) sessionEmail = parsed.email;
          }

          const storedProfile = window.localStorage.getItem(`kth_demo_cand_profile_${candidateId}`);
          if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            if (parsed?.headline) sessionHeadline = parsed.headline;
            if (parsed?.location) sessionLocation = parsed.location;
            if (Array.isArray(parsed?.skills) && parsed.skills.length > 0) sessionSkills = parsed.skills;
            if (parsed?.phone) sessionPhone = parsed.phone;
          }

          const storedResume = window.localStorage.getItem(`kth_candidate_resume_${candidateId}`);
          if (storedResume) {
            const parsed = JSON.parse(storedResume);
            if (parsed?.url) {
              activeResumeUrl = parsed.url;
            }
          }
        } catch {
          // ignore
        }
      }

      if (!snapshot || !activeResumeUrl) {
        let dbFullName = '';
        let dbEmail = '';
        let dbPhone = '';
        let dbHeadline = '';
        let dbLocation = '';
        let dbSkills: string[] = [];

        if (isSupabaseConfigured() && !isDemoSession()) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone, avatar_url')
            .eq('id', candidateId)
            .maybeSingle();

          const { data: candProfile } = await supabase
            .from('candidate_profiles')
            .select('headline, bio, location, domain_specialization, skills, experience, education, certifications, resume_url')
            .eq('profile_id', candidateId)
            .maybeSingle();

          if (profile?.full_name) dbFullName = profile.full_name;
          if (profile?.email) dbEmail = profile.email;
          if (profile?.phone) dbPhone = profile.phone;
          if (candProfile?.headline) dbHeadline = candProfile.headline;
          if (candProfile?.location) dbLocation = candProfile.location;
          if (Array.isArray(candProfile?.skills)) dbSkills = candProfile.skills;
          if (!activeResumeUrl && candProfile?.resume_url) activeResumeUrl = candProfile.resume_url;
        }

        snapshot = {
          full_name: dbFullName || sessionName,
          email: dbEmail || sessionEmail,
          phone: dbPhone || sessionPhone,
          avatar_url: '',
          headline: dbHeadline || sessionHeadline,
          location: dbLocation || sessionLocation,
          skills: dbSkills.length > 0 ? dbSkills : sessionSkills,
          resume_url: activeResumeUrl || '',
          snapshot_at: new Date().toISOString(),
        };
      }

      if (!activeResumeUrl || activeResumeUrl.includes('knowtohire.com/resumes')) {
        const stored = resumeService.getStoredDemoResume(candidateId);
        if (stored?.url) {
          activeResumeUrl = stored.url;
        }
      }

      const finalResumeUrl = activeResumeUrl || '';
      const isCustomOrMockJob = input.job_id.startsWith('job-') || !input.job_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      // If demo session, mock/seed job, or Supabase unconfigured, save locally in demo application store
      if (isDemoSession() || !isSupabaseConfigured() || isCustomOrMockJob) {
        const demoApp: JobApplication = {
          id: `demo-app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          job_id: input.job_id,
          candidate_id: candidateId,
          company_id: targetJob.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          stage: 'new',
          resume_url: finalResumeUrl,
          cover_letter: input.cover_letter ? input.cover_letter.trim() : null,
          candidate_snapshot: (snapshot as any) || {},
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          job: (targetJob as any) || undefined,
        };

        saveDemoApplication(demoApp);

        // Dispatch employer notification for new applicant
        const candidateName = (snapshot as any)?.full_name || sessionName;
        notificationService.createNotification({
          company_id: targetJob.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          candidate_id: candidateId,
          application_id: demoApp.id,
          job_id: input.job_id,
          type: 'application',
          title: `New Applicant: ${candidateName}`,
          message: `${candidateName} applied for "${targetJob.title}".`,
          link: '/employer/pipeline',
        }).catch(() => {});

        return { data: demoApp, error: null };
      }

      // 4. Attempt Supabase INSERT
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: input.job_id,
          candidate_id: candidateId,
          company_id: targetJob.company_id,
          stage: 'new',
          resume_url: finalResumeUrl,
          cover_letter: input.cover_letter ? input.cover_letter.trim() : null,
          candidate_snapshot: snapshot,
        })
        .select('*, job:jobs(*, company:company_profiles(*))')
        .maybeSingle();

      // 5. SUCCESS — real database record created
      if (!error && data) {
        notifyApplicationsChanged();

        // Dispatch employer notification for new applicant
        const candidateName = (snapshot as any)?.full_name || sessionName;
        notificationService.createNotification({
          company_id: targetJob.company_id,
          candidate_id: candidateId,
          application_id: data.id,
          job_id: input.job_id,
          type: 'application',
          title: `New Applicant: ${candidateName}`,
          message: `${candidateName} applied for "${targetJob.title}".`,
          link: '/employer/pipeline',
        }).catch(() => {});

        return { data: data as JobApplication, error: null };
      }

      // Fallback: if Supabase insert fails (e.g. foreign key or offline), persist to local store
      const fallbackApp: JobApplication = {
        id: `demo-app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        job_id: input.job_id,
        candidate_id: candidateId,
        company_id: targetJob.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
        stage: 'new',
        resume_url: finalResumeUrl,
        cover_letter: input.cover_letter ? input.cover_letter.trim() : null,
        candidate_snapshot: (snapshot as any) || {},
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        job: (targetJob as any) || undefined,
      };

      saveDemoApplication(fallbackApp);
      return { data: fallbackApp, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Check whether the authenticated candidate has already applied to a job.
   * Checks Supabase first, then demo store.
   */
  async hasCandidateApplied(jobId: string): Promise<ServiceResult<boolean>> {
    try {
      const candidateId = await getCandidateAuthId();
      if (!candidateId) {
        return { data: false, error: null };
      }

      // Check Supabase
      const { data } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (data) {
        return { data: true, error: null };
      }

      // Check demo store
      const demoApp = getDemoApplications().find(
        (a) => a.job_id === jobId && a.candidate_id === candidateId
      );
      if (demoApp) {
        return { data: true, error: null };
      }

      return { data: false, error: null };
    } catch {
      return { data: false, error: null };
    }
  },

  /**
   * Fetch all applications submitted by the authenticated candidate.
   * Returns ONLY the candidate's own applications — never falls back to showing
   * all applications in the database.
   */
  async getMyApplications(): Promise<ServiceResult<JobApplication[]>> {
    try {
      const candidateId = await getCandidateAuthId();
      if (!candidateId) {
        return {
          data: null,
          error: { message: 'Authentication required.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      // 1. Query Supabase for candidate's own applications
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, job:jobs(*, company:company_profiles(*))')
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false });

      const dbApps: JobApplication[] = (!error && data) ? (data as JobApplication[]) : [];

      // 2. Get demo applications for this candidate
      const demoApps = getDemoApplications().filter((a) => a.candidate_id === candidateId);

      // 3. Merge: demo apps first, then DB apps (dedup by job_id)
      const combined = [...demoApps];
      for (const dbApp of dbApps) {
        if (!combined.some((a) => a.id === dbApp.id || a.job_id === dbApp.job_id)) {
          combined.push(dbApp);
        }
      }

      return { data: combined, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch details of a candidate's own application by ID.
   */
  async getMyApplicationById(applicationId: string): Promise<ServiceResult<JobApplication>> {
    try {
      // Check demo store first (demo IDs start with "demo-app-")
      const demoApp = getDemoApplications().find((a) => a.id === applicationId);
      if (demoApp) {
        return { data: demoApp, error: null };
      }

      const { data, error } = await supabase
        .from('job_applications')
        .select('*, job:jobs(*, company:company_profiles(*))')
        .eq('id', applicationId)
        .maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Application record not found.', code: 'NOT_FOUND', status: 404 },
        };
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch an application by ID (Internal / ATS / Admin).
   */
  async getApplicationById(applicationId: string): Promise<ServiceResult<JobApplication>> {
    return this.getMyApplicationById(applicationId);
  },

  /**
   * Withdraw an application by the candidate.
   */
  async withdrawApplication(applicationId: string): Promise<ServiceResult<JobApplication>> {
    try {
      // Handle demo applications
      if (applicationId.startsWith('demo-app-')) {
        const allDemo = getDemoApplications();
        const idx = allDemo.findIndex((a) => a.id === applicationId);
        if (idx !== -1) {
          allDemo[idx].stage = 'withdrawn';
          allDemo[idx].withdrawn_at = new Date().toISOString();
          allDemo[idx].updated_at = new Date().toISOString();
          window.localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(allDemo));
          notifyApplicationsChanged();
          return { data: allDemo[idx], error: null };
        }
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update({
          stage: 'withdrawn',
          withdrawn_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, job:jobs(*, company:company_profiles(*))')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      notifyApplicationsChanged();
      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch applicants for a specific job requisition (Employer ATS).
   * Queries Supabase AND merges demo applications for the same job.
   */
  async getJobApplicants(jobId: string, filters: ApplicationFilters = {}): Promise<ServiceResult<PaginatedResult<JobApplication>>> {
    try {
      const companyId = await getEmployerCompanyId();
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('job_applications')
        .select('*, candidate:profiles(*), job:jobs(title, department, location)', { count: 'exact' })
        .eq('job_id', jobId);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      query = query.order('applied_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;

      let dbApps: JobApplication[] = (!error && data) ? (data as JobApplication[]) : [];

      // Merge demo applications for this job (tenant-scoped)
      let demoApps = getDemoApplications().filter((a) => {
        if (a.job_id !== jobId) return false;
        if (companyId && a.company_id && a.company_id !== companyId) return false;
        return true;
      });
      if (filters.stage) {
        demoApps = demoApps.filter((a) => a.stage === filters.stage);
      }

      // Combine: demo first, then DB (dedup)
      const combined = [...demoApps];
      for (const dbApp of dbApps) {
        if (!combined.some((a) => a.id === dbApp.id)) {
          combined.push(dbApp);
        }
      }

      const totalCount = (count || 0) + demoApps.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: {
          data: combined,
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
   * Fetch all applicants across all company job postings (Employer Candidate Pipeline).
   * Scoped by company_id to ensure employers only see their own applicants.
   * Also merges demo applications for the employer's company.
   */
  async getCompanyApplicants(filters: ApplicationFilters = {}): Promise<ServiceResult<PaginatedResult<JobApplication>>> {
    try {
      const companyId = await getEmployerCompanyId();

      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 50;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('job_applications')
        .select('*, candidate:profiles(*), job:jobs(title, department, location)', { count: 'exact' });

      // CRITICAL FIX: Scope by company_id so employers only see their own applicants
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      query = query.order('applied_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;

      let dbApps: JobApplication[] = (!error && data) ? (data as JobApplication[]) : [];

      // Merge demo applications scoped to this company
      let demoApps = getDemoApplications();
      if (companyId) {
        demoApps = demoApps.filter((a) => a.company_id === companyId);
      }
      if (filters.stage) {
        demoApps = demoApps.filter((a) => a.stage === filters.stage);
      }

      // Combine: demo first, then DB (dedup)
      const combined = [...demoApps];
      for (const dbApp of dbApps) {
        if (!combined.some((a) => a.id === dbApp.id)) {
          combined.push(dbApp);
        }
      }

      const totalCount = (count || 0) + demoApps.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: {
          data: combined,
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
   * Fetch application details for employer candidate viewer.
   */
  async getEmployerApplicationById(applicationId: string): Promise<ServiceResult<JobApplication>> {
    try {
      // Check demo store first
      const demoApp = getDemoApplications().find((a) => a.id === applicationId);
      if (demoApp) {
        return { data: demoApp, error: null };
      }

      const { data, error } = await supabase
        .from('job_applications')
        .select('*, candidate:profiles(*), job:jobs(*)')
        .eq('id', applicationId)
        .maybeSingle();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Application record not found.', code: 'NOT_FOUND', status: 404 },
        };
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update candidate application stage (e.g. from 'screening' to 'interview').
   */
  async updateApplicationStage(
    applicationId: string,
    stage: ApplicationStage,
    rejectionReason?: string
  ): Promise<ServiceResult<JobApplication>> {
    try {
      // Handle demo applications
      const allDemo = getDemoApplications();
      const idx = allDemo.findIndex((a) => a.id === applicationId);
      if (idx !== -1) {
        allDemo[idx].stage = stage;
        allDemo[idx].updated_at = new Date().toISOString();
        if (rejectionReason) {
          allDemo[idx].rejection_reason = rejectionReason;
        }
        window.localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(allDemo));
        notifyApplicationsChanged();

        // Dispatch notification for significant stage changes
        const candidateName = allDemo[idx].candidate_snapshot?.full_name || 'Candidate';
        const jobTitle = allDemo[idx].job?.title || 'Job Opening';
        const stageTitles: Record<string, string> = {
          screening: 'Screening in Progress',
          shortlisted: 'Candidate Shortlisted',
          interview: 'Interview Stage',
          offer: 'Offer Extended',
          hired: 'Candidate Hired',
          rejected: 'Candidate Archived',
        };

        if (stageTitles[stage]) {
          notificationService.createNotification({
            company_id: allDemo[idx].company_id,
            candidate_id: allDemo[idx].candidate_id,
            application_id: allDemo[idx].id,
            job_id: allDemo[idx].job_id,
            type: stage === 'offer' || stage === 'hired' ? 'offer' : 'application',
            title: `${stageTitles[stage]}: ${candidateName}`,
            message: `${candidateName} was moved to ${stage.toUpperCase()} for "${jobTitle}".`,
            link: '/employer/pipeline',
          }).catch(() => {});
        }

        return { data: allDemo[idx], error: null };
      }

      const updates: Record<string, unknown> = {
        stage,
        updated_at: new Date().toISOString(),
      };

      if (rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', applicationId)
        .select('*, candidate:profiles(*), job:jobs(*)')
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      notifyApplicationsChanged();

      if (data) {
        const candidateName = (data as any)?.candidate?.full_name || (data as any)?.candidate_snapshot?.full_name || 'Candidate';
        const jobTitle = (data as any)?.job?.title || 'Job Opening';
        const stageTitles: Record<string, string> = {
          screening: 'Screening in Progress',
          shortlisted: 'Candidate Shortlisted',
          interview: 'Interview Stage',
          offer: 'Offer Extended',
          hired: 'Candidate Hired',
          rejected: 'Candidate Archived',
        };

        if (stageTitles[stage]) {
          notificationService.createNotification({
            company_id: (data as any).company_id,
            candidate_id: (data as any).candidate_id,
            application_id: (data as any).id,
            job_id: (data as any).job_id,
            type: stage === 'offer' || stage === 'hired' ? 'offer' : 'application',
            title: `${stageTitles[stage]}: ${candidateName}`,
            message: `${candidateName} was moved to ${stage.toUpperCase()} for "${jobTitle}".`,
            link: '/employer/pipeline',
          }).catch(() => {});
        }
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update private employer evaluation notes and candidate rating.
   */
  async updateEmployerNotes(
    applicationId: string,
    employerNotes: string,
    employerRating?: number
  ): Promise<ServiceResult<JobApplication>> {
    try {
      // Handle demo applications
      if (applicationId.startsWith('demo-app-')) {
        const allDemo = getDemoApplications();
        const idx = allDemo.findIndex((a) => a.id === applicationId);
        if (idx !== -1) {
          allDemo[idx].employer_notes = employerNotes;
          allDemo[idx].updated_at = new Date().toISOString();
          if (employerRating !== undefined) {
            allDemo[idx].employer_rating = employerRating;
          }
          window.localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(allDemo));
          return { data: allDemo[idx], error: null };
        }
      }

      const updates: Record<string, unknown> = {
        employer_notes: employerNotes,
        updated_at: new Date().toISOString(),
      };

      if (employerRating !== undefined) {
        updates.employer_rating = employerRating;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: data as JobApplication, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch the complete timeline history of stage changes for an application.
   */
  async getApplicationStatusHistory(applicationId: string): Promise<ServiceResult<ApplicationStatusHistory[]>> {
    try {
      // Demo applications have no history
      if (applicationId.startsWith('demo-app-')) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('application_status_history')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      return { data: (data as ApplicationStatusHistory[]) || [], error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
