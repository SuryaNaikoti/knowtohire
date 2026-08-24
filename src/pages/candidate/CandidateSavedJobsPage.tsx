import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { JobCard } from '@/components/cards/JobCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { savedJobService, SavedJob } from '@/services';
import { Bookmark, RefreshCw } from 'lucide-react';

export const CandidateSavedJobsPage: React.FC = () => {
  const [savedRecords, setSavedRecords] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSavedJobs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await savedJobService.getMySavedJobs();

    if (error) {
      setErrorMessage(error.message);
      setSavedRecords([]);
    } else if (data) {
      setSavedRecords(data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSavedJobs();

    const handleSavedJobsChanged = () => {
      loadSavedJobs();
    };

    window.addEventListener('kth_saved_jobs_changed', handleSavedJobsChanged);
    return () => {
      window.removeEventListener('kth_saved_jobs_changed', handleSavedJobsChanged);
    };
  }, [loadSavedJobs]);

  const handleUnsave = async (jobId: string) => {
    // Optimistically remove from list
    setSavedRecords((prev) => prev.filter((r) => r.job_id !== jobId));

    const { error } = await savedJobService.unsaveJob(jobId);
    if (error) {
      // Reload on failure
      loadSavedJobs();
    }
  };

  const handleJobClick = (jobId: string) => {
    window.history.pushState({}, '', `/candidate/jobs/${jobId}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const formatRelativeDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently posted';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    if (diffDays < 30) return `Posted ${diffDays} days ago`;
    return `Posted on ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
  };

  const count = savedRecords.length;
  const countLabel = count === 1 ? '1 saved opportunity' : `${count} saved opportunities`;

  return (
    <CandidateShell title="Saved Jobs" currentPath="/candidate/saved-jobs">
      <div className="space-y-6 font-sans">
        <div className="flex justify-between items-center text-xs">
          <span className="text-kth-slate-500">
            You have <strong className="text-kth-slate-900">{isLoading ? '...' : countLabel}</strong>
          </span>
        </div>

        {/* Error State */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Saved Jobs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadSavedJobs} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-kth-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-kth-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-kth-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-5 bg-kth-slate-200 rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-4 bg-kth-slate-100 rounded w-20" />
                  <div className="h-4 bg-kth-slate-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && savedRecords.length === 0 && (
          <EmptyState
            title="No Saved Jobs Yet"
            description="Explore job listings and click the bookmark icon to save opportunities for later application."
            actionText="Explore Verified Jobs"
            onAction={() => {
              window.history.pushState({}, '', '/candidate/jobs');
              window.dispatchEvent(new Event('popstate'));
            }}
            icon={<Bookmark className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Saved Job Cards Grid */}
        {!isLoading && !errorMessage && savedRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecords.map((record) => {
              const job = record.job;
              if (!job) return null;

              return (
                <JobCard
                  key={record.id}
                  id={job.id}
                  title={job.title}
                  company={job.company?.name || 'Verified Enterprise'}
                  companyLogo={job.company?.logo_url || undefined}
                  location={job.location}
                  isRemote={job.is_remote}
                  isVerified={job.is_verified || job.company?.verification_status === 'verified'}
                  employmentType={job.employment_type}
                  minSalaryINR={job.min_salary_inr}
                  maxSalaryINR={job.max_salary_inr}
                  skills={job.skills || []}
                  isSaved={true}
                  postedDate={formatRelativeDate(job.published_at || job.created_at)}
                  onSaveToggle={() => handleUnsave(job.id)}
                  onApply={() => handleJobClick(job.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </CandidateShell>
  );
};
