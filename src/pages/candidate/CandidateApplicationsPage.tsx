import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { ApplicationCard } from '@/components/candidate/ApplicationCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { applicationService, JobApplication } from '@/services';
import { FileCheck, RefreshCw } from 'lucide-react';

export const CandidateApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await applicationService.getMyApplications();

    if (error) {
      setErrorMessage(error.message);
      setApplications([]);
    } else if (data) {
      setApplications(data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadApplications();

    const handleApplicationsChanged = () => {
      loadApplications();
    };

    window.addEventListener('kth_applications_changed', handleApplicationsChanged);
    return () => {
      window.removeEventListener('kth_applications_changed', handleApplicationsChanged);
    };
  }, [loadApplications]);

  // Derived KPIs
  const totalSent = applications.length;
  const inScreening = applications.filter((a) => a.stage === 'new' || a.stage === 'screening').length;
  const inInterview = applications.filter((a) => a.stage === 'interview').length;
  const offersCount = applications.filter((a) => a.stage === 'offer' || a.stage === 'hired').length;

  const handleNavigateJobs = () => {
    window.history.pushState({}, '', '/candidate/jobs');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <CandidateShell title="My Applications" currentPath="/candidate/applications">
      <div className="space-y-6 font-sans">
        {/* Applications Stage Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white">
            <span className="text-[10px] font-bold text-kth-slate-400 uppercase block mb-1">TOTAL SENT</span>
            <div className="font-mono text-xl font-bold text-kth-slate-900">{isLoading ? '...' : totalSent}</div>
          </Card>
          <Card className="p-4 bg-white">
            <span className="text-[10px] font-bold text-kth-slate-400 uppercase block mb-1">IN SCREENING</span>
            <div className="font-mono text-xl font-bold text-kth-primary-600">{isLoading ? '...' : inScreening}</div>
          </Card>
          <Card className="p-4 bg-white">
            <span className="text-[10px] font-bold text-kth-slate-400 uppercase block mb-1">INTERVIEWS</span>
            <div className="font-mono text-xl font-bold text-kth-accent-cyan">{isLoading ? '...' : inInterview}</div>
          </Card>
          <Card className="p-4 bg-white">
            <span className="text-[10px] font-bold text-kth-slate-400 uppercase block mb-1">OFFERS</span>
            <div className="font-mono text-xl font-bold text-kth-accent-emerald">{isLoading ? '...' : offersCount}</div>
          </Card>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Applications">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadApplications} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-kth-slate-200 p-6 space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 bg-kth-slate-200 rounded w-20" />
                  <div className="h-4 bg-kth-slate-100 rounded w-16" />
                </div>
                <div className="h-6 bg-kth-slate-200 rounded w-3/4" />
                <div className="h-4 bg-kth-slate-100 rounded w-1/2" />
                <div className="h-4 bg-kth-slate-100 rounded w-1/3" />
                <div className="pt-4 border-t border-kth-slate-100 flex justify-between items-center">
                  <div className="h-3 bg-kth-slate-100 rounded w-24" />
                  <div className="h-8 bg-kth-slate-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && applications.length === 0 && (
          <EmptyState
            title="No Applications Submitted Yet"
            description="You haven't applied to any job requisitions yet. Explore verified opportunities in ESG, sustainability, and renewable energy."
            actionText="Find Matching Roles"
            onAction={handleNavigateJobs}
            icon={<FileCheck className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Application Cards Grid */}
        {!isLoading && !errorMessage && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
              />
            ))}
          </div>
        )}
      </div>
    </CandidateShell>
  );
};
