import React, { useState, useEffect } from 'react';
import { SectionHeader } from './SectionHeader';
import { JobCard } from '@/components/cards/JobCard';
import { Button } from '@/components/ui/Button';
import { jobService, Job } from '@/services';
import { ArrowRight } from 'lucide-react';

export const FeaturedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      setIsLoading(true);
      const { data } = await jobService.getPublishedJobs({ pageSize: 6, sort_by: 'latest' });
      if (data) {
        setJobs(data.data);
      }
      setIsLoading(false);
    };

    fetchFeaturedJobs();
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
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
    <section className="py-16 bg-kth-slate-50 border-b border-kth-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeText="Verified Opportunities"
          badgeVariant="emerald"
          title="Featured Career Opportunities"
          subtitle="Top sustainability, ESG, patent, and research consulting roles from verified Indian enterprises."
          action={
            <Button variant="secondary" size="sm" onClick={() => handleNavigate('/jobs')}>
              Explore All Jobs <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, idx) => (
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
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                onApply={() => handleNavigate(`/jobs/${job.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-kth-slate-200 p-8 text-center text-xs text-kth-slate-500 mb-8">
            No published featured openings at this moment.
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => handleNavigate('/jobs')}
            className="inline-flex items-center gap-2 font-display font-bold text-sm text-kth-primary-600 hover:text-kth-primary-700 transition-colors"
          >
            View All Active Job Listings in India →
          </button>
        </div>
      </div>
    </section>
  );
};

