import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { jobService, Job, JobStatus } from '@/services';
import { formatINR } from '@/design-system/tokens';
import { MapPin, Edit3, PauseCircle, Play, ArrowLeft, Briefcase, CheckCircle2 } from 'lucide-react';

export interface EmployerJobDetailsPageProps {
  jobId?: string;
}

export const EmployerJobDetailsPage: React.FC<EmployerJobDetailsPageProps> = ({ jobId: propJobId }) => {
  const resolvedJobId = propJobId || window.location.pathname.split('/employer/jobs/')[1]?.split('/')[0] || '';

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadJob = useCallback(async () => {
    if (!resolvedJobId) {
      setIsLoading(false);
      setErrorMessage('Invalid Job ID.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await jobService.getEmployerJobById(resolvedJobId);

    if (error || !data) {
      setErrorMessage(error?.message || 'Job opening not found or inaccessible.');
      setJob(null);
    } else {
      setJob(data);
    }

    setIsLoading(false);
  }, [resolvedJobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  // Lifecycle Action Handlers
  const handlePublish = async () => {
    if (!job) return;
    setIsActionLoading(true);
    setActionError(null);

    const { data, error } = await jobService.publishJob(job.id);
    setIsActionLoading(false);

    if (error) {
      setActionError(error.message);
    } else if (data) {
      setJob(data);
    }
  };

  const handlePause = async () => {
    if (!job) return;
    setIsActionLoading(true);
    setActionError(null);

    const { data, error } = await jobService.pauseJob(job.id);
    setIsActionLoading(false);

    if (error) {
      setActionError(error.message);
    } else if (data) {
      setJob(data);
    }
  };

  const handleClose = async () => {
    if (!job) return;
    setIsActionLoading(true);
    setActionError(null);

    const { data, error } = await jobService.closeJob(job.id);
    setIsActionLoading(false);

    if (error) {
      setActionError(error.message);
    } else if (data) {
      setJob(data);
    }
  };

  const handleReopen = async () => {
    if (!job) return;
    setIsActionLoading(true);
    setActionError(null);

    const { data, error } = await jobService.reopenJob(job.id);
    setIsActionLoading(false);

    if (error) {
      setActionError(error.message);
    } else if (data) {
      setJob(data);
    }
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'published':
        return <Badge variant="emerald" hasPulse>Published</Badge>;
      case 'draft':
        return <Badge variant="slate">Draft</Badge>;
      case 'paused':
        return <Badge variant="amber">Paused</Badge>;
      case 'closed':
        return <Badge variant="rose">Closed</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <EmployerShell title="Job Overview" currentPath="/employer/jobs">
        <div className="space-y-6 animate-pulse font-sans">
          <div className="h-6 w-32 bg-kth-slate-200 rounded" />
          <div className="bg-white p-8 rounded-2xl border border-kth-slate-200 h-64" />
        </div>
      </EmployerShell>
    );
  }

  if (errorMessage || !job) {
    return (
      <EmployerShell title="Job Not Found" currentPath="/employer/jobs">
        <div className="bg-white p-12 rounded-2xl border border-kth-slate-200 text-center max-w-lg mx-auto my-8 space-y-4 font-sans">
          <div className="w-14 h-14 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-lg text-kth-slate-900">Job Opening Not Found</h3>
          <p className="text-xs text-kth-slate-500 leading-relaxed">
            {errorMessage || 'This requisition does not exist or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={() => handleNavigate('/employer/jobs')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Job Openings
            </Button>
          </div>
        </div>
      </EmployerShell>
    );
  }

  const salaryText = `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`;

  return (
    <EmployerShell title={`Job Management — ${job.title}`} currentPath="/employer/jobs">
      <div className="space-y-6 font-sans">
        {/* Back navigation */}
        <div>
          <button
            type="button"
            onClick={() => handleNavigate('/employer/jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Openings</span>
          </button>
        </div>

        {actionError && (
          <Alert variant="error" title="Lifecycle Action Notice">
            <span>{actionError}</span>
          </Alert>
        )}

        {/* Admin Moderation Notice & Change Request Banner */}
        {job.moderation_notes && (
          <div className="bg-amber-50 p-4 sm:p-5 rounded-2xl border border-amber-300 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                    Admin Moderation Notice
                  </span>
                  <span className="text-xs font-semibold text-amber-800">
                    {job.moderation_status === 'changes_requested' ? 'Changes Required by Platform Admin' : 'Moderator Feedback'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-950 font-medium whitespace-pre-line leading-relaxed pt-1">
                  &ldquo;{job.moderation_notes}&rdquo;
                </p>
                <p className="text-[11px] text-amber-800">
                  Please update the requisition details to align with platform publishing standards and click &ldquo;Publish Job&rdquo; to resubmit.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white border-transparent shrink-0 font-bold"
                onClick={() => handleNavigate(`/employer/jobs/${job.id}/edit`)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit & Resubmit
              </Button>
            </div>
          </div>
        )}

        {/* Job Header */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getStatusBadge(job.status)}
                <Badge variant="indigo" className="capitalize">{job.employment_type.replace('_', '-')}</Badge>
                <Badge variant="slate" className="capitalize">{job.work_mode.replace('_', '-')}</Badge>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-kth-slate-900">{job.title}</h1>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-kth-slate-600 mt-1">
                <span className="font-semibold text-kth-slate-800">{job.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-kth-slate-400" />
                  {job.location}
                  {job.is_remote && ' (Remote)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(`/employer/jobs/${job.id}/edit`)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Requisition
              </Button>

              {job.status === 'draft' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  disabled={isActionLoading}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  Publish Job
                </Button>
              )}

              {job.status === 'published' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePause}
                    disabled={isActionLoading}
                    leftIcon={<PauseCircle className="w-3.5 h-3.5" />}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={isActionLoading}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    Close
                  </Button>
                </>
              )}

              {job.status === 'paused' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReopen}
                  disabled={isActionLoading}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  Resume
                </Button>
              )}

              {job.status === 'closed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReopen}
                  disabled={isActionLoading}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  Reopen
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleNavigate(`/employer/jobs/${job.id}/applicants`)}
              >
                View Applicants
              </Button>
            </div>
          </div>

          {/* Compensation & Timeline Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-kth-slate-400 block uppercase">SALARY BAND</span>
              <strong className="font-mono text-sm font-bold text-kth-primary-600">{salaryText}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-kth-slate-400 block uppercase">CATEGORY</span>
              <strong className="font-semibold text-kth-slate-800">{job.category}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-kth-slate-400 block uppercase">EXPERIENCE</span>
              <strong className="font-semibold text-kth-slate-800 capitalize">{job.experience_level.replace('_', ' ')}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-kth-slate-400 block uppercase">CREATED DATE</span>
              <strong className="font-semibold text-kth-slate-800">
                {new Date(job.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </strong>
            </div>
          </div>

          {/* Role Details */}
          <div className="space-y-4 text-xs sm:text-sm text-kth-slate-700 leading-relaxed pt-2">
            <div>
              <h2 className="font-display font-bold text-base text-kth-slate-900 mb-2">Description</h2>
              <p className="whitespace-pre-line text-kth-slate-600 leading-relaxed font-normal">{job.description}</p>
            </div>

            {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-base text-kth-slate-900 mb-2">Key Responsibilities</h2>
                <ul className="space-y-2 list-none pl-0">
                  {job.responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-base text-kth-slate-900 mb-2">Requirements</h2>
                <ul className="space-y-2 list-none pl-0">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-kth-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-kth-primary-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(job.skills) && job.skills.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-base text-kth-slate-900 mb-2">Required Skills</h2>
                <div className="flex gap-2 flex-wrap">
                  {job.skills.map((s, idx) => (
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
    </EmployerShell>
  );
};
