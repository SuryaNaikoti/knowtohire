import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { mockJobs } from '../../constants/mockData';
import type { Job } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/CardSkeleton';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  SlidersHorizontal, 
  Check, 
  RefreshCw, 
  X, 
  Briefcase, 
  LayoutGrid, 
  List, 
  Columns, 
  Heart, 
  Send, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Building2 
} from 'lucide-react';

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-jobs" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-jobs)" />
    </svg>
  </div>
);

export const JobsListing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const locationParam = searchParams.get('location') || '';
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedDept, setSelectedDept] = useState(categoryParam ? categoryParam : 'All');
  const [selectedType, setSelectedType] = useState('All');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Design View Mode state: 'grid' | 'list' | 'split' with persistence
  const viewParam = searchParams.get('view') as 'grid' | 'list' | 'split' | null;
  const initialView = viewParam || (localStorage.getItem('knowtohire_jobs_view') as 'grid' | 'list' | 'split') || 'split';
  const [viewMode, setViewModeState] = useState<'grid' | 'list' | 'split'>(initialView);

  const setViewMode = (mode: 'grid' | 'list' | 'split') => {
    setViewModeState(mode);
    localStorage.setItem('knowtohire_jobs_view', mode);
  };
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);

  useEffect(() => {
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParam]);

  const clearLocationFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('location');
    setSearchParams(newParams);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  // Filter logic
  const filteredJobs = mockJobs.filter((job: Job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || job.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesType = selectedType === 'All' || job.type === selectedType;

    const matchesLocation =
      !locationParam ||
      job.location.toLowerCase().includes(locationParam.toLowerCase()) ||
      locationParam.toLowerCase().includes(job.location.toLowerCase().split(' ')[0]);

    return matchesSearch && matchesDept && matchesType && matchesLocation;
  });

  // Automatically select first job in split view if none is selected
  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(filteredJobs[0].id);
    } else if (filteredJobs.length === 0) {
      setSelectedJobId(null);
    }
  }, [filteredJobs, selectedJobId]);

  const departments = ['All', 'Engineering', 'Design', 'Research', 'Marketing', 'Finance', 'ESG & Sustainability', 'Healthcare'];
  const jobTypes = ['All', 'Full-time', 'Part-time', 'Remote', 'Hybrid'];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedType('All');
    setSearchParams({});
    if (filteredJobs.length > 0) {
      setSelectedJobId(filteredJobs[0].id);
    }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedJobs(prev => 
      prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
    );
  };

  // Dynamic Header Title
  const getHeaderTitle = () => {
    if (locationParam) return `Jobs in ${locationParam}`;
    if (categoryParam) return `${categoryParam.toUpperCase()} Positions`;
    if (searchParam) return `Results for "${searchParam}"`;
    return 'Explore Opportunities';
  };

  // Currently active job details for split view
  const activeJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0];

  return (
    <div className="bg-slate-50/50 flex-1 w-full min-h-screen animate-fade-in-up">
      {/* Editorial Page Header */}
      <div className="relative bg-white border-b border-slate-150 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
        <DotGrid className="text-slate-400 opacity-25" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-6 relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Active Boards</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-heading text-slate-900 tracking-tight leading-none">
            {getHeaderTitle()}
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
            Connect directly with leading companies and teams looking for your exact skills and experience.
          </p>

          {/* Active Location Filter Banner */}
          {locationParam && (
            <div className="inline-flex items-center gap-2 bg-emerald-100/70 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location Filter Active: <strong>{locationParam}</strong></span>
              <button
                onClick={clearLocationFilter}
                className="ml-2 hover:bg-emerald-200/60 p-1 rounded-md transition-colors cursor-pointer text-emerald-800"
                title="Clear location filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 w-full flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filter Panel (Desktop) */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-6">
          <Card className="bg-white p-6 shadow-sm border border-slate-200 rounded-[20px] sticky top-24 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Filter Criteria
              </h3>
              <button 
                onClick={resetFilters} 
                className="text-[10px] font-bold text-slate-400 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Department Filter List */}
            <div className="space-y-3 mb-6">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Department Sector
              </label>
              <div className="flex flex-col gap-1">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => { setSelectedDept(dept); simulateLoading(); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer w-full border-none focus:ring-2 focus:ring-emerald-500/20
                      ${selectedDept === dept ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <span>{dept}</span>
                    {selectedDept === dept && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Type Filter List */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Work Arrangement
              </label>
              <div className="flex flex-col gap-1">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); simulateLoading(); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer w-full border-none focus:ring-2 focus:ring-emerald-500/20
                      ${selectedType === type ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <span>{type}</span>
                    {selectedType === type && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 space-y-6">
          
          {/* Query Search & View Mode Switcher Bar */}
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search job title, company, skills, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs font-medium border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                aria-label="Search Job listings"
              />
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-450" /> Filters
              </button>
              
              {/* Modern View Switcher (Grid / List / Split) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-2 rounded-lg transition-all cursor-pointer hover:text-slate-800 ${viewMode === 'split' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-400'}`}
                  title="Split Pane View"
                >
                  <Columns className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all cursor-pointer hover:text-slate-800 ${viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-400'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all cursor-pointer hover:text-slate-800 ${viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-400'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs font-bold text-slate-550 shrink-0 px-1">
                {filteredJobs.length} Positions
              </span>
            </div>
          </div>

          {/* Dynamic Views Rendering */}
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredJobs.length === 0 ? (
            <EmptyState 
              title="No Opportunities Match"
              description="Try adjusting your filters, clearing the location filter or search query, or resetting to see new active vacancy postings."
              actionLabel="Clear All Filters"
              onAction={resetFilters}
              icon="filter"
            />
          ) : viewMode === 'split' ? (
            /* ──────────────────────────────────────────────────────────
               1. SPLIT VIEW LAYOUT
               ────────────────────────────────────────────────────────── */
            <div className="flex gap-6 h-[720px] items-stretch">
              {/* Left Jobs List Pane */}
              <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedJobId(job.id);
                        if (window.innerWidth < 768) {
                          navigate(`/jobs/${job.id}`);
                        }
                      }
                    }}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      if (window.innerWidth < 768) {
                        navigate(`/jobs/${job.id}`);
                      }
                    }}
                    className={`p-4 border rounded-[20px] text-left cursor-pointer transition-all duration-300 relative group flex gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500
                      ${selectedJobId === job.id 
                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-xs'
                      }
                    `}
                  >
                    <div className="w-10 h-10 rounded-lg border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center bg-slate-50">
                      <img src={job.logo} alt={job.company} className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {job.company}
                        </span>
                        {job.matchScore && (
                          <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md shrink-0">
                            🔥 {job.matchScore}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {job.location.split(' ')[0]}</span>
                        <span className="flex items-center gap-0.5 font-semibold text-slate-700"><DollarSign className="w-3 h-3" /> {job.salary.split(' - ')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Expanded Details Pane */}
              <div className="hidden md:flex flex-1 bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden flex-col text-left">
                {activeJob ? (
                  <div className="flex flex-col h-full overflow-y-auto">
                    {/* Detail Header Accent Gradient */}
                    <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 shrink-0" />
                    
                    {/* Header Details */}
                    <div className="p-8 border-b border-slate-100 space-y-6">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-center bg-slate-50">
                            <img src={activeJob.logo} alt={activeJob.company} className="w-12 h-12 object-contain" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                                {activeJob.company}
                              </span>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                                {activeJob.type}
                              </span>
                            </div>
                            <h2 
                              className="text-xl font-black text-slate-900 leading-snug cursor-pointer hover:text-emerald-700 transition-colors"
                              onClick={() => navigate(`/jobs/${activeJob.id}`)}
                              title="Click to view full job details page"
                            >
                              {activeJob.title}
                            </h2>
                          </div>
                        </div>

                        {/* Match Score Radial Gauge */}
                        {activeJob.matchScore && (
                          <div className="flex items-center gap-2 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-3 rounded-2xl shadow-xs">
                            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                            <div className="text-right">
                              <div className="text-[10px] font-black uppercase text-teal-800 tracking-wider">Match Dossier</div>
                              <div className="text-lg font-black text-teal-700 leading-none">{activeJob.matchScore}% Quality</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Detail Parameters */}
                      <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold flex-wrap bg-slate-50 p-4 rounded-xl">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{activeJob.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span>{activeJob.salary}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Posted {activeJob.postedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-6 flex-1">
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" /> Position Overview
                        </h4>
                        <p className="text-sm text-slate-650 leading-relaxed font-medium">
                          {activeJob.description}
                        </p>
                      </div>

                      {activeJob.requirements && activeJob.requirements.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Key Requirements
                          </h4>
                          <ul className="grid grid-cols-1 gap-2.5">
                            {activeJob.requirements.map((req, index) => (
                              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeJob.benefits && activeJob.benefits.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-500" /> Benefits & Compensation
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {activeJob.benefits.map((benefit, index) => (
                              <span key={index} className="bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA Actions */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
                      <Button
                        onClick={(e) => toggleBookmark(activeJob.id, e)}
                        variant="outline"
                        className="rounded-xl px-4 py-2.5 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
                      >
                        <Heart 
                          className={`w-4 h-4 ${bookmarkedJobs.includes(activeJob.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} 
                        />
                      </Button>
                      <Button
                        onClick={() => navigate(`/jobs/${activeJob.id}`)}
                        variant="primary"
                        className="flex-1 rounded-xl font-extrabold text-xs py-3 flex items-center justify-center gap-2 transition-all bg-emerald-650 hover:bg-emerald-700 text-white cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>View Full Job Details & Apply</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                    Select a job to view details
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* ──────────────────────────────────────────────────────────
               2. GRID VIEW LAYOUT
               ────────────────────────────────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  hoverEffect
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/jobs/${job.id}`);
                    }
                  }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="bg-white border border-slate-200 rounded-[24px] relative flex flex-col group shadow-sm text-left overflow-hidden transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Top Row: Logo & Match Score */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="w-12 h-12 rounded-xl border border-slate-100 shrink-0 shadow-sm overflow-hidden flex items-center justify-center bg-slate-50">
                          <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" />
                        </div>
                        {job.matchScore && (
                          <span className="text-[10px] font-black text-teal-800 bg-teal-55/10 border border-teal-200/40 px-2.5 py-1 rounded-lg">
                            🔥 {job.matchScore}% Match
                          </span>
                        )}
                      </div>

                      {/* Info block */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {job.company}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {job.department}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                            {job.type}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                          {job.title}
                        </h3>
                      </div>

                      {/* Parameters */}
                      <div className="space-y-2 pt-2 border-t border-slate-50 text-xs text-slate-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.salary.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom buttons */}
                    <div className="flex items-center gap-3 pt-4 mt-6 border-t border-slate-100">
                      <Button
                        onClick={(e) => toggleBookmark(job.id, e)}
                        variant="outline"
                        className="rounded-lg p-2.5 hover:bg-slate-55 transition-colors shrink-0"
                      >
                        <Heart className={`w-3.5 h-3.5 ${bookmarkedJobs.includes(job.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                      </Button>
                      <Link to={`/jobs/${job.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="w-full font-bold text-xs py-2 px-3 rounded-lg border-slate-200 hover:bg-slate-50">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* ──────────────────────────────────────────────────────────
               3. LIST VIEW LAYOUT (Enhanced Modern List)
               ────────────────────────────────────────────────────────── */
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  hoverEffect
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/jobs/${job.id}`);
                    }
                  }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="hover:shadow-premium hover:-translate-y-0.5 border border-slate-200 relative flex flex-col group shadow-sm bg-white rounded-[24px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center text-left">
                    <div className="w-14 h-14 rounded-xl border border-slate-100 shrink-0 shadow-sm overflow-hidden flex items-center justify-center bg-slate-50">
                      <img src={job.logo} alt={`${job.company} logo`} className="w-10 h-10 object-contain" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-lg select-none">
                          {job.company}
                        </span>
                        {job.matchScore && (
                          <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg select-none border border-teal-200/20 animate-pulse">
                            🔥 {job.matchScore}% Match Dossier
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg select-none">
                          {job.department}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg select-none">
                          {job.type}
                        </span>
                      </div>
                      
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading leading-snug">
                        {job.title}
                      </h2>
                      
                      <div className="text-xs text-slate-450 font-semibold flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-700 font-bold">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.salary}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-end gap-3 self-stretch sm:self-center justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {job.postedAt}
                      </span>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={(e) => toggleBookmark(job.id, e)}
                          variant="outline"
                          className="rounded-lg p-2 hover:bg-slate-55 shrink-0 border-slate-200"
                        >
                          <Heart className={`w-3.5 h-3.5 ${bookmarkedJobs.includes(job.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                        </Button>
                        <Link to={`/jobs/${job.id}`} className="flex-1 sm:flex-none" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="w-full font-bold text-xs py-2 px-4 border-slate-200 rounded-lg hover:bg-slate-50">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Overlay filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative bg-white w-full max-w-xs p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in-up">
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-455" /> Filter Criteria
                </h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Department */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Department Sector
                </label>
                <div className="flex flex-col gap-1">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDept(dept);
                        setMobileFiltersOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer w-full border-none
                        ${selectedDept === dept ? 'bg-emerald-50 text-emerald-805' : 'bg-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                    >
                      <span>{dept}</span>
                      {selectedDept === dept && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Type */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Work Arrangement
                </label>
                <div className="flex flex-col gap-1">
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setMobileFiltersOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer w-full border-none
                        ${selectedType === type ? 'bg-emerald-50 text-emerald-805' : 'bg-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                    >
                      <span>{type}</span>
                      {selectedType === type && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={resetFilters}>
                Reset
              </Button>
              <Button variant="primary" size="sm" className="flex-1 rounded-lg bg-emerald-650 hover:bg-emerald-700 text-white" onClick={() => setMobileFiltersOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsListing;
