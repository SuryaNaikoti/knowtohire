import React, { useState, useEffect, useCallback } from 'react';
import { JobCard } from '@/components/cards/JobCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { jobService, taxonomyService, Job, EmploymentType, WorkMode } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { Search, Briefcase, RefreshCw, XCircle, ShieldCheck, Banknote, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

const DEFAULT_CAREER_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'General', label: 'General Careers' },
  { value: 'Environmental', label: 'Environmental Careers' },
  { value: 'ESG', label: 'ESG Careers' },
  { value: 'Sustainability', label: 'Sustainability Careers' },
  { value: 'Patent', label: 'Patent Careers' },
  { value: 'IPR', label: 'IPR Careers' },
  { value: 'Research', label: 'Research Careers' },
  { value: 'Consulting', label: 'Consulting Careers' },
];

const DEFAULT_LOCATION_OPTIONS = [
  { value: 'all', label: 'All Locations (India)' },
  { value: 'Bengaluru', label: 'Bengaluru, KA' },
  { value: 'Hyderabad', label: 'Hyderabad, TS' },
  { value: 'Mumbai', label: 'Mumbai, MH' },
  { value: 'Delhi', label: 'Delhi NCR' },
  { value: 'Pune', label: 'Pune, MH' },
  { value: 'Chennai', label: 'Chennai, TN' },
  { value: 'Kolkata', label: 'Kolkata, WB' },
  { value: 'Remote', label: 'Remote Only' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Employment Types' },
  { value: 'full_time', label: 'Full-Time' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'contract', label: 'Contract' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'internship', label: 'Internship' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Sort: Most Recent' },
  { value: 'salary_high', label: 'Sort: Highest Salary' },
  { value: 'salary_low', label: 'Sort: Lowest Salary' },
  { value: 'deadline', label: 'Sort: Closing Soon' },
];

export const JobsPage: React.FC = () => {
  // Read initial query parameters from URL
  const getInitialParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      keyword: params.get('q') || '',
      category: params.get('category') || 'all',
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
  const [selectedCategory, setSelectedCategory] = useState(initial.category);
  const [selectedLocation, setSelectedLocation] = useState(initial.location);
  const [selectedType, setSelectedType] = useState(initial.type);
  const [selectedWorkMode, setSelectedWorkMode] = useState(initial.workMode);
  const [sortBy, setSortBy] = useState(initial.sortBy);
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedLocation !== 'all' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (sortBy !== 'latest' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedType('all');
    setSortBy('latest');
    setCurrentPage(1);
  };

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

  // Taxonomy Dynamic Options
  const [categoriesOptions, setCategoriesOptions] = useState<{ value: string; label: string }[]>(DEFAULT_CAREER_CATEGORIES);
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>(DEFAULT_LOCATION_OPTIONS);

  useEffect(() => {
    async function loadTaxonomyFilters() {
      const [catRes, cityRes] = await Promise.all([
        taxonomyService.getCareerCategories(),
        taxonomyService.searchCities('', 'country-in'),
      ]);
      if (catRes.data && catRes.data.length > 0) {
        setCategoriesOptions([
          { value: 'all', label: 'All Categories' },
          ...catRes.data.map((c) => ({ value: c.name.replace(' Careers', ''), label: c.name })),
        ]);
      }
      if (cityRes.data && cityRes.data.length > 0) {
        setLocationOptions([
          { value: 'all', label: 'All Locations (India)' },
          ...cityRes.data.map((c) => ({ value: c.name, label: `${c.name}, India` })),
          { value: 'Remote', label: 'Remote Only' },
        ]);
      }
    }
    loadTaxonomyFilters();
  }, []);

  // Fetch Published Jobs from Supabase
  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await jobService.getPublishedJobs({
      keyword: searchTerm.trim() || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
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
  }, [searchTerm, selectedCategory, selectedLocation, selectedType, selectedWorkMode, sortBy, currentPage]);

  useEffect(() => {
    loadJobs();
    updateUrlParams({
      q: searchTerm,
      category: selectedCategory,
      location: selectedLocation,
      type: selectedType,
      work_mode: selectedWorkMode,
      sort: sortBy,
      page: currentPage,
    });
  }, [loadJobs, updateUrlParams, searchTerm, selectedCategory, selectedLocation, selectedType, selectedWorkMode, sortBy, currentPage]);

  const { isAuthenticated, role } = useAuth();

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedType('all');
    setSelectedWorkMode('all');
    setSortBy('latest');
    setCurrentPage(1);
  };

  const handleJobClick = (jobId: string) => {
    const targetPath = isAuthenticated && role === 'candidate' ? `/candidate/jobs/${jobId}` : `/jobs/${jobId}`;
    window.history.pushState({}, '', targetPath);
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
    <div className="py-8 sm:py-12 bg-kth-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Page Header */}
        <div className="mb-6 sm:mb-8 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-kth-primary-50 border border-kth-primary-200/80 mb-2.5 shadow-2xs">
            <span className="text-[10px] font-bold text-kth-primary-700 uppercase tracking-wider">
              Job Discovery
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-kth-slate-900 tracking-tight leading-tight">
            Find Your Next Opportunity
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-kth-slate-600 mt-2 max-w-3xl leading-relaxed font-normal">
            Explore verified career opportunities across sustainability, ESG, environmental, research, IPR and related professional domains across India.
          </p>
        </div>

        {/* 2. Unified Search & Filter Container */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-kth-slate-200 shadow-xs mb-6 sm:mb-8 space-y-2.5 sm:space-y-0">
          
          {/* Desktop & Tablet Flex Layout (Largest search field + Category + Location + Type + Sort) */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="flex-1 min-w-[220px]">
              <Input
                placeholder="Search job title, skills, keywords..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
              />
            </div>

            <div className="w-48 shrink-0">
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                options={categoriesOptions}
              />
            </div>

            <div className="w-48 shrink-0">
              <Select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                options={locationOptions}
              />
            </div>

            <div className="w-52 shrink-0">
              <Select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                options={EMPLOYMENT_TYPE_OPTIONS}
              />
            </div>

            <div className="w-48 shrink-0">
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          {/* Mobile & Tablet Responsive Filter Layout */}
          <div className="flex lg:hidden flex-col gap-2.5">
            <Input
              placeholder="Search job title, skills, keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
            />

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  isMobileFiltersOpen || activeFiltersCount > 0
                    ? 'bg-kth-primary-50 text-kth-primary-700 border-kth-primary-200'
                    : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:bg-kth-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-kth-primary-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                    {activeFiltersCount}
                  </span>
                )}
                {isMobileFiltersOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-kth-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-kth-slate-400" />
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* Expandable Mobile Filters */}
            <div className={`space-y-2 pt-1 transition-all duration-200 ${isMobileFiltersOpen ? 'block' : 'hidden sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0'}`}>
              <div>
                <label className="text-[10px] font-bold text-kth-slate-500 uppercase tracking-wider block mb-1">
                  Career Category
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={categoriesOptions}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-kth-slate-500 uppercase tracking-wider block mb-1">
                  Location (India)
                </label>
                <Select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={locationOptions}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-kth-slate-500 uppercase tracking-wider block mb-1">
                  Employment Type
                </label>
                <Select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={EMPLOYMENT_TYPE_OPTIONS}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-kth-slate-500 uppercase tracking-wider block mb-1">
                  Sort Order
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={SORT_OPTIONS}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Results Header with Subtle Trust Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <span className="text-xs sm:text-sm font-semibold text-kth-slate-700">
            Showing <strong className="text-kth-slate-900 font-mono font-bold">{isLoading ? '...' : totalCount}</strong> verified opportunities
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kth-slate-600 bg-kth-slate-100/90 border border-kth-slate-200/80 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3 text-kth-primary-600" />
              Verified Employers
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-full">
              <Banknote className="w-3 h-3 text-emerald-600" />
              INR Salary Bands
            </span>
          </div>
        </div>

        {/* 4. Error Alert with Retry */}
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

        {/* 5. Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-kth-slate-200 p-5 sm:p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-kth-slate-200" />
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

        {/* 6. Premium Empty State */}
        {!isLoading && !errorMessage && jobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-kth-slate-200 p-10 sm:p-14 text-center max-w-lg mx-auto my-8 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900">
              No matching opportunities
            </h3>
            <p className="text-xs text-kth-slate-500 leading-relaxed max-w-sm mx-auto">
              Try adjusting your category, location or employment filters.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={handleClearFilters} leftIcon={<XCircle className="w-4 h-4" />}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* 7. Job Cards Grid (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
        {!isLoading && !errorMessage && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5 mb-10 sm:mb-12">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.company?.name || (job as any).company_name || 'EcoStrategy India'}
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

        {/* 8. Pagination Controls */}
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
