import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { CandidatePipeline } from '@/components/employer/CandidatePipeline';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { applicationService, jobService, JobApplication, Job } from '@/services';
import { getQueryParam, navigateTo } from '@/utils/navigation';
import { Search, RefreshCw, Archive, Filter, X } from 'lucide-react';

export const EmployerPipelinePage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(() => getQueryParam('jobId') || 'all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>(() => getQueryParam('stage') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchives, setShowArchives] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if URL query params change via popstate
  useEffect(() => {
    const handleUrlSync = () => {
      const jParam = getQueryParam('jobId');
      const sParam = getQueryParam('stage');
      if (jParam) setSelectedJobId(jParam);
      if (sParam) setSelectedStageFilter(sParam);
    };
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);

  const loadPipeline = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [appsRes, jobsRes] = await Promise.all([
      applicationService.getCompanyApplicants({ pageSize: 100 }),
      jobService.getEmployerJobs(),
    ]);

    if (jobsRes.data) {
      setJobs(jobsRes.data.data);
    }

    if (appsRes.error) {
      setErrorMessage(appsRes.error.message);
      setApplications([]);
    } else if (appsRes.data) {
      setApplications(appsRes.data.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPipeline();

    const handleSync = () => {
      loadPipeline();
    };

    window.addEventListener('kth_applications_changed', handleSync);
    window.addEventListener('kth_jobs_changed', handleSync);
    window.addEventListener('kth_interviews_changed', handleSync);

    // Periodic time-to-time sync (every 30 seconds)
    const interval = setInterval(loadPipeline, 30000);

    const handleFocus = () => {
      loadPipeline();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('kth_applications_changed', handleSync);
      window.removeEventListener('kth_jobs_changed', handleSync);
      window.removeEventListener('kth_interviews_changed', handleSync);
    };
  }, [loadPipeline]);

  const filteredApplications = applications.filter((app) => {
    const matchesJob = selectedJobId === 'all' || app.job_id === selectedJobId;
    const matchesStage = selectedStageFilter === 'all' || app.stage === selectedStageFilter;
    const snapshot = (app.candidate_snapshot || {}) as Record<string, any>;
    const name = (app.candidate?.full_name || snapshot.full_name || '').toLowerCase();
    const headline = (snapshot.headline || '').toLowerCase();
    const jobTitle = (app.job?.title || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.includes(term) || headline.includes(term) || jobTitle.includes(term);
    return matchesJob && matchesStage && matchesSearch;
  });

  const handleApplicationUpdated = (updatedApp: JobApplication) => {
    setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
  };

  const hasActiveFilters = selectedJobId !== 'all' || selectedStageFilter !== 'all' || searchTerm.trim() !== '';

  const clearAllFilters = () => {
    setSelectedJobId('all');
    setSelectedStageFilter('all');
    setSearchTerm('');
    navigateTo('/employer/pipeline', { replace: true, scrollToTop: false });
  };

  return (
    <EmployerShell title="ATS Candidate Pipeline" currentPath="/employer/pipeline">
      <div className="space-y-4 font-sans text-left">
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Pipeline">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadPipeline} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Toolbar & Requisition Filter */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
              <Input
                placeholder="Search candidate name, skills, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              <div className="w-full sm:w-60">
                <Select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Active Requisitions' },
                    ...jobs.map((j) => ({ value: j.id, label: j.title })),
                  ]}
                />
              </div>
              <div className="w-full sm:w-52">
                <Select
                  value={selectedStageFilter}
                  onChange={(e) => setSelectedStageFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All ATS Stages' },
                    { value: 'new', label: 'New Applicants' },
                    { value: 'screening', label: 'Screening' },
                    { value: 'shortlisted', label: 'Shortlisted' },
                    { value: 'interview', label: 'Interview' },
                    { value: 'offer', label: 'Offer Extended' },
                    { value: 'hired', label: 'Hired' },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                  className="text-kth-slate-600 hover:text-kth-slate-900"
                >
                  Reset Filters
                </Button>
              )}
              <Button
                variant={showArchives ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowArchives(!showArchives)}
                leftIcon={<Archive className="w-3.5 h-3.5" />}
              >
                {showArchives ? 'Hide Archived' : 'Show Archived'}
              </Button>
            </div>
          </div>
        </div>

        {/* Pipeline Summary Bar */}
        <div className="flex justify-between items-center text-xs px-1">
          <span className="text-kth-slate-500">
            Managing <strong className="text-kth-slate-900 font-semibold">{isLoading ? '...' : filteredApplications.length} candidate applications</strong> in active recruitment workflow
          </span>
          {selectedStageFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-kth-primary-50 text-kth-primary-700 font-medium">
              <Filter className="w-3 h-3" /> Filtered by: <span className="font-bold uppercase tracking-wider">{selectedStageFilter}</span>
            </span>
          )}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="w-72 shrink-0 bg-kth-slate-100 p-3 rounded-2xl border border-kth-slate-200 space-y-3 animate-pulse h-80">
                <div className="h-4 bg-kth-slate-200 rounded w-1/3 mb-4" />
                <div className="bg-white p-4 rounded-xl h-24" />
                <div className="bg-white p-4 rounded-xl h-24" />
              </div>
            ))}
          </div>
        )}

        {/* Kanban Board */}
        {!isLoading && (
          <CandidatePipeline
            applications={filteredApplications}
            onApplicationUpdated={handleApplicationUpdated}
            showArchives={showArchives}
          />
        )}
      </div>
    </EmployerShell>
  );
};
