import React, { useState, useEffect } from 'react';
import { SectionHeader } from './SectionHeader';
import { Button } from '@/components/ui/Button';
import { ExternalJob, ExternalJobSection } from '@/types/externalJob';
import { externalJobService, openExternalJobUrl } from '@/services/externalJobService';
import {
  ExternalLink,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export interface CuratedExternalJobsProps {
  onNavigate?: (path: string) => void;
}

export const CuratedExternalJobs: React.FC<CuratedExternalJobsProps> = ({ onNavigate }) => {
  const [latestJobs, setLatestJobs] = useState<ExternalJob[]>([]);
  const [fresherJobs, setFresherJobs] = useState<ExternalJob[]>([]);
  const [walkInJobs, setWalkInJobs] = useState<ExternalJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCuratedJobs = async () => {
    setIsLoading(true);
    const [latestRes, fresherRes, walkInRes] = await Promise.all([
      externalJobService.getExternalJobs({ section: 'latest', limit: 8 }),
      externalJobService.getExternalJobs({ section: 'fresher', limit: 8 }),
      externalJobService.getExternalJobs({ section: 'walk_in', limit: 8 }),
    ]);

    const latest = latestRes.data || [];
    const fresher = fresherRes.data || [];
    const walkIn = walkInRes.data || [];

    setLatestJobs(latest);
    setFresherJobs(fresher);
    setWalkInJobs(walkIn);
    setIsLoading(false);

    // Record impressions for all visible curated jobs
    const allIds = [...latest, ...fresher, ...walkIn].map((j) => j.id);
    if (allIds.length > 0) {
      externalJobService.recordImpressions(allIds);
    }
  };

  useEffect(() => {
    fetchCuratedJobs();

    const handleUpdate = () => {
      fetchCuratedJobs();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('kth_external_jobs_changed', handleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_external_jobs_changed', handleUpdate);
      }
    };
  }, []);

  const handleJobClick = (job: ExternalJob, e: React.MouseEvent) => {
    e.preventDefault();
    externalJobService.recordClick(job.id);
    openExternalJobUrl(job.redirect_url);
  };

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Section column renderer
  const renderColumn = (
    title: string,
    jobs: ExternalJob[],
    sectionKey: ExternalJobSection
  ) => {
    return (
      <div className="bg-white rounded-xl border border-kth-slate-200 shadow-2xs flex flex-col h-full overflow-hidden hover:border-kth-slate-300 transition-colors">
        {/* Column Header */}
        <div className="p-4 border-b border-kth-slate-100 flex items-center justify-between bg-kth-slate-50/50">
          <div>
            <h3 className="font-display font-bold text-sm text-kth-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-kth-slate-500 bg-white border border-kth-slate-200 px-2 py-0.5 rounded">
            {jobs.length}
          </span>
        </div>

        {/* Job List Items */}
        <div className="flex-1 divide-y divide-kth-slate-100 flex flex-col justify-start">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-1.5">
                  <div className="h-4 bg-kth-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-kth-slate-50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-kth-slate-400 flex flex-col items-center justify-center h-48">
              <span>No active listings available.</span>
            </div>
          ) : (
            jobs.map((job) => (
              <a
                key={job.id}
                href={job.redirect_url}
                onClick={(e) => handleJobClick(job, e)}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 sm:p-4 hover:bg-kth-slate-50/60 transition-colors text-left no-underline block"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-[13px] font-semibold text-kth-slate-900 group-hover:text-kth-primary-600 leading-snug transition-colors line-clamp-2">
                    {job.title}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-kth-slate-400 group-hover:text-kth-primary-600 shrink-0 mt-0.5 transition-colors" />
                </div>

                {/* Company & Location Metadata */}
                {(job.company_name || job.location) && (
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-kth-slate-500">
                    {job.company_name && (
                      <span className="font-medium text-kth-slate-700 truncate max-w-[170px]">
                        {job.company_name}
                      </span>
                    )}
                    {job.company_name && job.location && <span>•</span>}
                    {job.location && (
                      <span className="truncate max-w-[130px] text-kth-slate-500">
                        {job.location}
                      </span>
                    )}
                  </div>
                )}
              </a>
            ))
          )}
        </div>

        {/* Column Footer: View All Link */}
        <div className="p-2.5 bg-kth-slate-50/40 border-t border-kth-slate-100 text-center">
          <button
            onClick={() => handleNav(`/external-jobs?section=${sectionKey}`)}
            className="w-full text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 py-1 flex items-center justify-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-kth-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badgeText="External Opportunities"
          badgeVariant="slate"
          title="Curated Job Listings"
          subtitle="Direct links to off-campus programs, fresher roles, and walk-in drives."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleNav('/external-jobs')}
              className="font-bold text-xs"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          }
        />

        {/* 3-Column Desktop Grid / 1-Column Mobile Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* Column 1: Latest Jobs */}
          {renderColumn('Latest Jobs', latestJobs, 'latest')}

          {/* Column 2: Fresher Jobs */}
          {renderColumn('Fresher Jobs', fresherJobs, 'fresher')}

          {/* Column 3: Walk-In Interviews */}
          {renderColumn('Walk-In Interviews', walkInJobs, 'walk_in')}
        </div>
      </div>
    </section>
  );
};
