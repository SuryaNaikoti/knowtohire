import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { JobPostingCard } from '@/components/employer/JobPostingCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { jobService, Job, JobStatus } from '@/services';
import { Plus, Search, RefreshCw, Briefcase, AlertTriangle } from 'lucide-react';

export const EmployerJobsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Delete Draft Confirmation Modal state
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await jobService.getEmployerJobs({
      status: selectedStatus !== 'all' ? (selectedStatus as JobStatus) : undefined,
    });

    if (error) {
      setErrorMessage(error.message);
      setJobs([]);
    } else if (data) {
      setJobs(data.data);
    }

    setIsLoading(false);
  }, [selectedStatus]);

  useEffect(() => {
    loadJobs();

    const handleJobsChanged = () => {
      loadJobs();
    };

    window.addEventListener('kth_jobs_changed', handleJobsChanged);
    return () => {
      window.removeEventListener('kth_jobs_changed', handleJobsChanged);
    };
  }, [loadJobs]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Lifecycle Action Handlers
  const handlePublish = async (jobId: string) => {
    setActionLoadingId(jobId);
    setActionError(null);

    const { data, error } = await jobService.publishJob(jobId);
    setActionLoadingId(null);

    if (error) {
      setActionError(error.message);
    } else if (data) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? data : j)));
    }
  };

  const handlePause = async (jobId: string) => {
    setActionLoadingId(jobId);
    setActionError(null);

    const { data, error } = await jobService.pauseJob(jobId);
    setActionLoadingId(null);

    if (error) {
      setActionError(error.message);
    } else if (data) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? data : j)));
    }
  };

  const handleClose = async (jobId: string) => {
    setActionLoadingId(jobId);
    setActionError(null);

    const { data, error } = await jobService.closeJob(jobId);
    setActionLoadingId(null);

    if (error) {
      setActionError(error.message);
    } else if (data) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? data : j)));
    }
  };

  const handleReopen = async (jobId: string) => {
    setActionLoadingId(jobId);
    setActionError(null);

    const { data, error } = await jobService.reopenJob(jobId);
    setActionLoadingId(null);

    if (error) {
      setActionError(error.message);
    } else if (data) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? data : j)));
    }
  };

  const handleConfirmDeleteDraft = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    setActionError(null);

    const { error } = await jobService.deleteDraftJob(jobToDelete.id);
    setIsDeleting(false);

    if (error) {
      setActionError(error.message);
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      setJobToDelete(null);
    }
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <EmployerShell title="Your Job Openings" currentPath="/employer/jobs">
      <div className="space-y-6 font-sans">
        {/* Action Error Alert */}
        {actionError && (
          <Alert variant="error" title="Lifecycle Action Notice">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{actionError}</span>
              <Button variant="ghost" size="sm" onClick={() => setActionError(null)}>
                Dismiss
              </Button>
            </div>
          </Alert>
        )}

        {/* Load Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Requisitions">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadJobs} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
            <Input
              placeholder="Search job title, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <div className="w-full sm:w-48">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'paused', label: 'Paused' },
                  { value: 'closed', label: 'Closed' },
                ]}
              />
            </div>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleNavigate('/employer/jobs/new')}
          >
            Post a Job
          </Button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-kth-slate-200 p-6 space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 bg-kth-slate-200 rounded w-20" />
                  <div className="h-4 bg-kth-slate-100 rounded w-24" />
                </div>
                <div className="h-6 bg-kth-slate-200 rounded w-3/4" />
                <div className="h-4 bg-kth-slate-100 rounded w-1/2" />
                <div className="h-4 bg-kth-slate-100 rounded w-1/3" />
                <div className="pt-4 border-t border-kth-slate-100 flex justify-between items-center">
                  <div className="h-8 bg-kth-slate-200 rounded w-16" />
                  <div className="h-8 bg-kth-slate-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && filteredJobs.length === 0 && (
          <EmptyState
            title="No Job Postings Found"
            description="You haven't created any job requisitions in this view yet. Start building your sustainability talent pipeline."
            actionText="Post Your First Job"
            onAction={() => handleNavigate('/employer/jobs/new')}
            icon={<Briefcase className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Job Posting Cards Grid */}
        {!isLoading && !errorMessage && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobPostingCard
                key={job.id}
                job={job}
                isActionLoading={actionLoadingId === job.id}
                onPublish={() => handlePublish(job.id)}
                onPause={() => handlePause(job.id)}
                onCloseJob={() => handleClose(job.id)}
                onReopen={() => handleReopen(job.id)}
                onDeleteDraft={() => setJobToDelete(job)}
                onViewApplicants={() => handleNavigate(`/employer/jobs/${job.id}/applicants`)}
                onEdit={() => handleNavigate(`/employer/jobs/${job.id}/edit`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Draft Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(jobToDelete)}
        onClose={() => setJobToDelete(null)}
        title="Delete Draft Job"
        description="Are you sure you want to permanently delete this unpublished draft?"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              This will permanently remove the draft for <strong>{jobToDelete?.title}</strong>. This action cannot be undone.
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setJobToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConfirmDeleteDraft}
              disabled={isDeleting}
              isLoading={isDeleting}
              className="bg-rose-600 text-white hover:bg-rose-700 border-transparent font-bold"
            >
              {isDeleting ? 'Deleting...' : 'Delete Draft'}
            </Button>
          </div>
        </div>
      </Dialog>
    </EmployerShell>
  );
};
