import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  ExternalJob,
  ExternalJobSection,
} from '@/types/externalJob';
import {
  externalJobService,
  openExternalJobUrl,
} from '@/services/externalJobService';
import {
  ExternalLink,
  Search,
  Briefcase,
  GraduationCap,
  Users,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';

export interface ExternalJobsPageProps {
  onNavigate?: (path: string) => void;
}

export const ExternalJobsPage: React.FC<ExternalJobsPageProps> = () => {
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Read section filter from URL query if present, e.g. /external-jobs?section=fresher
  const getInitialSection = (): ExternalJobSection | 'all' => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const s = urlParams.get('section');
      if (s === 'latest' || s === 'fresher' || s === 'walk_in') {
        return s;
      }
    }
    return 'all';
  };

  const [activeSection, setActiveSection] = useState<ExternalJobSection | 'all'>(getInitialSection());

  const fetchJobs = async () => {
    setIsLoading(true);
    const res = await externalJobService.getExternalJobs({
      section: activeSection === 'all' ? undefined : activeSection,
      search: searchTerm.trim() || undefined,
    });
    if (res.data) {
      setJobs(res.data);
      // Record impressions
      externalJobService.recordImpressions(res.data.map((j) => j.id));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [activeSection, searchTerm]);

  const handleTabChange = (section: ExternalJobSection | 'all') => {
    setActiveSection(section);
    if (typeof window !== 'undefined') {
      const url = section === 'all' ? '/external-jobs' : `/external-jobs?section=${section}`;
      window.history.pushState({}, '', url);
    }
  };

  const handleJobClick = (job: ExternalJob, e: React.MouseEvent) => {
    e.preventDefault();
    externalJobService.recordClick(job.id);
    openExternalJobUrl(job.redirect_url);
  };

  const getSectionBadge = (section: ExternalJobSection) => {
    switch (section) {
      case 'latest':
        return <Badge variant="indigo">Latest Job</Badge>;
      case 'fresher':
        return <Badge variant="emerald">Fresher Hiring</Badge>;
      case 'walk_in':
        return <Badge variant="amber">Walk-In Interview</Badge>;
      default:
        return <Badge variant="slate">{section}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-kth-slate-50 font-sans flex flex-col">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-kth-slate-900 to-kth-slate-800 text-white py-12 md:py-16 border-b border-kth-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="emerald" className="mb-3">
              Curated Off-Campus & Walk-In Openings
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-4">
              Explore External Opportunities
            </h1>
            <p className="text-sm sm:text-base text-kth-slate-300 leading-relaxed">
              Curated directly by KnowToHire editors. Browse off-campus recruitment drives, fresher hiring programs, and walk-in interviews across leading engineering and tech companies.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Search & Tabs Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Section Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-kth-slate-200 rounded-xl shadow-2xs overflow-x-auto">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                activeSection === 'all'
                  ? 'bg-kth-slate-900 text-white shadow-xs'
                  : 'text-kth-slate-600 hover:text-kth-slate-900 hover:bg-kth-slate-100'
              }`}
            >
              All Openings
            </button>
            <button
              onClick={() => handleTabChange('latest')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                activeSection === 'latest'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-kth-slate-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Latest Jobs</span>
            </button>
            <button
              onClick={() => handleTabChange('fresher')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                activeSection === 'fresher'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-kth-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Fresher Jobs</span>
            </button>
            <button
              onClick={() => handleTabChange('walk_in')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                activeSection === 'walk_in'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-kth-slate-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Walk-In Interviews</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-kth-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by title, company, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs bg-white"
            />
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-kth-slate-500 mb-6 font-medium">
          <span>Showing <strong className="text-kth-slate-900">{jobs.length}</strong> curated opportunities</span>
          <span className="text-[11px] text-kth-slate-400">All opportunities link directly to external career portals</span>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="p-5 border-kth-slate-200 animate-pulse space-y-3">
                <div className="h-4 bg-kth-slate-200 rounded w-1/3" />
                <div className="h-5 bg-kth-slate-200 rounded w-5/6" />
                <div className="h-4 bg-kth-slate-100 rounded w-1/2" />
                <div className="h-8 bg-kth-slate-100 rounded w-full mt-4" />
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-kth-slate-200 p-12 text-center max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-kth-slate-400 mx-auto mb-3 stroke-1" />
            <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1">
              No Curated Openings Found
            </h3>
            <p className="text-xs text-kth-slate-500 mb-4">
              We couldn't find any opportunities matching your current filters. Try changing your search query or tab.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveSection('all');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-kth-slate-200 p-5 shadow-sm hover:shadow-md hover:border-kth-primary-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {getSectionBadge(job.section)}
                    <span className="text-[10px] text-kth-slate-400 font-mono">
                      Priority #{job.display_order}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-sm sm:text-base text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors leading-snug break-words">
                      {job.title}
                    </h3>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-kth-slate-100 text-xs text-kth-slate-600">
                    {job.company_name && (
                      <div className="flex items-center gap-1.5 font-medium text-kth-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                        <span className="truncate">{job.company_name}</span>
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center gap-1.5 text-kth-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    )}
                  </div>

                  {job.description && (
                    <p className="text-xs text-kth-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-5 pt-3 border-t border-kth-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleJobClick(job, e)}
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    className="w-full text-xs font-bold text-kth-primary-600 hover:text-white hover:bg-kth-primary-600 group-hover:border-kth-primary-500 transition-colors"
                  >
                    {job.link_label || 'View External Job'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
