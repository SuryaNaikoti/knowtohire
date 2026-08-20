/**
 * KnowToHire Admin Service
 * Real Supabase operations for platform administration, user management, company verification, job moderation, and KPI aggregation.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from './types';

export interface AdminMetrics {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  activeJobs: number;
  totalApplications: number;
  totalInterviews: number;
  totalResources: number;
  totalTemplates: number;
  totalRequests: number;
  totalBlogPosts: number;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  full_name: string;
  role: 'candidate' | 'employer' | 'admin';
  status: 'unverified' | 'pending_onboarding' | 'active' | 'suspended';
  phone?: string;
  created_at: string;
}

export interface AdminCompanyRecord {
  id: string;
  name: string;
  industry?: string;
  headquarters_location?: string;
  verification_status: 'unverified' | 'pending_review' | 'verified' | 'rejected';
  created_at: string;
}

export interface AdminJobRecord {
  id: string;
  title: string;
  company_name: string;
  status: 'draft' | 'published' | 'paused' | 'closed';
  category: string;
  location: string;
  created_at: string;
}

export const adminService = {
  /**
   * Fetch platform-wide metrics with exact real database counts.
   */
  async getAdminDashboardMetrics(): Promise<ServiceResult<AdminMetrics>> {
    try {
      const [
        usersRes,
        candRes,
        empRes,
        jobsRes,
        appsRes,
        interviewsRes,
        resourcesRes,
        templatesRes,
        requestsRes,
        blogRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('candidate_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('employer_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
        supabase.from('interviews').select('*', { count: 'exact', head: true }),
        supabase.from('resources').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('templates').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('resource_requests').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      ]);

      const metrics: AdminMetrics = {
        totalUsers: usersRes.count || 0,
        totalCandidates: candRes.count || 0,
        totalEmployers: empRes.count || 0,
        activeJobs: jobsRes.count || 0,
        totalApplications: appsRes.count || 0,
        totalInterviews: interviewsRes.count || 0,
        totalResources: resourcesRes.count || 0,
        totalTemplates: templatesRes.count || 0,
        totalRequests: requestsRes.count || 0,
        totalBlogPosts: blogRes.count || 0,
      };

      return { data: metrics, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch all users for Admin management.
   */
  async getUsers(search?: string, roleFilter?: string): Promise<ServiceResult<AdminUserRecord[]>> {
    try {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

      if (search && search.trim()) {
        const term = search.trim();
        query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
      }

      if (roleFilter && roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const users: AdminUserRecord[] = (data || []).map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name || 'Anonymous User',
        role: u.role || 'candidate',
        status: u.status || 'active',
        phone: u.phone,
        created_at: u.created_at,
      }));

      return { data: users, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Update a user's account status (e.g. active / suspended).
   */
  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch companies for employer verification management.
   */
  async getCompanies(): Promise<ServiceResult<AdminCompanyRecord[]>> {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const companies: AdminCompanyRecord[] = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        industry: c.industry,
        headquarters_location: c.headquarters_location,
        verification_status: c.verification_status || 'unverified',
        created_at: c.created_at,
      }));

      return { data: companies, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Verify or reject a company profile.
   */
  async updateCompanyVerification(
    companyId: string,
    status: 'verified' | 'rejected' | 'pending_review'
  ): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({ verification_status: status })
        .eq('id', companyId);

      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Fetch all jobs for Admin moderation.
   */
  async getJobs(): Promise<ServiceResult<AdminJobRecord[]>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, status, category, location, created_at, company:company_profiles(name)')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobs: AdminJobRecord[] = (data || []).map((j: any) => ({
        id: j.id,
        title: j.title || 'Untitled Job',
        company_name: j.company?.name || 'Unknown Company',
        status: j.status || 'draft',
        category: j.category || 'General',
        location: j.location || 'India',
        created_at: j.created_at,
      }));

      return { data: jobs, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Moderate job status (publish, pause, close).
   */
  async updateJobStatus(jobId: string, status: 'published' | 'paused' | 'closed'): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId);
      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
