import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { JobCard } from '@/components/cards/JobCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { jobService, savedJobService, Job } from '@/services';
import { Search, Briefcase, RefreshCw, XCircle } from 'lucide-react';

export const CandidateJobsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load published jobs and candidate saved jobs
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [jobsRes, savedRes] = await Promise.all([
      jobService.getPublishedJobs({
        keyword: searchTerm.trim() || undefined,
        location: selectedLoc !== 'all' ? selectedLoc : undefined,
        pageSize: 30,
        sort_by: 'latest',
      }),
      savedJobService.getMySavedJobs(),
    ]);

    if (jobsRes.error) {
      setErrorMessage(jobsRes.error.message);
      setJobs([]);
    } else if (jobsRes.data) {
      setJobs(jobsRes.data.data);
    }

    if (savedRes.data) {
      setSavedJobIds(new Set(savedRes.data.map((s) => s.job_id)));
    }

    setIsLoading(false);
  }, [searchTerm, selectedLoc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Save / Unsave bookmark toggle
  const handleSaveToggle = async (jobId: string) => {
    const isCurrentlySaved = savedJobIds.has(jobId);

    // Optimistic UI update
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });

    if (isCurrentlySaved) {
      const { error } = await savedJobService.unsaveJob(jobId);
      if (error) {
        // Rollback on error
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } else {
      const { error } = await savedJobService.saveJob(jobId);
      if (error) {
        // Rollback on error
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      }
    }
  };

  const handleJobClick = (jobId: string) => {
    window.history.pushState({}, '', `/candidate/jobs/${jobId}`);
    window.dispatchEvent(new Event('popstate'));
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

  return (
    <CandidateShell title="Find Jobs" currentPath="/candidate/jobs">
      <div className="space-y-6 font-sans">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by job title, skill, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              options={[
                { value: 'all', label: 'All Locations' },
                { value: 'Bengaluru', label: 'Bengaluru, KA' },
                { value: 'Hyderabad', label: 'Hyderabad, TS' },
                { value: 'Mumbai', label: 'Mumbai, MH' },
                { value: 'Delhi', label: 'Delhi NCR' },
                { value: 'Pune', label: 'Pune, MH' },
                { value: 'Chennai', label: 'Chennai, TN' },
                { value: 'Kolkata', label: 'Kolkata, WB' },
              ]}
            />
          </div>
        </div>

        {/* Candidate Context Pill */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-kth-slate-500">
            Showing <strong className="text-kth-slate-900">{isLoading ? '...' : jobs.length}</strong> verified ESG & sustainability openings
          </span>
          <Badge variant="emerald" hasPulse>AI Skill Match Active</Badge>
        </div>

        {/* Error Alert with Retry */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Jobs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
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
                <div className="flex gap-1.5 pt-2">
                  <div className="h-5 bg-kth-slate-100 rounded w-14" />
                  <div className="h-5 bg-kth-slate-100 rounded w-14" />
                </div>
                <div className="pt-4 border-t border-kth-slate-100 flex justify-between items-center">
                  <div className="h-3 bg-kth-slate-100 rounded w-20" />
                  <div className="h-8 bg-kth-slate-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && jobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-kth-slate-200 p-12 text-center max-w-lg mx-auto my-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900">No Matching Roles Found</h3>
            <p className="text-xs text-kth-slate-500 leading-relaxed">
              We couldn&apos;t find any active job openings for your search criteria. Try modifying your keyword or location.
            </p>
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLoc('all');
                }}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Clear Search Filters
              </Button>
            </div>
          </div>
        )}

        {/* Job Cards Grid */}
        {!isLoading && !errorMessage && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
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
                isSaved={savedJobIds.has(job.id)}
                postedDate={formatRelativeDate(job.published_at || job.created_at)}
                onSaveToggle={() => handleSaveToggle(job.id)}
                onApply={() => handleJobClick(job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </CandidateShell>
  );
};
