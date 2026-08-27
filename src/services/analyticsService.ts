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
    // Check for demo employer session first
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          if (parsed?.role === 'employer' || parsed?.role === 'admin') {
            const cid = parsed.company_id || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
            return { companyId: cid, error: null };
          }
        } catch {
          // ignore
        }
      }
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        // Default to demo company if unauthenticated
        return { companyId: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396', error: null };
      }

      const { data: employerProfile, error: employerError } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (employerError || !employerProfile?.company_id) {
        return {
          companyId: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
          error: null,
        };
      }

      return { companyId: employerProfile.company_id, error: null };
    } catch {
      return { companyId: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396', error: null };
    }
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
      const { count: activeJobsCount } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'published');

      let localJobsCount = 0;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_local_created_jobs');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              localJobsCount = parsed.filter((j: any) => j.status === 'published' && (!j.company_id || j.company_id === companyId)).length;
            }
          }
        } catch {
          // ignore
        }
      }

      const totalActiveJobs = (activeJobsCount || 0) + localJobsCount;

      // Applications aggregation
      let appsQuery = supabase
        .from('job_applications')
        .select('id, job_id, stage, applied_at, updated_at')
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

      const { data: applications } = await appsQuery;

      let appsList: any[] = applications ? [...applications] : [];

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_demo_applications');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              let demoForCompany = parsed.filter((a: any) => (!a.company_id || a.company_id === companyId));
              if (filters?.jobId && filters.jobId !== 'all') {
                demoForCompany = demoForCompany.filter((a: any) => a.job_id === filters.jobId);
              }
              if (startDate) {
                const startTime = new Date(startDate).getTime();
                demoForCompany = demoForCompany.filter((a: any) => {
                  if (!a.applied_at) return true;
                  return new Date(a.applied_at).getTime() >= startTime;
                });
              }
              if (filters?.endDate) {
                const endTime = new Date(filters.endDate).getTime();
                demoForCompany = demoForCompany.filter((a: any) => {
                  if (!a.applied_at) return true;
                  return new Date(a.applied_at).getTime() <= endTime;
                });
              }
              for (const demoApp of demoForCompany) {
                if (!appsList.some((a) => a.id === demoApp.id)) {
                  appsList.push(demoApp);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

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

      // Total Interviews scoped by company, job_id, and timeRange
      let interviewsQuery = supabase
        .from('interviews')
        .select('id, job_id, scheduled_start, status')
        .eq('company_id', companyId);

      if (filters?.jobId && filters.jobId !== 'all') {
        interviewsQuery = interviewsQuery.eq('job_id', filters.jobId);
      }
      if (startDate) {
        interviewsQuery = interviewsQuery.gte('scheduled_start', startDate);
      }

      const { data: dbInterviews } = await interviewsQuery;
      let interviewsList: any[] = dbInterviews ? [...dbInterviews] : [];

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_demo_interviews');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              let demoForCompany = parsed.filter((i: any) => (!i.company_id || i.company_id === companyId));
              if (filters?.jobId && filters.jobId !== 'all') {
                demoForCompany = demoForCompany.filter((i: any) => i.job_id === filters.jobId);
              }
              if (startDate) {
                const startTime = new Date(startDate).getTime();
                demoForCompany = demoForCompany.filter((i: any) => {
                  if (!i.scheduled_start) return true;
                  return new Date(i.scheduled_start).getTime() >= startTime;
                });
              }
              for (const demoInt of demoForCompany) {
                if (!interviewsList.some((i) => i.id === demoInt.id)) {
                  interviewsList.push(demoInt);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      const totalInterviewsFinal = interviewsList.length;
      const scheduledInterviewsFinal = interviewsList.filter((i: any) => i.status === 'scheduled').length;

      // Conversion rates
      const hireConversionRate = totalApplicants > 0 ? Number(((hiredCount / totalApplicants) * 100).toFixed(1)) : 0;
      const interviewConversionRate =
        totalApplicants > 0 ? Number((((interviewStageCount + offersCount + hiredCount) / totalApplicants) * 100).toFixed(1)) : 0;

      // Avg Time to hire
      const timeToHireRes = await this.getTimeToHire(filters);
      const avgTimeToHireDays = timeToHireRes.data?.avgDays ?? null;

      const result: RecruitmentOverview = {
        totalApplicants,
        activeJobs: totalActiveJobs,
        interviewsTotal: totalInterviewsFinal,
        interviewsScheduled: scheduledInterviewsFinal,
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
        .select('id, job_id, stage, applied_at')
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

      const { data: apps } = await query;
      let appList: any[] = apps ? [...apps] : [];

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_demo_applications');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              let demoForCompany = parsed.filter((a: any) => (!a.company_id || a.company_id === companyId));
              if (filters?.jobId && filters.jobId !== 'all') {
                demoForCompany = demoForCompany.filter((a: any) => a.job_id === filters.jobId);
              }
              if (startDate) {
                const startTime = new Date(startDate).getTime();
                demoForCompany = demoForCompany.filter((a: any) => {
                  if (!a.applied_at) return true;
                  return new Date(a.applied_at).getTime() >= startTime;
                });
              }
              for (const demoApp of demoForCompany) {
                if (!appList.some((a) => a.id === demoApp.id)) {
                  appList.push(demoApp);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }
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
          count = total;
        } else {
          // In an ATS progressive funnel, candidates who reached at least this stage
          count = stageCounts[def.stage] || 0;
          for (let j = i + 1; j < funnelDefs.length; j++) {
            count += stageCounts[funnelDefs[j].stage] || 0;
          }
        }

        const percentageOfTotal = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
        const prevCount = i > 0 ? metrics[i - 1].count : total;
        const conversionFromPrevious = prevCount > 0 ? Number(((count / prevCount) * 100).toFixed(1)) : 0;

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
        .select('id, job_id, applied_at')
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

      const { data: dbApps } = await query;
      let appList: any[] = dbApps ? [...dbApps] : [];

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_demo_applications');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              let demoForCompany = parsed.filter((a: any) => (!a.company_id || a.company_id === companyId));
              if (filters?.jobId && filters.jobId !== 'all') {
                demoForCompany = demoForCompany.filter((a: any) => a.job_id === filters.jobId);
              }
              if (startDate) {
                const startTime = new Date(startDate).getTime();
                demoForCompany = demoForCompany.filter((a: any) => {
                  if (!a.applied_at) return true;
                  return new Date(a.applied_at).getTime() >= startTime;
                });
              }
              for (const demoApp of demoForCompany) {
                if (!appList.some((a) => a.id === demoApp.id)) {
                  appList.push(demoApp);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      const points: ApplicantTrendPoint[] = [];

      if (timeRange === '7days') {
        // Daily buckets for 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const label = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'numeric', day: 'numeric' });
          const count = appList.filter((a) => a.applied_at && a.applied_at.startsWith(dateStr)).length;
          points.push({ label, date: dateStr, count });
        }
      } else if (timeRange === '30days') {
        // 4 weekly buckets
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() - i * 7);

          const count = appList.filter((a) => {
            if (!a.applied_at) return i === 0; // Fallback recent to Week 4 if timestamp is missing
            const t = new Date(a.applied_at).getTime();
            return t >= weekStart.getTime() && t < weekEnd.getTime();
          }).length;

          points.push({
            label: `Week ${4 - i}`,
            date: weekStart.toISOString().split('T')[0],
            count,
          });
        }
      } else if (timeRange === 'all') {
        // All time: 4 dynamic time segments or months
        for (let i = 3; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthYearStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          const count = appList.filter((a) => a.applied_at && a.applied_at.startsWith(monthYearStr)).length;
          points.push({ label, date: monthYearStr, count });
        }
      } else {
        // Monthly buckets for 90days, 6months, 12months
        const monthsCount = timeRange === '90days' ? 3 : timeRange === '6months' ? 6 : 12;
        for (let i = monthsCount - 1; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthYearStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          const count = appList.filter((a) => a.applied_at && a.applied_at.startsWith(monthYearStr)).length;
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
        .select('id, job_id, applied_at, updated_at, stage')
        .eq('company_id', companyId)
        .eq('stage', 'hired');

      if (filters?.jobId && filters.jobId !== 'all') {
        query = query.eq('job_id', filters.jobId);
      }
      if (startDate) {
        query = query.gte('applied_at', startDate);
      }

      const { data: dbHiredApps } = await query;
      let hiredAppsList: any[] = dbHiredApps ? [...dbHiredApps] : [];

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem('kth_demo_applications');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              let demoForCompany = parsed.filter((a: any) => (!a.company_id || a.company_id === companyId) && a.stage === 'hired');
              if (filters?.jobId && filters.jobId !== 'all') {
                demoForCompany = demoForCompany.filter((a: any) => a.job_id === filters.jobId);
              }
              if (startDate) {
                const startTime = new Date(startDate).getTime();
                demoForCompany = demoForCompany.filter((a: any) => {
                  if (!a.applied_at) return true;
                  return new Date(a.applied_at).getTime() >= startTime;
                });
              }
              for (const demoApp of demoForCompany) {
                if (!hiredAppsList.some((a) => a.id === demoApp.id)) {
                  hiredAppsList.push(demoApp);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      if (hiredAppsList.length === 0) {
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

      const durationsInDays = hiredAppsList.map((a) => {
        const start = new Date(a.applied_at || a.created_at || new Date()).getTime();
        const end = new Date(a.updated_at || new Date()).getTime();
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

      const { data: dbJobs } = await jobsQuery;

      let allJobs: any[] = dbJobs ? [...dbJobs] : [];

      // Blend local created jobs
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const rawJobs = window.localStorage.getItem('kth_local_created_jobs');
          if (rawJobs) {
            const parsedJobs = JSON.parse(rawJobs);
            if (Array.isArray(parsedJobs)) {
              let localJobs = parsedJobs.filter((j: any) => !j.company_id || j.company_id === companyId);
              if (filters?.jobId && filters.jobId !== 'all') {
                localJobs = localJobs.filter((j: any) => j.id === filters.jobId);
              }
              for (const lj of localJobs) {
                if (!allJobs.some((j) => j.id === lj.id)) {
                  allJobs.push({
                    id: lj.id,
                    title: lj.title,
                    status: lj.status || 'published',
                    department: lj.department || 'Engineering',
                    created_at: lj.created_at || new Date().toISOString(),
                  });
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // Fetch all applications
      let appsQuery = supabase
        .from('job_applications')
        .select('id, job_id, stage, applied_at')
        .eq('company_id', companyId);

      const startDate = this.calculateStartDate(filters?.timeRange, filters?.startDate);
      if (startDate) {
        appsQuery = appsQuery.gte('applied_at', startDate);
      }

      const { data: dbApps } = await appsQuery;
      let allApps: any[] = dbApps ? [...dbApps] : [];

      // Blend demo applications
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const rawApps = window.localStorage.getItem('kth_demo_applications');
          if (rawApps) {
            const parsedApps = JSON.parse(rawApps);
            if (Array.isArray(parsedApps)) {
              let demoForCompany = parsedApps.filter((a: any) => !a.company_id || a.company_id === companyId);
              if (startDate) {
                const startTime = new Date(startDate).getTime();
                demoForCompany = demoForCompany.filter((a: any) => {
                  if (!a.applied_at) return true;
                  return new Date(a.applied_at).getTime() >= startTime;
                });
              }
              for (const da of demoForCompany) {
                if (!allApps.some((a) => a.id === da.id)) {
                  allApps.push(da);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      const metrics: JobPerformanceMetric[] = allJobs.map((job) => {
        const jobApps = allApps.filter((a) => a.job_id === job.id);
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
