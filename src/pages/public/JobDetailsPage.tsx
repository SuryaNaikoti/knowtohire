import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { jobService, Job } from '@/services';
import { MapPin, Building2, CheckCircle2, Bookmark, ArrowLeft, Briefcase, AlertTriangle, Check, Share2 } from 'lucide-react';
import { formatINR } from '@/design-system/tokens';

export interface JobDetailsPageProps {
  jobId?: string;
  onNavigate?: (path: string) => void;
}

export const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ jobId: propJobId, onNavigate }) => {
  // Extract Job ID from prop or window location pathname (/jobs/:id)
  const resolvedJobId = propJobId || window.location.pathname.split('/jobs/')[1]?.replace(/\/apply$/, '') || '';

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!resolvedJobId) {
        setIsLoading(false);
        setErrorMessage('Invalid Job ID.');
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { data, error } = await jobService.getPublishedJobById(resolvedJobId);

        if (error || !data) {
          setErrorMessage(error?.message || 'Job opening not found or is no longer active.');
          setJob(null);
        } else {
          setJob(data);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'An unexpected error occurred while loading this position.');
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobDetails();
  }, [resolvedJobId]);

  const handleBackToJobs = () => {
    if (onNavigate) {
      onNavigate('/jobs');
    } else {
      window.history.pushState({}, '', '/jobs');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleApplyClick = () => {
    const applyPath = `/jobs/${resolvedJobId}/apply`;
    if (onNavigate) {
      onNavigate(applyPath);
    } else {
      window.history.pushState({}, '', applyPath);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatPublishDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently posted';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently posted';
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="py-8 sm:py-12 bg-kth-slate-50 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-5 w-32 bg-kth-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-kth-slate-200 space-y-6 animate-pulse">
              <div className="h-7 bg-kth-slate-200 rounded w-2/3" />
              <div className="h-4 bg-kth-slate-100 rounded w-1/3" />
              <div className="h-20 bg-kth-slate-100 rounded-xl" />
              <div className="space-y-3">
                <div className="h-4 bg-kth-slate-200 rounded w-1/4" />
                <div className="h-24 bg-kth-slate-100 rounded" />
              </div>
            </div>
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-kth-slate-200 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found / Error State
  if (errorMessage || !job) {
    return (
      <div className="py-16 bg-kth-slate-50 min-h-screen font-sans">
        <div className="max-w-lg mx-auto px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
            {errorMessage ? <AlertTriangle className="w-7 h-7 text-amber-500" /> : <Briefcase className="w-7 h-7" />}
          </div>
          <h2 className="font-display font-extrabold text-2xl text-kth-slate-900">
            {errorMessage ? 'Unable to Load Position' : 'Position Not Found'}
          </h2>
          <p className="text-xs sm:text-sm text-kth-slate-500 leading-relaxed max-w-sm mx-auto">
            {errorMessage || 'This job opening does not exist, has expired, or is currently closed by the employer.'}
          </p>
          <div className="pt-3">
            <Button variant="primary" size="md" onClick={handleBackToJobs} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Browse All Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSalaryValid = (job.min_salary_inr && job.min_salary_inr > 0) || (job.max_salary_inr && job.max_salary_inr > 0);
  const salaryText = isSalaryValid
    ? `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`
    : 'Salary not disclosed';

  const companyName = job.company?.name || (job as any).company_name || 'EcoStrategy India';
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const skills = Array.isArray(job.skills) ? job.skills : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];

  return (
    <div className="py-8 sm:py-12 bg-kth-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back Link */}
        <div className="mb-5 sm:mb-6">
          <button
            type="button"
            onClick={handleBackToJobs}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors p-1 -ml-1 rounded-md min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Listings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-5 sm:p-7 md:p-8 bg-white border border-kth-slate-200/90 rounded-2xl shadow-xs space-y-6">
              
              {/* Job Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="indigo" className="capitalize text-[11px] sm:text-xs font-semibold">
                      {(job.employment_type || 'full_time').replace('_', '-')}
                    </Badge>
                    <Badge variant="slate" className="capitalize text-[11px] sm:text-xs">
                      {(job.work_mode || 'hybrid').replace('_', '-')}
                    </Badge>
                    {job.category && (
                      <Badge variant="cyan" className="text-[11px] sm:text-xs">
                        {job.category}
                      </Badge>
                    )}
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900 leading-tight">
                    {job.title}
                  </h1>

                  <div className="flex items-center gap-3 text-xs sm:text-sm text-kth-slate-600 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = job.company_id || job.company?.id || encodeURIComponent(companyName);
                        const target = `/companies/${targetId}`;
                        if (onNavigate) {
                          onNavigate(target);
                        } else {
                          window.history.pushState({}, '', target);
                          window.dispatchEvent(new Event('popstate'));
                        }
                      }}
                      className="flex items-center gap-1.5 hover:text-kth-primary-600 transition-colors group cursor-pointer text-left"
                    >
                      <Building2 className="w-4 h-4 text-kth-primary-600 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-kth-slate-900 group-hover:text-kth-primary-600 group-hover:underline">{companyName}</span>
                      {(job.is_verified || job.company?.verification_status === 'verified') && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                          <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" /> Verified
                        </span>
                      )}
                    </button>
                    
                    <span className="text-kth-slate-300">•</span>
                    
                    <div className="flex items-center gap-1 text-kth-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                      <span>{job.location}</span>
                      {job.is_remote && <span className="font-semibold text-kth-primary-600 text-[11px] sm:text-xs ml-0.5">(Remote)</span>}
                    </div>
                  </div>
                </div>

                {/* Bookmark Action */}
                <button
                  type="button"
                  aria-label={isSaved ? "Remove from bookmarks" : "Save job"}
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-2.5 rounded-xl border transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    isSaved
                      ? 'bg-kth-primary-50 text-kth-primary-600 border-kth-primary-200 scale-105'
                      : 'bg-white text-kth-slate-400 border-kth-slate-200 hover:text-kth-slate-700 hover:bg-kth-slate-50'
                  }`}
                >
                  <Bookmark className="w-4.5 h-4.5 fill-current" />
                </button>
              </div>

              {/* Salary & Single Primary CTA Banner */}
              <div className="bg-kth-slate-50/80 p-4 sm:p-5 rounded-xl border border-kth-slate-200/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold text-kth-slate-500 uppercase tracking-wider block mb-1">
                    OFFERED ANNUAL SALARY BAND
                  </span>
                  <div className={`font-mono text-xl sm:text-2xl font-extrabold ${isSalaryValid ? 'text-kth-primary-600' : 'text-kth-slate-700 text-lg sm:text-xl font-sans font-bold'}`}>
                    {salaryText}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto font-bold px-7 h-11 text-xs sm:text-sm shadow-xs shrink-0"
                  onClick={handleApplyClick}
                >
                  Apply for Position
                </Button>
              </div>

              {/* Job Details Sections */}
              <div className="space-y-6 text-sm text-kth-slate-700 leading-relaxed pt-2">
                
                {/* Role Overview */}
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-kth-slate-900 mb-2">
                    Role Overview
                  </h2>
                  <p className="whitespace-pre-line text-xs sm:text-sm text-kth-slate-600 leading-relaxed font-normal">
                    {job.description || 'No description provided for this opening.'}
                  </p>
                </div>

                {/* Key Responsibilities */}
                {responsibilities.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg text-kth-slate-900 mb-3">
                      Key Responsibilities
                    </h2>
                    <ul className="space-y-2 list-none pl-0">
                      {responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-kth-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Requirements & Qualifications */}
                {requirements.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg text-kth-slate-900 mb-3">
                      Requirements & Qualifications
                    </h2>
                    <ul className="space-y-2 list-none pl-0">
                      {requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-kth-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-kth-primary-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Required Skills & Keywords */}
                {skills.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg text-kth-slate-900 mb-3">
                      Required Skills & Keywords
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-md bg-kth-slate-100 text-kth-slate-700 text-xs font-semibold border border-kth-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits & Perks */}
                {benefits.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg text-kth-slate-900 mb-3">
                      Benefits & Perks
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                      {benefits.map((b, idx) => (
                        <Badge key={idx} variant="slate" className="py-1 px-3 normal-case text-xs font-medium">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sticky Sidebar Column (Desktop sticky, Mobile single-column) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-4">
              
              {/* Company & Role Summary Card */}
              <Card className="p-5 sm:p-6 bg-white border border-kth-slate-200/90 rounded-2xl shadow-xs">
                <h3 className="font-display font-bold text-sm sm:text-base text-kth-slate-900 mb-4 border-b border-kth-slate-100 pb-3">
                  Company & Role Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-kth-slate-500 font-medium">Enterprise:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = job.company_id || job.company?.id || encodeURIComponent(companyName);
                        const target = `/companies/${targetId}`;
                        if (onNavigate) {
                          onNavigate(target);
                        } else {
                          window.history.pushState({}, '', target);
                          window.dispatchEvent(new Event('popstate'));
                        }
                      }}
                      className="font-bold text-kth-primary-600 hover:underline text-right truncate max-w-[160px] cursor-pointer"
                    >
                      {companyName}
                    </button>
                  </div>

                  {job.department && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-kth-slate-500 font-medium">Department:</span>
                      <span className="font-semibold text-kth-slate-900 text-right truncate max-w-[160px]">{job.department}</span>
                    </div>
                  )}

                  {job.category && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-kth-slate-500 font-medium">Category:</span>
                      <span className="font-semibold text-kth-slate-900 text-right">{job.category}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-kth-slate-500 font-medium">Location:</span>
                    <span className="font-semibold text-kth-slate-900 text-right truncate max-w-[160px]">{job.location}</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-kth-slate-500 font-medium">Experience:</span>
                    <span className="font-semibold text-kth-slate-900 capitalize text-right">
                      {(job.experience_level || 'mid_level').replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-kth-slate-500 font-medium">Posted:</span>
                    <span className="font-semibold text-kth-slate-900 text-right">{formatPublishDate(job.published_at || job.created_at)}</span>
                  </div>

                  {job.application_deadline && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-kth-slate-500 font-medium">Deadline:</span>
                      <span className="font-semibold text-amber-600 text-right">{formatPublishDate(job.application_deadline)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3.5 border-t border-kth-slate-100">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-800 hover:bg-kth-slate-50 rounded-lg transition-colors border border-dashed border-kth-slate-200/90"
                  >
                    <Share2 className="w-3.5 h-3.5 text-kth-slate-400" />
                    <span>{isCopied ? 'Link Copied!' : 'Share Position'}</span>
                  </button>
                </div>
              </Card>

              {/* Verified Trust Card */}
              <div className="p-4 rounded-xl bg-white border border-kth-slate-200/90 text-xs text-kth-slate-500 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-kth-slate-800 block">Direct Requisition</span>
                  <span className="text-[11px] text-kth-slate-500">Verified through KnowToHire employer screening.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
