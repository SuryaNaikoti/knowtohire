import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { jobService, Job } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Building2, CheckCircle2, Bookmark, ArrowLeft, Briefcase, AlertTriangle } from 'lucide-react';
import { formatINR } from '@/design-system/tokens';

export interface JobDetailsPageProps {
  jobId?: string;
}

export const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ jobId: propJobId }) => {
  // Extract Job ID from prop or window location pathname (/jobs/:id)
  const resolvedJobId = propJobId || window.location.pathname.split('/jobs/')[1] || '';
  const { isAuthenticated, role, logout } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApplyNoticeOpen, setIsApplyNoticeOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
    window.history.pushState({}, '', '/jobs');
    window.dispatchEvent(new Event('popstate'));
  };

  const handleApplyClick = () => {
    if (isAuthenticated && role === 'candidate') {
      window.history.pushState({}, '', `/candidate/jobs/${resolvedJobId}`);
      window.dispatchEvent(new Event('popstate'));
      return;
    }
    setIsApplyNoticeOpen(true);
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

  // Loading State
  if (isLoading) {
    return (
      <div className="py-12 bg-kth-slate-50 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-6 w-32 bg-kth-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-kth-slate-200 space-y-6 animate-pulse">
              <div className="h-8 bg-kth-slate-200 rounded w-2/3" />
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
          <div className="w-16 h-16 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
            {errorMessage ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <Briefcase className="w-8 h-8" />}
          </div>
          <h2 className="font-display font-extrabold text-2xl text-kth-slate-900">
            {errorMessage ? 'Unable to Load Position' : 'Position Not Found'}
          </h2>
          <p className="text-xs text-kth-slate-500 leading-relaxed">
            {errorMessage || 'This job opening does not exist, has expired, or is currently closed by the hiring enterprise.'}
          </p>
          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleBackToJobs} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Browse All Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const salaryText = `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`;
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const skills = Array.isArray(job.skills) ? job.skills : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];

  return (
    <div className="py-12 bg-kth-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBackToJobs}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Listings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            <Card className="mb-6 p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(job.is_verified || job.company?.verification_status === 'verified') && (
                      <Badge variant="cyan">Verified Opportunity</Badge>
                    )}
                    <Badge variant="indigo" className="capitalize">
                      {(job.employment_type || 'full_time').replace('_', '-')}
                    </Badge>
                    <Badge variant="slate" className="capitalize">
                      {(job.work_mode || 'hybrid').replace('_', '-')}
                    </Badge>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900 leading-tight">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-kth-slate-600 flex-wrap">
                    <span className="font-semibold text-kth-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-kth-slate-400" />
                      {job.company?.name || 'Verified Enterprise'}
                    </span>
                    <span className="flex items-center gap-1 text-kth-slate-500">
                      <MapPin className="w-4 h-4 text-kth-slate-400" />
                      {job.location}
                      {job.is_remote && ' (Remote)'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={isSaved ? "Remove from bookmarks" : "Save job"}
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isSaved
                      ? 'bg-kth-primary-50 text-kth-primary-600 border-kth-primary-200'
                      : 'bg-white text-kth-slate-500 border-kth-slate-200 hover:bg-kth-slate-50'
                  }`}
                >
                  <Bookmark className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Salary & Primary CTA Banner */}
              <div className="bg-kth-slate-50 p-4 sm:p-5 rounded-xl border border-kth-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold text-kth-slate-500 uppercase tracking-wider block mb-0.5">
                    OFFERED ANNUAL SALARY BAND
                  </span>
                  <div className="font-mono text-xl font-extrabold text-kth-primary-600">
                    {salaryText}
                  </div>
                </div>
                <Button variant="primary" size="md" className="w-full sm:w-auto font-bold px-6" onClick={handleApplyClick}>
                  Apply for Position
                </Button>
              </div>

              {/* Job Details Sections */}
              <div className="space-y-6 text-sm text-kth-slate-700 leading-relaxed pt-2">
                <div>
                  <h2 className="font-display font-bold text-lg text-kth-slate-900 mb-2">Role Overview</h2>
                  <p className="whitespace-pre-line text-xs sm:text-sm text-kth-slate-600 leading-relaxed font-normal">
                    {job.description || 'No description provided for this opening.'}
                  </p>
                </div>

                {responsibilities.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-lg text-kth-slate-900 mb-3">Key Responsibilities</h2>
                    <ul className="space-y-2.5 list-none pl-0">
                      {responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-kth-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {requirements.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-lg text-kth-slate-900 mb-3">Requirements & Qualifications</h2>
                    <ul className="space-y-2.5 list-none pl-0">
                      {requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-kth-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-kth-primary-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-lg text-kth-slate-900 mb-3">Required Skills & Keywords</h2>
                    <div className="flex gap-2 flex-wrap">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-md bg-kth-slate-100 text-kth-slate-700 text-xs font-semibold border border-kth-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {benefits.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-lg text-kth-slate-900 mb-3">Benefits & Perks</h2>
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

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 border-b border-kth-slate-100 pb-3">
                Company & Role Summary
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-kth-slate-500">Enterprise:</span>
                  <span className="font-semibold text-kth-slate-900">{job.company?.name || 'Verified Enterprise'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-kth-slate-500">Department:</span>
                  <span className="font-semibold text-kth-slate-900">{job.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-kth-slate-500">Category:</span>
                  <span className="font-semibold text-kth-slate-900">{job.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-kth-slate-500">Location:</span>
                  <span className="font-semibold text-kth-slate-900">{job.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-kth-slate-500">Experience:</span>
                  <span className="font-semibold text-kth-slate-900 capitalize">{(job.experience_level || 'mid_level').replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-kth-slate-500">Posted:</span>
                  <span className="font-semibold text-kth-slate-900">{formatPublishDate(job.published_at || job.created_at)}</span>
                </div>
                {job.application_deadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-kth-slate-500">Deadline:</span>
                    <span className="font-semibold text-amber-600">{formatPublishDate(job.application_deadline)}</span>
                  </div>
                )}
              </div>

              <Button variant="primary" className="w-full mt-6 font-bold" onClick={handleApplyClick}>
                Apply Now
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Notice Dialog */}
      <Dialog
        isOpen={isApplyNoticeOpen}
        onClose={() => setIsApplyNoticeOpen(false)}
        title={`Apply to ${job.company?.name || 'Enterprise'}`}
        description={`Position: ${job.title}`}
      >
        {isAuthenticated && role === 'employer' ? (
          <div className="space-y-4 text-left font-sans">
            <p className="text-xs text-kth-slate-600 leading-relaxed">
              You are currently signed in with an <strong>Employer</strong> account. Job applications must be submitted from a verified <strong>Candidate</strong> account.
            </p>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
              <div><strong>Current Session:</strong> Employer</div>
              <div><strong>Selected Requisition:</strong> {job.title}</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsApplyNoticeOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  setIsApplyNoticeOpen(false);
                  await logout();
                  window.history.pushState({}, '', `/login?role=candidate&redirect=/candidate/jobs/${job.id}`);
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                Sign In as Candidate
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left font-sans">
            <p className="text-xs text-kth-slate-600 leading-relaxed">
              You are viewing a verified job requisition on KnowToHire. To submit your official candidate profile and resume, please sign in to your candidate account.
            </p>
            <div className="p-3 bg-kth-slate-50 rounded-lg border border-kth-slate-200 text-xs text-kth-slate-700 space-y-1">
              <div><strong>Job Title:</strong> {job.title}</div>
              <div><strong>Location:</strong> {job.location}</div>
              <div><strong>Offered Band:</strong> {salaryText}</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsApplyNoticeOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsApplyNoticeOpen(false);
                  window.history.pushState({}, '', `/login?redirect=/candidate/jobs/${job.id}`);
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                Sign In to Apply
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
