import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { jobService, savedJobService, applicationService, Job } from '@/services';
import { formatINR } from '@/design-system/tokens';
import { MapPin, CheckCircle2, Bookmark, Building2, ArrowLeft, Check, AlertTriangle, Briefcase } from 'lucide-react';

export interface CandidateJobDetailsPageProps {
  jobId?: string;
}

export const CandidateJobDetailsPage: React.FC<CandidateJobDetailsPageProps> = ({ jobId: propJobId }) => {
  const resolvedJobId = propJobId || window.location.pathname.split('/candidate/jobs/')[1] || '';

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const loadJobData = useCallback(async () => {
    if (!resolvedJobId) {
      setIsLoading(false);
      setErrorMessage('Invalid Job ID.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [jobRes, savedRes, appliedRes] = await Promise.all([
        jobService.getPublishedJobById(resolvedJobId),
        savedJobService.isJobSaved(resolvedJobId),
        applicationService.hasCandidateApplied(resolvedJobId),
      ]);

      if (jobRes.error || !jobRes.data) {
        setErrorMessage(jobRes.error?.message || 'Job opening not found or has been closed.');
        setJob(null);
      } else {
        setJob(jobRes.data);
      }

      setIsSaved(savedRes.data || false);
      setHasApplied(appliedRes.data || false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred while loading this position.');
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedJobId]);

  useEffect(() => {
    loadJobData();

    const handleSavedJobsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ candidateId: string; jobId: string; isSaved: boolean }>;
      if (customEvent.detail && resolvedJobId && customEvent.detail.jobId === resolvedJobId) {
        setIsSaved(customEvent.detail.isSaved);
      }
    };

    window.addEventListener('kth_saved_jobs_changed', handleSavedJobsChanged);
    return () => {
      window.removeEventListener('kth_saved_jobs_changed', handleSavedJobsChanged);
    };
  }, [loadJobData, resolvedJobId]);

  const handleSaveToggle = async () => {
    if (!job) return;
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    if (nextSavedState) {
      const { error } = await savedJobService.saveJob(job.id);
      if (error) setIsSaved(false);
    } else {
      const { error } = await savedJobService.unsaveJob(job.id);
      if (error) setIsSaved(true);
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/candidate/jobs');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleNavigateApplications = () => {
    window.history.pushState({}, '', '/candidate/applications');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (isLoading) {
    return (
      <CandidateShell title="Job Overview" currentPath="/candidate/jobs">
        <div className="space-y-6">
          <div className="h-6 w-32 bg-kth-slate-200 rounded animate-pulse" />
          <div className="bg-white p-8 rounded-2xl border border-kth-slate-200 space-y-6 animate-pulse">
            <div className="h-8 bg-kth-slate-200 rounded w-2/3" />
            <div className="h-4 bg-kth-slate-100 rounded w-1/3" />
            <div className="h-20 bg-kth-slate-100 rounded-xl" />
            <div className="space-y-3">
              <div className="h-4 bg-kth-slate-200 rounded w-1/4" />
              <div className="h-24 bg-kth-slate-100 rounded" />
            </div>
          </div>
        </div>
      </CandidateShell>
    );
  }

  if (errorMessage || !job) {
    return (
      <CandidateShell title="Position Not Found" currentPath="/candidate/jobs">
        <div className="bg-white p-12 rounded-2xl border border-kth-slate-200 text-center max-w-lg mx-auto my-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
            {errorMessage ? <AlertTriangle className="w-7 h-7 text-amber-500" /> : <Briefcase className="w-7 h-7" />}
          </div>
          <h3 className="font-display font-bold text-lg text-kth-slate-900">
            {errorMessage ? 'Unable to Load Position' : 'Job Not Found'}
          </h3>
          <p className="text-xs text-kth-slate-500 leading-relaxed">
            {errorMessage || 'This job opening is no longer accepting applications or has been closed by the employer.'}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Other Openings
          </button>
        </div>
      </CandidateShell>
    );
  }

  const isSalaryValid = (job.min_salary_inr && job.min_salary_inr > 0) || (job.max_salary_inr && job.max_salary_inr > 0);
  const salaryText = isSalaryValid
    ? `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`
    : 'Salary not disclosed';

  const companyName = job.company?.name || (job as any).company_name || 'EcoStrategy India Pvt Ltd';
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <CandidateShell title={job.title} currentPath="/candidate/jobs">
      <div className="space-y-6 font-sans">
        {/* Back navigation */}
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Matching Jobs</span>
          </button>
        </div>

        <Card className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {(job.is_verified || job.company?.verification_status === 'verified') && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full shrink-0">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" /> Verified
                  </span>
                )}
                <Badge variant="indigo" className="capitalize">
                  {(job.employment_type || 'full_time').replace('_', '-')}
                </Badge>
                <Badge variant="slate" className="capitalize">
                  {(job.work_mode || 'hybrid').replace('_', '-')}
                </Badge>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-kth-slate-900">{job.title}</h1>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-kth-slate-600 mt-1">
                <span className="font-semibold text-kth-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-kth-slate-400" />
                  {companyName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-kth-slate-400" />
                  {job.location}
                  {job.is_remote && ' (Remote)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={handleSaveToggle}
                leftIcon={<Bookmark className={`w-4 h-4 ${isSaved ? 'fill-kth-primary-600 text-kth-primary-600' : ''}`} />}
              >
                {isSaved ? 'Saved' : 'Save Job'}
              </Button>

              {hasApplied ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleNavigateApplications}
                  leftIcon={<Check className="w-4 h-4 text-emerald-600" />}
                >
                  Already Applied (View)
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    window.location.href = `/jobs/${job.id}/apply`;
                  }}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>

          <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 mb-6 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-kth-slate-500 uppercase">OFFERED SALARY BAND</span>
              <div className="font-mono text-xl font-bold text-kth-primary-600">{salaryText}</div>
            </div>
            <Badge variant="indigo" className="capitalize">{(job.work_mode || 'hybrid').replace('_', '-')}</Badge>
          </div>

          {/* Job Overview */}
          <div className="space-y-5 text-xs sm:text-sm text-kth-slate-700 leading-relaxed">
            <div>
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-2">Role Description</h3>
              <p className="whitespace-pre-line text-kth-slate-600 font-normal">
                {job.description || 'No description provided for this opening.'}
              </p>
            </div>

            {responsibilities.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-base text-kth-slate-900 mb-2">Key Responsibilities</h3>
                <ul className="space-y-2 list-none pl-0">
                  {responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {requirements.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-base text-kth-slate-900 mb-2">Requirements & Qualifications</h3>
                <ul className="space-y-2 list-none pl-0">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-kth-primary-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {skills.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-base text-kth-slate-900 mb-2">Skills Required</h3>
                <div className="flex gap-2 flex-wrap">
                  {skills.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded bg-kth-slate-100 text-kth-slate-700 text-xs font-semibold border border-kth-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </CandidateShell>
  );
};
