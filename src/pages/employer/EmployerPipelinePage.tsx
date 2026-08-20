import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { CandidatePipeline } from '@/components/employer/CandidatePipeline';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { applicationService, jobService, JobApplication, Job } from '@/services';
import { Search, RefreshCw, Archive } from 'lucide-react';

export const EmployerPipelinePage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchives, setShowArchives] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  }, [loadPipeline]);

  const filteredApplications = applications.filter((app) => {
    const matchesJob = selectedJobId === 'all' || app.job_id === selectedJobId;
    const snapshot = (app.candidate_snapshot || {}) as Record<string, any>;
    const name = (app.candidate?.full_name || snapshot.full_name || '').toLowerCase();
    const headline = (snapshot.headline || '').toLowerCase();
    const jobTitle = (app.job?.title || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.includes(term) || headline.includes(term) || jobTitle.includes(term);
    return matchesJob && matchesSearch;
  });

  const handleApplicationUpdated = (updatedApp: JobApplication) => {
    setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
  };

  return (
    <EmployerShell title="ATS Candidate Pipeline" currentPath="/employer/pipeline">
      <div className="space-y-4 font-sans">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
            <Input
              placeholder="Search candidates or positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <div className="w-full sm:w-64">
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                options={[
                  { value: 'all', label: 'All Active Requisitions' },
                  ...jobs.map((j) => ({ value: j.id, label: j.title })),
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
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

        {/* Pipeline Summary Bar */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-kth-slate-500">
            Managing <strong className="text-kth-slate-900">{isLoading ? '...' : filteredApplications.length} active candidates</strong> in recruitment workflow
          </span>
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
