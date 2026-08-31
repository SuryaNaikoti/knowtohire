import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { JobCard } from '@/components/cards/JobCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { jobService, savedJobService, candidateProfileService, Job } from '@/services';
import { Search, Briefcase, RefreshCw, XCircle, Sparkles } from 'lucide-react';

export const CandidateJobsPage: React.FC = () => {
  const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialMatch = queryParams.get('match') === 'profile' || queryParams.get('filter') === 'matching';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'salary_high' | 'salary_low' | 'deadline'>('latest');
  const [workMode, setWorkMode] = useState<string>('all');
  const [employmentType, setEmploymentType] = useState<string>('all');
  const [isMatchOnly, setIsMatchOnly] = useState(initialMatch);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load published jobs and candidate saved jobs
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [savedRes, cpRes] = await Promise.all([
      savedJobService.getMySavedJobs(),
      candidateProfileService.getMyCandidateProfile(),
    ]);

    if (savedRes.data) {
      setSavedJobIds(new Set(savedRes.data.map((s) => s.job_id)));
    }

    let loadedJobs: Job[] = [];

    if (isMatchOnly && cpRes.data) {
      const matchRes = await jobService.getMatchingJobsForCandidate(cpRes.data, 60);
      if (matchRes.data) {
        loadedJobs = matchRes.data;
      }
    } else {
      const jobsRes = await jobService.getPublishedJobs({
        keyword: searchTerm.trim() || undefined,
        location: selectedLoc !== 'all' ? selectedLoc : undefined,
        work_mode: workMode !== 'all' ? (workMode as any) : undefined,
        employment_type: employmentType !== 'all' ? (employmentType as any) : undefined,
        pageSize: 60,
        sort_by: sortBy,
      });

      if (jobsRes.error) {
        setErrorMessage(jobsRes.error.message);
      } else if (jobsRes.data) {
        loadedJobs = jobsRes.data.data;
      }
    }

    // Apply client filters if in match mode
    if (isMatchOnly && loadedJobs.length > 0) {
      if (searchTerm.trim()) {
        const kw = searchTerm.trim().toLowerCase();
        loadedJobs = loadedJobs.filter(
          (j) =>
            j.title.toLowerCase().includes(kw) ||
            j.department.toLowerCase().includes(kw) ||
            j.description.toLowerCase().includes(kw) ||
            (j.company?.name || '').toLowerCase().includes(kw) ||
            (j.skills || []).some((s) => s.toLowerCase().includes(kw))
        );
      }
      if (selectedLoc !== 'all') {
        loadedJobs = loadedJobs.filter((j) => j.location.toLowerCase().includes(selectedLoc.toLowerCase()));
      }
      if (workMode !== 'all') {
        loadedJobs = loadedJobs.filter((j) => j.work_mode?.toLowerCase() === workMode.toLowerCase());
      }
      if (employmentType !== 'all') {
        loadedJobs = loadedJobs.filter((j) => j.employment_type?.toLowerCase() === employmentType.toLowerCase().replace('-', '_'));
      }
    }

    setJobs(loadedJobs);
    setIsLoading(false);
  }, [searchTerm, selectedLoc, sortBy, workMode, employmentType, isMatchOnly]);

  useEffect(() => {
    loadData();

    const handleSavedJobsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ candidateId: string; jobId: string; isSaved: boolean }>;
      if (customEvent.detail) {
        const { jobId, isSaved } = customEvent.detail;
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          if (isSaved) {
            next.add(jobId);
          } else {
            next.delete(jobId);
          }
          return next;
        });
      } else {
        savedJobService.getMySavedJobs().then((res) => {
          if (res.data) setSavedJobIds(new Set(res.data.map((s) => s.job_id)));
        });
      }
    };

    const handleJobsChanged = () => {
      loadData();
    };

    window.addEventListener('kth_saved_jobs_changed', handleSavedJobsChanged);
    window.addEventListener('kth_jobs_changed', handleJobsChanged);
    return () => {
      window.removeEventListener('kth_saved_jobs_changed', handleSavedJobsChanged);
      window.removeEventListener('kth_jobs_changed', handleJobsChanged);
    };
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

  return (
    <CandidateShell title="Find Jobs" currentPath="/candidate/jobs">
      <div className="space-y-6 font-sans">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by job title, skill, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full md:w-52">
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
            <div className="w-full md:w-52">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'latest', label: 'Sort: Most Recent' },
                  { value: 'salary_high', label: 'Sort: Highest CTC' },
                  { value: 'salary_low', label: 'Sort: Lowest CTC' },
                  { value: 'deadline', label: 'Sort: Closing Soon' },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-kth-slate-100 text-xs text-kth-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMatchOnly(!isMatchOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  isMatchOnly
                    ? 'bg-kth-primary-600 text-white shadow-xs'
                    : 'bg-kth-primary-50 text-kth-primary-700 hover:bg-kth-primary-100 border border-kth-primary-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isMatchOnly ? 'Matched for My Profile (Active)' : 'Match My Profile'}
              </button>

              <span className="text-kth-slate-300">|</span>

              <span className="font-medium text-kth-slate-700">Filter By:</span>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="bg-kth-slate-50 border border-kth-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-kth-slate-700 focus:outline-none focus:ring-1 focus:ring-kth-primary-500 font-medium"
              >
                <option value="all">All Work Modes</option>
                <option value="on_site">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>

              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="bg-kth-slate-50 border border-kth-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-kth-slate-700 focus:outline-none focus:ring-1 focus:ring-kth-primary-500 font-medium"
              >
                <option value="all">All Employment Types</option>
                <option value="full_time">Full-Time</option>
                <option value="part_time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>

              {(searchTerm || selectedLoc !== 'all' || workMode !== 'all' || employmentType !== 'all' || sortBy !== 'latest' || isMatchOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLoc('all');
                    setWorkMode('all');
                    setEmploymentType('all');
                    setSortBy('latest');
                    setIsMatchOnly(false);
                  }}
                  className="text-xs text-kth-primary-600 hover:text-kth-primary-800 font-semibold underline ml-1 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <span className="text-kth-slate-500 font-medium">
              Showing <strong className="text-kth-slate-900">{isLoading ? '...' : jobs.length}</strong> openings
            </span>
          </div>
        </div>

        {/* Matched Profile Notice Banner */}
        {isMatchOnly && (
          <div className="bg-kth-primary-50 border border-kth-primary-100 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-kth-primary-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kth-primary-600 shrink-0" />
              <span>
                <strong>Profile Match Enabled:</strong> Showing positions ranked by compatibility with your verified skills, headline, and domain specialization.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMatchOnly(false)}
              className="text-kth-primary-700 hover:text-kth-primary-900 font-bold underline shrink-0 cursor-pointer"
            >
              View All Jobs
            </button>
          </div>
        )}

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
