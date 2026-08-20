import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from '@/components/public/SectionHeader';
import { JobCard } from '@/components/cards/JobCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { jobService, Job, EmploymentType, WorkMode } from '@/services';
import { Search, Briefcase, RefreshCw, XCircle } from 'lucide-react';

export const JobsPage: React.FC = () => {
  // Read initial query parameters from URL
  const getInitialParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      keyword: params.get('q') || '',
      location: params.get('location') || 'all',
      type: params.get('type') || 'all',
      workMode: params.get('work_mode') || 'all',
      sortBy: params.get('sort') || 'latest',
      page: parseInt(params.get('page') || '1', 10) || 1,
    };
  };

  const initial = getInitialParams();

  // Filter States
  const [searchTerm, setSearchTerm] = useState(initial.keyword);
  const [selectedLocation, setSelectedLocation] = useState(initial.location);
  const [selectedType, setSelectedType] = useState(initial.type);
  const [selectedWorkMode, setSelectedWorkMode] = useState(initial.workMode);
  const [sortBy, setSortBy] = useState(initial.sortBy);
  const [currentPage, setCurrentPage] = useState(initial.page);

  // Data States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync URL query parameters
  const updateUrlParams = useCallback((paramsObj: Record<string, string | number>) => {
    const url = new URL(window.location.href);
    Object.entries(paramsObj).forEach(([key, val]) => {
      if (val && val !== 'all' && val !== 1 && val !== 'latest' && val !== '') {
        url.searchParams.set(key, String(val));
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Fetch Published Jobs from Supabase
  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await jobService.getPublishedJobs({
      keyword: searchTerm.trim() || undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
      employment_type: selectedType !== 'all' ? (selectedType as EmploymentType) : undefined,
      work_mode: selectedWorkMode !== 'all' ? (selectedWorkMode as WorkMode) : undefined,
      sort_by: sortBy as 'latest' | 'salary_high' | 'salary_low' | 'deadline',
      page: currentPage,
      pageSize: 12,
    });

    if (error) {
      setErrorMessage(error.message);
      setJobs([]);
      setTotalCount(0);
      setTotalPages(1);
    } else if (data) {
      setJobs(data.data);
      setTotalCount(data.count);
      setTotalPages(data.totalPages);
    }

    setIsLoading(false);
  }, [searchTerm, selectedLocation, selectedType, selectedWorkMode, sortBy, currentPage]);

  useEffect(() => {
    loadJobs();
    updateUrlParams({
      q: searchTerm,
      location: selectedLocation,
      type: selectedType,
      work_mode: selectedWorkMode,
      sort: sortBy,
      page: currentPage,
    });
  }, [loadJobs, updateUrlParams, searchTerm, selectedLocation, selectedType, selectedWorkMode, sortBy, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('all');
    setSelectedType('all');
    setSelectedWorkMode('all');
    setSortBy('latest');
    setCurrentPage(1);
  };

  const handleJobClick = (jobId: string) => {
    window.history.pushState({}, '', `/jobs/${jobId}`);
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
    <div className="py-12 bg-kth-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Job Discovery Feed"
          badgeVariant="indigo"
          title="Find Your Next Opportunity"
          subtitle="Explore verified roles in sustainability, ESG, renewable energy, and environmental engineering across India."
        />

        {/* Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-kth-slate-200 shadow-xs mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Keyword Search */}
            <Input
              placeholder="Search by job title, skill, department..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="w-4 h-4" />}
            />

            {/* Location Selector */}
            <Select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Locations (India)' },
                { value: 'Bengaluru', label: 'Bengaluru, KA' },
                { value: 'Hyderabad', label: 'Hyderabad, TS' },
                { value: 'Mumbai', label: 'Mumbai, MH' },
                { value: 'Delhi', label: 'Delhi NCR' },
                { value: 'Pune', label: 'Pune, MH' },
                { value: 'Chennai', label: 'Chennai, TN' },
                { value: 'Kolkata', label: 'Kolkata, WB' },
              ]}
            />

            {/* Employment Type */}
            <Select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Employment Types' },
                { value: 'full_time', label: 'Full-Time' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'contract', label: 'Contract' },
                { value: 'part_time', label: 'Part-Time' },
                { value: 'internship', label: 'Internship' },
              ]}
            />

            {/* Sort Order */}
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'latest', label: 'Sort: Most Recent' },
                { value: 'salary_high', label: 'Sort: Highest Salary' },
                { value: 'salary_low', label: 'Sort: Lowest Salary' },
                { value: 'deadline', label: 'Sort: Closing Soon' },
              ]}
            />
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <span className="text-xs font-semibold text-kth-slate-600">
            Showing <strong className="text-kth-slate-900 font-mono">{isLoading ? '...' : totalCount}</strong> active verified listings
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="indigo">Verified Employers</Badge>
            <Badge variant="emerald">INR ₹ Salary Bands</Badge>
          </div>
        </div>

        {/* Error Alert with Retry */}
        {errorMessage && (
          <div className="mb-8">
            <Alert variant="error" title="Failed to Load Job Listings">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span>{errorMessage}</span>
                <Button variant="outline" size="sm" onClick={loadJobs} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                  Retry
                </Button>
              </div>
            </Alert>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
            <h3 className="font-display font-bold text-lg text-kth-slate-900">No Job Openings Found</h3>
            <p className="text-xs text-kth-slate-500 leading-relaxed">
              We couldn&apos;t find any active listings matching your filter criteria. Try adjusting your keyword or clearing filters.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={handleClearFilters} leftIcon={<XCircle className="w-4 h-4" />}>
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Job Cards Grid */}
        {!isLoading && !errorMessage && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
                postedDate={formatRelativeDate(job.published_at || job.created_at)}
                onApply={() => handleJobClick(job.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !errorMessage && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <span className="text-xs font-semibold text-kth-slate-600 px-3">
              Page <strong className="font-mono text-kth-slate-900">{currentPage}</strong> of <strong className="font-mono text-kth-slate-900">{totalPages}</strong>
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
