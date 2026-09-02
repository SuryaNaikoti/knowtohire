import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { KPICard } from '@/components/data-display/KPICard';
import { AnalyticsChart } from '@/components/employer/AnalyticsChart';
import { HiringFunnel } from '@/components/employer/HiringFunnel';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import {
  analyticsService,
  jobService,
  AnalyticsTimeRange,
  RecruitmentOverview,
  FunnelStageMetric,
  ApplicantTrendPoint,
  TimeToHireMetrics,
  JobPerformanceMetric,
  Job,
} from '@/services';
import { Users, Filter, Calendar, Award, UserCheck, Clock, RefreshCw, Info } from 'lucide-react';

export const EmployerAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30days');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [jobs, setJobs] = useState<Job[]>([]);

  // Analytics data state
  const [overview, setOverview] = useState<RecruitmentOverview | null>(null);
  const [funnel, setFunnel] = useState<FunnelStageMetric[]>([]);
  const [trend, setTrend] = useState<ApplicantTrendPoint[]>([]);
  const [timeToHire, setTimeToHire] = useState<TimeToHireMetrics | null>(null);
  const [jobPerformance, setJobPerformance] = useState<JobPerformanceMetric[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [overviewRes, funnelRes, trendRes, timeToHireRes, jobPerfRes, jobsRes] = await Promise.all([
      analyticsService.getRecruitmentOverview({ timeRange, jobId: selectedJobId }),
      analyticsService.getHiringFunnel({ timeRange, jobId: selectedJobId }),
      analyticsService.getApplicantTrend({ timeRange, jobId: selectedJobId }),
      analyticsService.getTimeToHire({ timeRange, jobId: selectedJobId }),
      analyticsService.getJobPerformance({ timeRange, jobId: selectedJobId }),
      jobService.getEmployerJobs(),
    ]);

    if (jobsRes.data) {
      setJobs(jobsRes.data.data);
    }

    if (overviewRes.error) {
      setErrorMessage(overviewRes.error.message);
    } else {
      setOverview(overviewRes.data);
      setFunnel(funnelRes.data || []);
      setTrend(trendRes.data || []);
      setTimeToHire(timeToHireRes.data);
      setJobPerformance(jobPerfRes.data || []);
    }

    setIsLoading(false);
  }, [timeRange, selectedJobId]);

  useEffect(() => {
    loadAnalytics();

    const handleDataChanged = () => {
      loadAnalytics();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_applications_changed', handleDataChanged);
      window.addEventListener('kth_interviews_changed', handleDataChanged);
      window.addEventListener('kth_jobs_changed', handleDataChanged);
      window.addEventListener('focus', handleDataChanged);
    }

    const interval = setInterval(loadAnalytics, 30000);

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleDataChanged);
        window.removeEventListener('kth_applications_changed', handleDataChanged);
        window.removeEventListener('kth_interviews_changed', handleDataChanged);
        window.removeEventListener('kth_jobs_changed', handleDataChanged);
      }
    };
  }, [loadAnalytics]);

  const avgTimeText = overview?.avgTimeToHireDays ? `${overview.avgTimeToHireDays} Days` : 'N/A';

  return (
    <EmployerShell title="Hiring & Recruitment Analytics" currentPath="/employer/analytics">
      <div className="space-y-6 font-sans">
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Analytics">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadAnalytics} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Date Range & Requisition Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <span className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider">
            Recruitment Performance Period
          </span>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <div className="w-full sm:w-56">
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                options={[
                  { value: 'all', label: 'All Requisitions' },
                  ...jobs.map((j) => ({ value: j.id, label: j.title })),
                ]}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as AnalyticsTimeRange)}
                options={[
                  { value: '7days', label: 'Last 7 Days' },
                  { value: '30days', label: 'Last 30 Days' },
                  { value: '90days', label: 'Last 90 Days' },
                  { value: '6months', label: 'Last 6 Months' },
                  { value: '12months', label: 'Last 12 Months' },
                  { value: 'all', label: 'All Time' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label="APPLICANTS"
            value={isLoading ? '...' : overview?.totalApplicants ?? 0}
            trendText="Total Inflow"
            icon={<Users className="w-4 h-4 text-kth-primary-600" />}
          />
          <KPICard
            label="SHORTLISTED"
            value={isLoading ? '...' : overview?.shortlistedCount ?? 0}
            trendText={overview?.totalApplicants ? `${Math.round(((overview.shortlistedCount || 0) / overview.totalApplicants) * 100)}% rate` : '0%'}
            icon={<Filter className="w-4 h-4 text-indigo-600" />}
          />
          <KPICard
            label="INTERVIEWS"
            value={isLoading ? '...' : overview?.interviewsTotal ?? 0}
            trendText={`${overview?.interviewsScheduled ?? 0} upcoming`}
            icon={<Calendar className="w-4 h-4 text-cyan-600" />}
          />
          <KPICard
            label="OFFERS"
            value={isLoading ? '...' : overview?.offersCount ?? 0}
            trendText="Extended"
            icon={<Award className="w-4 h-4 text-teal-600" />}
          />
          <KPICard
            label="HIRES"
            value={isLoading ? '...' : overview?.hiredCount ?? 0}
            trendText={`${overview?.hireConversionRate ?? 0}% conv.`}
            icon={<UserCheck className="w-4 h-4 text-emerald-600" />}
          />
          <KPICard
            label="AVG TIME TO HIRE"
            value={isLoading ? '...' : avgTimeText}
            trendText={timeToHire?.fastestDays ? `Fastest: ${timeToHire.fastestDays}d` : 'Target <30d'}
            icon={<Clock className="w-4 h-4 text-slate-600" />}
          />
        </div>

        {/* Monthly Applicant Volume SVG Chart */}
        <AnalyticsChart
          data={trend}
          isLoading={isLoading}
          totalCount={overview?.totalApplicants ?? 0}
        />

        {/* Hiring Funnel Analytics */}
        <HiringFunnel
          stages={funnel}
          isLoading={isLoading}
          overallConversionRate={overview?.hireConversionRate ?? 0}
        />

        {/* Requisition Breakdown Table */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Badge variant="indigo" className="mb-1">Requisition Performance</Badge>
              <h3 className="font-display font-bold text-base text-kth-slate-900">Active Job Pipeline Breakdown</h3>
            </div>
            <span className="font-mono text-xs text-kth-slate-500 font-semibold">
              {jobPerformance.length} Requisitions
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requisition</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Applicants</TableHead>
                  <TableHead className="text-right">Shortlisted</TableHead>
                  <TableHead className="text-right">Interviews</TableHead>
                  <TableHead className="text-right">Hired</TableHead>
                  <TableHead className="text-right">Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={idx} className="animate-pulse">
                      <TableCell><div className="h-4 bg-kth-slate-200 rounded w-36" /></TableCell>
                      <TableCell><div className="h-4 bg-kth-slate-100 rounded w-24" /></TableCell>
                      <TableCell><div className="h-4 bg-kth-slate-100 rounded w-16" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 bg-kth-slate-100 rounded w-8 ml-auto" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 bg-kth-slate-100 rounded w-8 ml-auto" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 bg-kth-slate-100 rounded w-8 ml-auto" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 bg-kth-slate-100 rounded w-8 ml-auto" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 bg-kth-slate-100 rounded w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : jobPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-xs text-kth-slate-400">
                      No requisitions created yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobPerformance.map((j) => (
                    <TableRow key={j.jobId}>
                      <TableCell className="font-bold text-xs text-kth-slate-900">{j.jobTitle}</TableCell>
                      <TableCell className="text-xs text-kth-slate-600">{j.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant={j.status === 'published' ? 'emerald' : j.status === 'draft' ? 'slate' : 'amber'}
                          className="capitalize text-[10px]"
                        >
                          {j.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-kth-slate-900">{j.applicationsCount}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-kth-slate-700">{j.shortlistedCount}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-kth-slate-700">{j.interviewCount}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">{j.hiredCount}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-kth-primary-600 font-bold">{j.conversionRate}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Source Attribution Reality Notice */}
        <Card className="p-6 bg-kth-slate-50/70 border-kth-slate-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-kth-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-bold text-sm text-kth-slate-900 mb-1">
                Candidate Source Attribution
              </h4>
              <p className="text-xs text-kth-slate-600 leading-relaxed max-w-2xl">
                Source attribution tagging (UTM parameters, referral codes, and job board tracking) is currently disabled for this enterprise workspace. All candidate applications are direct platform applications.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </EmployerShell>
  );
};
