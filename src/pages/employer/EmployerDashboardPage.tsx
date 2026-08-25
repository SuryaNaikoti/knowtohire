import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { HiringOverview } from '@/components/employer/HiringOverview';
import { HiringKPIGrid } from '@/components/employer/HiringKPIGrid';
import { HiringFunnel } from '@/components/employer/HiringFunnel';
import { CandidatePipeline } from '@/components/employer/CandidatePipeline';
import { InterviewCard } from '@/components/employer/InterviewCard';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  analyticsService,
  applicationService,
  interviewService,
  RecruitmentOverview,
  FunnelStageMetric,
  JobApplication,
  Interview,
} from '@/services';
import { ArrowRight, Kanban, Calendar, RefreshCw } from 'lucide-react';

export const EmployerDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<RecruitmentOverview | null>(null);
  const [funnel, setFunnel] = useState<FunnelStageMetric[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [overviewRes, funnelRes, appsRes, interviewsRes] = await Promise.all([
      analyticsService.getRecruitmentOverview({ timeRange: '30days' }),
      analyticsService.getHiringFunnel({ timeRange: '30days' }),
      applicationService.getCompanyApplicants({ pageSize: 20 }),
      interviewService.getEmployerInterviews(),
    ]);

    if (overviewRes.error) {
      setErrorMessage(overviewRes.error.message);
    } else {
      setOverview(overviewRes.data);
      setFunnel(funnelRes.data || []);
      setApplications(appsRes.data?.data || []);
      setInterviews(interviewsRes.data || []);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();

    const handleSync = () => {
      loadDashboard();
    };

    window.addEventListener('kth_applications_changed', handleSync);
    window.addEventListener('kth_interviews_changed', handleSync);
    window.addEventListener('kth_jobs_changed', handleSync);

    return () => {
      window.removeEventListener('kth_applications_changed', handleSync);
      window.removeEventListener('kth_interviews_changed', handleSync);
      window.removeEventListener('kth_jobs_changed', handleSync);
    };
  }, [loadDashboard]);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const upcomingInterviews = interviews.filter((i) => i.status === 'scheduled').slice(0, 3);

  return (
    <EmployerShell title="Employer Operational Overview" currentPath="/employer">
      <div className="space-y-6 font-sans">
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Dashboard Notice">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadDashboard} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Welcome Area */}
        <HiringOverview />

        {/* 4 Primary KPI Cards */}
        <HiringKPIGrid overview={overview} isLoading={isLoading} />

        {/* Visual 6-Stage Hiring Funnel */}
        <HiringFunnel
          stages={funnel}
          isLoading={isLoading}
          overallConversionRate={overview?.hireConversionRate ?? 0}
        />

        {/* ATS Kanban Pipeline Preview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
              <Kanban className="w-5 h-5 text-kth-primary-600" /> Active Candidate Pipeline
            </h3>
            <button
              type="button"
              onClick={() => handleNavigate('/employer/pipeline')}
              className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 hover:underline flex items-center gap-1"
            >
              Open Dedicated Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="w-72 shrink-0 bg-kth-slate-100 p-3 rounded-2xl border border-kth-slate-200 h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <CandidatePipeline
              applications={applications}
              onApplicationUpdated={(updated) => {
                setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
              }}
            />
          )}
        </div>

        {/* Upcoming Interviews Grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-kth-accent-cyan" /> Upcoming Scheduled Interviews
            </h3>
            <button
              type="button"
              onClick={() => handleNavigate('/employer/interviews')}
              className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 hover:underline flex items-center gap-1"
            >
              View Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-kth-slate-200 h-40 animate-pulse" />
              ))}
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 text-center text-xs text-kth-slate-400">
              No interviews scheduled for this week.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingInterviews.map((int) => (
                <InterviewCard key={int.id} interview={int} />
              ))}
            </div>
          )}
        </div>
      </div>
    </EmployerShell>
  );
};
