import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { InterviewCard } from '@/components/employer/InterviewCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { interviewService, Interview } from '@/services';
import { navigateTo } from '@/utils/navigation';
import { Calendar, RefreshCw } from 'lucide-react';

export const EmployerInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await interviewService.getEmployerInterviews();

    if (error) {
      setErrorMessage(error.message);
      setInterviews([]);
    } else if (data) {
      setInterviews(data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadInterviews();

    const handleSync = () => {
      loadInterviews();
    };

    window.addEventListener('kth_interviews_changed', handleSync);
    window.addEventListener('focus', handleSync);
    const interval = setInterval(loadInterviews, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('kth_interviews_changed', handleSync);
    };
  }, [loadInterviews]);

  const handleMarkCompleted = async (interviewId: string) => {
    setActionLoadingId(interviewId);
    const { data, error } = await interviewService.updateInterview(interviewId, {
      status: 'completed',
    });
    setActionLoadingId(null);

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      setInterviews((prev) => prev.map((i) => (i.id === interviewId ? data : i)));
    }
  };

  const handleCancelInterview = async (interviewId: string) => {
    setActionLoadingId(interviewId);
    const { data, error } = await interviewService.cancelInterview(interviewId);
    setActionLoadingId(null);

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      setInterviews((prev) => prev.map((i) => (i.id === interviewId ? data : i)));
    }
  };

  const filteredInterviews = interviews.filter((i) => {
    if (selectedStatus === 'all') return true;
    return i.status === selectedStatus;
  });

  const scheduledCount = interviews.filter((i) => i.status === 'scheduled').length;

  return (
    <EmployerShell title="Interviews Management" currentPath="/employer/interviews">
      <div className="space-y-6 font-sans">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div className="text-xs text-kth-slate-500">
            You have <strong className="text-kth-slate-900 font-mono">{scheduledCount} scheduled interviews</strong> across active hiring rounds
          </div>
          <div className="w-full sm:w-56">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Interview Statuses' },
                { value: 'scheduled', label: 'Upcoming Scheduled' },
                { value: 'completed', label: 'Completed Rounds' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Interviews">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadInterviews} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-kth-slate-200 space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-kth-slate-200 rounded w-20" />
                  <div className="h-4 bg-kth-slate-200 rounded w-16" />
                </div>
                <div className="h-5 bg-kth-slate-200 rounded w-3/4" />
                <div className="h-4 bg-kth-slate-100 rounded w-1/2" />
                <div className="bg-kth-slate-50 p-3 rounded-xl h-16" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && filteredInterviews.length === 0 && (
          <EmptyState
            title="No Interviews Scheduled"
            description="You have no interview sessions matching this filter. Schedule candidate interviews directly from the ATS candidate pipeline or applicant table."
            actionText="Go to Candidate Pipeline"
            onAction={() => {
              navigateTo('/employer/pipeline');
            }}
            icon={<Calendar className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Interview Cards Grid */}
        {!isLoading && !errorMessage && filteredInterviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                isActionLoading={actionLoadingId === interview.id}
                onMarkCompleted={handleMarkCompleted}
                onCancel={handleCancelInterview}
              />
            ))}
          </div>
        )}
      </div>
    </EmployerShell>
  );
};
