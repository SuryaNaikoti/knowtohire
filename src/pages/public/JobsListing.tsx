import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockJobs } from '../../constants/mockData';
import type { Job } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState, CardSkeleton } from '../../components/ui/Skeleton';
import { Search, MapPin, DollarSign, Calendar, SlidersHorizontal, Check, RefreshCw, X, Briefcase } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  // Filter logic
  const filteredJobs = mockJobs.filter((job: Job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || job.department === selectedDept;
    const matchesType = selectedType === 'All' || job.type === selectedType;

    return matchesSearch && matchesDept && matchesType;
  });

  const departments = ['All', 'Engineering', 'Design', 'Research', 'Marketing', 'Finance', 'ESG & Sustainability'];
  const jobTypes = ['All', 'Full-time', 'Part-time', 'Remote', 'Hybrid'];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedType('All');
  };

  return (
    <div className="bg-slate-50/30 flex-1 w-full min-h-screen animate-fade-in-up">
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
            Explore <span className="kth-gradient-text">Opportunities</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
            Connect directly with leading companies and teams looking for your exact skills and experience.
          </p>
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
          
          {/* Query Search Bar */}
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
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

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto self-stretch sm:self-auto shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-slate-250 bg-white text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-400" /> Filters
              </button>
              <span className="text-xs font-bold text-slate-550 shrink-0 self-center px-1">
                {filteredJobs.length} Positions Available
              </span>
            </div>
          </div>

          {/* Jobs Feed Cards */}
          <div className="space-y-4">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  hoverEffect
                  className="hover:shadow-premium hover:-translate-y-0.5 border border-slate-200 relative flex flex-col group shadow-sm bg-white rounded-[24px] overflow-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center text-left">
                    
                    {/* Company Logo wrapper */}
                    <div className="w-14 h-14 rounded-xl border border-slate-100 shrink-0 shadow-sm overflow-hidden flex items-center justify-center bg-slate-50">
                      <img
                        src={job.logo}
                        alt={`${job.company} logo`}
                        className="w-10 h-10 object-contain"
                      />
                    </div>

                    {/* Metadata column */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-lg select-none">
                          {job.company}
                        </span>
                        {job.matchScore && (
                          <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg select-none border border-teal-200/20">
                            🔥 {job.matchScore}% Match Dossier
                          </span>
                        )}
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
                                   {/* CTAs column */}
                    <div className="shrink-0 flex sm:flex-col items-end gap-3 self-stretch sm:self-center justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {job.postedAt}
                      </span>
                      <Link to={`/jobs/${job.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto font-bold text-xs py-2 px-4 border-slate-200 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500/20">
                          View Details
                        </Button>
                      </Link>
                    </div>

                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState 
                title="No Opportunities Match"
                description="Try adjusting your filters, clearing the search query, or resetting to see new active vacancy postings."
                icon={<Search className="h-12 w-12 text-slate-300" />}
                actionText="Clear Filters"
                onAction={resetFilters}
              />
            )}
          </div>
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
                  <SlidersHorizontal className="w-4 h-4 text-slate-450" /> Filter Criteria
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
                        ${selectedDept === dept ? 'bg-emerald-50 text-emerald-805' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
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
                        ${selectedType === type ? 'bg-emerald-50 text-emerald-805' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
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
