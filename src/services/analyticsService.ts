/**
 * KnowToHire Module 02 Analytics Service
 * Multi-Tenant, RLS-Enforced Recruitment & Hiring Analytics Service.
 */

import { supabase } from '@/lib/supabase';
import {
  ServiceResult,
  normalizeServiceError,
  AnalyticsFilters,
  AnalyticsTimeRange,
  RecruitmentOverview,
  FunnelStageMetric,
  ApplicantTrendPoint,
  ChannelAttribution,
  TimeToHireMetrics,
  JobPerformanceMetric,
  ApplicationStage,
} from './types';

class AnalyticsService {
  /**
   * Authoritative lookup of authenticated employer's company_id.
   */
  private async getAuthenticatedCompanyId(): Promise<{ companyId: string | null; error: any }> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { companyId: null, error: userError || new Error('Authentication required.') };
    }

    const { data: employerProfile, error: employerError } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (employerError || !employerProfile?.company_id) {
      return {
        companyId: null,
        error: employerError || new Error('Employer company profile not found.'),
      };
    }

    return { companyId: employerProfile.company_id, error: null };
  }

  /**
   * Calculates ISO start date string based on filter range.
   */
  private calculateStartDate(timeRange: AnalyticsTimeRange = '30days', customStart?: string): string | null {
    if (customStart) return new Date(customStart).toISOString();
    if (timeRange === 'all') return null;

    const now = new Date();
    switch (timeRange) {
      case '7days':
        now.setDate(now.getDate() - 7);
        break;
      case '30days':
        now.setDate(now.getDate() - 30);
        break;
      case '90days':
        now.setDate(now.getDate() - 90);
        break;
      case '6months':
        now.setMonth(now.getMonth() - 6);
        break;
      case '12months':
        now.setFullYear(now.getFullYear() - 1);
        break;
      default:
        now.setDate(now.getDate() - 30);
    }
    return now.toISOString();
  }

  /**
   * 1. Overview KPIs
   */
  async getRecruitmentOverview(filters?: AnalyticsFilters): Promise<ServiceResult<RecruitmentOverview>> {
    try {
      const { companyId, error: compErr } = await this.getAuthenticatedCompanyId();
      if (compErr || !companyId) {
        return { data: null, error: normalizeServiceError(compErr) };
      }

      const startDate = this.calculateStartDate(filters?.timeRange, filters?.startDate);

      // Active jobs count
      const { count: activeJobsCount, error: jobsErr } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'published');

      if (jobsErr) {
        return { data: null, error: normalizeServiceError(jobsErr) };
      }

      // Applications aggregation
      let appsQuery = supabase
        .from('job_applications')
        .select('id, stage, applied_at, updated_at')
        .eq('company_id', companyId);

      if (filters?.jobId && filters.jobId !== 'all') {
        appsQuery = appsQuery.eq('job_id', filters.jobId);
      }
      if (startDate) {
        appsQuery = appsQuery.gte('applied_at', startDate);
      }
      if (filters?.endDate) {
        appsQuery = appsQuery.lte('applied_at', new Date(filters.endDate).toISOString());
      }

      const { data: applications, error: appsErr } = await appsQuery;
      if (appsErr) {
        return { data: null, error: normalizeServiceError(appsErr) };
      }

      const appsList = applications || [];
      const totalApplicants = appsList.length;

      let shortlistedCount = 0;
      let interviewStageCount = 0;
      let offersCount = 0;
      let hiredCount = 0;
      let rejectedCount = 0;

      appsList.forEach((app) => {
        if (app.stage === 'shortlisted') shortlistedCount++;
        if (app.stage === 'interview') interviewStageCount++;
        if (app.stage === 'offer') offersCount++;
        if (app.stage === 'hired') hiredCount++;
        if (app.stage === 'rejected') rejectedCount++;
      });

      // Total Interviews
      const { count: interviewsTotal } = await supabase
        .from('interviews')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId);

      const { count: interviewsScheduled } = await supabase
        .from('interviews')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'scheduled');

      // Conversion rates
      const hireConversionRate = totalApplicants > 0 ? Number(((hiredCount / totalApplicants) * 100).toFixed(1)) : 0;
      const interviewConversionRate =
        totalApplicants > 0 ? Number((((interviewStageCount + offersCount + hiredCount) / totalApplicants) * 100).toFixed(1)) : 0;

      // Avg Time to hire
      const timeToHireRes = await this.getTimeToHire(filters);
      const avgTimeToHireDays = timeToHireRes.data?.avgDays ?? null;

      const result: RecruitmentOverview = {
        totalApplicants,
        activeJobs: activeJobsCount || 0,
        interviewsTotal: interviewsTotal || 0,
        interviewsScheduled: interviewsScheduled || 0,
        shortlistedCount,
        offersCount,
        hiredCount,
        rejectedCount,
        avgTimeToHireDays,
        hireConversionRate,
        interviewConversionRate,
      };

      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * 2. Hiring Funnel Progression
   */
  async getHiringFunnel(filters?: AnalyticsFilters): Promise<ServiceResult<FunnelStageMetric[]>> {
    try {
      const { companyId, error: compErr } = await this.getAuthenticatedCompanyId();
      if (compErr || !companyId) {
        return { data: null, error: normalizeServiceError(compErr) };
      }

      const startDate = this.calculateStartDate(filters?.timeRange, filters?.startDate);

      let query = supabase
        .from('job_applications')
        .select('id, stage, applied_at')
        .eq('company_id', companyId);

      if (filters?.jobId && filters.jobId !== 'all') {
        query = query.eq('job_id', filters.jobId);
      }
      if (startDate) {
        query = query.gte('applied_at', startDate);
      }
      if (filters?.endDate) {
        query = query.lte('applied_at', new Date(filters.endDate).toISOString());
      }

      const { data: apps, error } = await query;
      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const appList = apps || [];
      const total = appList.length;

      const stageCounts: Record<ApplicationStage, number> = {
        new: 0,
        screening: 0,
        shortlisted: 0,
        interview: 0,
        offer: 0,
        hired: 0,
        rejected: 0,
        withdrawn: 0,
      };

      appList.forEach((a) => {
        if (stageCounts[a.stage as ApplicationStage] !== undefined) {
          stageCounts[a.stage as ApplicationStage]++;
        }
      });

      // Funnel definitions in progressive order
      const funnelDefs: { stage: ApplicationStage; label: string }[] = [
        { stage: 'new', label: 'Applicants' },
        { stage: 'screening', label: 'Screened' },
        { stage: 'shortlisted', label: 'Shortlisted' },
        { stage: 'interview', label: 'Interviews' },
        { stage: 'offer', label: 'Offers' },
        { stage: 'hired', label: 'Hired' },
      ];

      const metrics: FunnelStageMetric[] = [];

      for (let i = 0; i < funnelDefs.length; i++) {
        const def = funnelDefs[i];
        let count = 0;

        if (def.stage === 'new') {
          // Total applicants entered top of funnel
          count = total;
        } else {
          // In an ATS funnel, count candidates who reached at least this stage or are currently at it
          // or we aggregate candidates currently at or beyond this stage
          count = stageCounts[def.stage] || 0;
          // Add counts of subsequent stages to reflect historical progression
          for (let j = i + 1; j < funnelDefs.length; j++) {
            count += stageCounts[funnelDefs[j].stage] || 0;
          }
        }

        const percentageOfTotal = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
        const prevCount = i > 0 ? metrics[i - 1].count : total;
        const conversionFromPrevious = prevCount > 0 ? Number(((count / prevCount) * 100).toFixed(1)) : (total > 0 ? 100 : 0);

        metrics.push({
          stage: def.stage,
          label: def.label,
          count,
          percentageOfTotal,
          conversionFromPrevious,
        });
      }

      return { data: metrics, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * 3. Applicant Trend Timeline Points
   */
  async getApplicantTrend(filters?: AnalyticsFilters): Promise<ServiceResult<ApplicantTrendPoint[]>> {
    try {
      const { companyId, error: compErr } = await this.getAuthenticatedCompanyId();
      if (compErr || !companyId) {
        return { data: null, error: normalizeServiceError(compErr) };
      }

      const timeRange = filters?.timeRange || '30days';
      const startDate = this.calculateStartDate(timeRange, filters?.startDate);

      let query = supabase
        .from('job_applications')
        .select('applied_at')
        .eq('company_id', companyId)
        .order('applied_at', { ascending: true });

      if (filters?.jobId && filters.jobId !== 'all') {
        query = query.eq('job_id', filters.jobId);
      }
      if (startDate) {
        query = query.gte('applied_at', startDate);
      }
      if (filters?.endDate) {
        query = query.lte('applied_at', new Date(filters.endDate).toISOString());
      }

      const { data: apps, error } = await query;
      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const points: ApplicantTrendPoint[] = [];
      const appList = apps || [];

      if (timeRange === '7days') {
        // Daily buckets for 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const label = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'numeric', day: 'numeric' });
          const count = appList.filter((a) => a.applied_at.startsWith(dateStr)).length;
          points.push({ label, date: dateStr, count });
        }
      } else if (timeRange === '30days') {
        // 4 weekly buckets or 6 5-day buckets
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() - i * 7);

          const count = appList.filter((a) => {
            const t = new Date(a.applied_at).getTime();
            return t >= weekStart.getTime() && t < weekEnd.getTime();
          }).length;

          points.push({
            label: `Week ${4 - i}`,
            date: weekStart.toISOString().split('T')[0],
            count,
          });
        }
      } else {
        // Monthly buckets for 90days, 6months, 12months
        const monthsCount = timeRange === '90days' ? 3 : timeRange === '6months' ? 6 : 12;
        for (let i = monthsCount - 1; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthYearStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          const count = appList.filter((a) => a.applied_at.startsWith(monthYearStr)).length;
          points.push({ label, date: monthYearStr, count });
        }
      }

      return { data: points, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * 4. Time to Hire Metrics
   */
  async getTimeToHire(filters?: AnalyticsFilters): Promise<ServiceResult<TimeToHireMetrics>> {
    try {
      const { companyId, error: compErr } = await this.getAuthenticatedCompanyId();
      if (compErr || !companyId) {
        return { data: null, error: normalizeServiceError(compErr) };
      }

      const startDate = this.calculateStartDate(filters?.timeRange, filters?.startDate);

      let query = supabase
        .from('job_applications')
        .select('id, applied_at, updated_at, stage')
        .eq('company_id', companyId)
        .eq('stage', 'hired');

      if (filters?.jobId && filters.jobId !== 'all') {
        query = query.eq('job_id', filters.jobId);
      }
      if (startDate) {
        query = query.gte('applied_at', startDate);
      }

      const { data: hiredApps, error } = await query;
      if (error) {
        return { data: null, error: normalizeServiceError(error) };
      }

      const list = hiredApps || [];
      if (list.length === 0) {
        return {
          data: {
            avgDays: null,
            medianDays: null,
            fastestDays: null,
            longestDays: null,
            totalHiresAnalyzed: 0,
          },
          error: null,
        };
      }

      const durationsInDays = list.map((a) => {
        const start = new Date(a.applied_at).getTime();
        const end = new Date(a.updated_at).getTime();
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        return diffDays;
      }).sort((a, b) => a - b);

      const totalDays = durationsInDays.reduce((acc, d) => acc + d, 0);
      const avgDays = Math.round(totalDays / durationsInDays.length);
      const mid = Math.floor(durationsInDays.length / 2);
      const medianDays = durationsInDays.length % 2 !== 0 ? durationsInDays[mid] : Math.round((durationsInDays[mid - 1] + durationsInDays[mid]) / 2);
      const fastestDays = durationsInDays[0];
      const longestDays = durationsInDays[durationsInDays.length - 1];

      return {
        data: {
          avgDays,
          medianDays,
          fastestDays,
          longestDays,
          totalHiresAnalyzed: durationsInDays.length,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * 5. Channel Attribution
   */
  async getChannelAttribution(_filters?: AnalyticsFilters): Promise<ServiceResult<ChannelAttribution>> {
    // Documented schema reality: source attribution is currently unavailable in the database schema
    return {
      data: {
        isAvailable: false,
        channels: [],
        note: 'Candidate source attribution is not currently enabled in the schema.',
      },
      error: null,
    };
  }

  /**
   * 6. Job Performance Analytics
   */
  async getJobPerformance(filters?: AnalyticsFilters): Promise<ServiceResult<JobPerformanceMetric[]>> {
    try {
      const { companyId, error: compErr } = await this.getAuthenticatedCompanyId();
      if (compErr || !companyId) {
        return { data: null, error: normalizeServiceError(compErr) };
      }

      let jobsQuery = supabase
        .from('jobs')
        .select('id, title, status, department, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.jobId && filters.jobId !== 'all') {
        jobsQuery = jobsQuery.eq('id', filters.jobId);
      }

      const { data: jobs, error: jobsErr } = await jobsQuery;

      if (jobsErr) {
        return { data: null, error: normalizeServiceError(jobsErr) };
      }

      const { data: apps, error: appsErr } = await supabase
        .from('job_applications')
        .select('id, job_id, stage')
        .eq('company_id', companyId);

      if (appsErr) {
        return { data: null, error: normalizeServiceError(appsErr) };
      }

      const appsList = apps || [];

      const metrics: JobPerformanceMetric[] = (jobs || []).map((job) => {
        const jobApps = appsList.filter((a) => a.job_id === job.id);
        const applicationsCount = jobApps.length;
        const shortlistedCount = jobApps.filter((a) => a.stage === 'shortlisted').length;
        const interviewCount = jobApps.filter((a) => a.stage === 'interview').length;
        const offerCount = jobApps.filter((a) => a.stage === 'offer').length;
        const hiredCount = jobApps.filter((a) => a.stage === 'hired').length;
        const conversionRate = applicationsCount > 0 ? Number(((hiredCount / applicationsCount) * 100).toFixed(1)) : 0;

        return {
          jobId: job.id,
          jobTitle: job.title,
          status: job.status,
          department: job.department,
          applicationsCount,
          shortlistedCount,
          interviewCount,
          offerCount,
          hiredCount,
          conversionRate,
          createdAt: job.created_at,
        };
      });

      return { data: metrics, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }
}

export const analyticsService = new AnalyticsService();
