import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { HiringOverview } from '@/components/employer/HiringOverview';
import { HiringKPIGrid } from '@/components/employer/HiringKPIGrid';
import { HiringFunnel } from '@/components/employer/HiringFunnel';
import { CandidatePipeline } from '@/components/employer/CandidatePipeline';
import { InterviewCard } from '@/components/employer/InterviewCard';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { navigateTo } from '@/utils/navigation';
import {
  analyticsService,
  applicationService,
  interviewService,
  RecruitmentOverview,
  FunnelStageMetric,
  JobApplication,
  Interview,
} from '@/services';
import { ArrowRight, Kanban, Calendar, RefreshCw, Clock, Plus } from 'lucide-react';

export const EmployerDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<RecruitmentOverview | null>(null);
  const [funnel, setFunnel] = useState<FunnelStageMetric[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboard = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setErrorMessage(null);

    const [overviewRes, funnelRes, appsRes, interviewsRes] = await Promise.all([
      analyticsService.getRecruitmentOverview({ timeRange: '30days' }),
      analyticsService.getHiringFunnel({ timeRange: '30days' }),
      applicationService.getCompanyApplicants({ pageSize: 50 }),
      interviewService.getEmployerInterviews(),
    ]);

    if (overviewRes.error) {
      setErrorMessage(overviewRes.error.message);
    } else {
      setOverview(overviewRes.data);
      setFunnel(funnelRes.data || []);
      setApplications(appsRes.data?.data || []);
      setInterviews(interviewsRes.data || []);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
    if (isManualRefresh) setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboard();

    const handleSync = () => {
      loadDashboard();
    };

    window.addEventListener('kth_applications_changed', handleSync);
    window.addEventListener('kth_interviews_changed', handleSync);
    window.addEventListener('kth_jobs_changed', handleSync);
    window.addEventListener('kth_company_profile_updated', handleSync);

    // Periodic time-to-time sync (every 30 seconds)
    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    // Window focus sync to ensure data is updated when returning to tab
    const handleFocus = () => {
      loadDashboard();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('kth_applications_changed', handleSync);
      window.removeEventListener('kth_interviews_changed', handleSync);
      window.removeEventListener('kth_jobs_changed', handleSync);
      window.removeEventListener('kth_company_profile_updated', handleSync);
    };
  }, [loadDashboard]);

  const upcomingInterviews = interviews.filter((i) => i.status === 'scheduled').slice(0, 3);

  const formattedUpdatedTime = lastUpdated.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <EmployerShell title="Employer Operational Overview" currentPath="/employer">
      <div className="space-y-6 font-sans text-left">
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Dashboard Notice">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDashboard(true)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Welcome Area */}
        <HiringOverview />

        {/* Live Sync Status Toolbar */}
        <div className="flex justify-between items-center px-1 text-xs text-kth-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-kth-slate-600">Live ATS Workspace Connected</span>
            <span className="hidden sm:inline text-kth-slate-400">•</span>
            <span className="hidden sm:flex items-center gap-1 text-kth-slate-400">
              <Clock className="w-3 h-3" /> Updated at {formattedUpdatedTime}
            </span>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-kth-slate-200 bg-white text-kth-slate-600 hover:text-kth-primary-600 hover:border-kth-slate-300 transition-colors font-medium cursor-pointer disabled:opacity-50"
            title="Refresh dashboard fields immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-kth-primary-600' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* 4 Primary KPI Cards (Interactive & Interlinked) */}
        <HiringKPIGrid overview={overview} isLoading={isLoading} />

        {/* Visual 6-Stage Hiring Funnel (Interactive Stages) */}
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
              onClick={() => navigateTo('/employer/pipeline')}
              className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 hover:underline flex items-center gap-1 cursor-pointer"
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
                // Recalculate KPIs and conversion funnel immediately
                loadDashboard();
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
              onClick={() => navigateTo('/employer/interviews')}
              className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 hover:underline flex items-center gap-1 cursor-pointer"
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
            <div className="bg-white p-8 rounded-2xl border border-kth-slate-200 text-center space-y-3">
              <Calendar className="w-8 h-8 text-kth-slate-300 mx-auto" />
              <div>
                <p className="text-xs font-semibold text-kth-slate-700">No interviews scheduled for this week.</p>
                <p className="text-xs text-kth-slate-400 mt-0.5">
                  Select candidates from the pipeline to schedule domain or technical interview rounds.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => navigateTo('/employer/pipeline')}
              >
                Schedule Candidate Interview
              </Button>
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
