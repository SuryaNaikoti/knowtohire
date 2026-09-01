import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Alert } from '@/components/ui/Alert';
import { ProgressTimeline, TimelineStep } from '@/components/data-display/ProgressTimeline';
import { applicationService, interviewService, JobApplication, ApplicationStatusHistory, Interview, ApplicationStage } from '@/services';
import { formatINR } from '@/design-system/tokens';
import { Calendar, Video, FileText, ArrowLeft, AlertTriangle, Building2, MapPin, Briefcase } from 'lucide-react';

export interface CandidateApplicationDetailsPageProps {
  appId?: string;
}

export const CandidateApplicationDetailsPage: React.FC<CandidateApplicationDetailsPageProps> = ({ appId: propAppId }) => {
  const resolvedAppId = propAppId || window.location.pathname.split('/candidate/applications/')[1] || '';

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [history, setHistory] = useState<ApplicationStatusHistory[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Withdrawal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const loadApplicationDetails = useCallback(async () => {
    if (!resolvedAppId) {
      setIsLoading(false);
      setErrorMessage('Invalid Application ID.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const [appRes, histRes, intRes] = await Promise.all([
      applicationService.getMyApplicationById(resolvedAppId),
      applicationService.getApplicationStatusHistory(resolvedAppId),
      interviewService.getMyInterviews(),
    ]);

    if (appRes.error || !appRes.data) {
      setErrorMessage(appRes.error?.message || 'Application record not found or inaccessible.');
      setApplication(null);
    } else {
      setApplication(appRes.data);
      setHistory(histRes.data || []);
      // Filter interviews linked to this application
      if (intRes.data) {
        setInterviews(intRes.data.filter((i) => i.application_id === resolvedAppId));
      }
    }

    setIsLoading(false);
  }, [resolvedAppId]);

  useEffect(() => {
    loadApplicationDetails();
  }, [loadApplicationDetails]);

  // Handle Application Withdrawal
  const handleConfirmWithdraw = async () => {
    if (!application) return;
    setIsWithdrawing(true);
    setWithdrawError(null);

    const { data, error } = await applicationService.withdrawApplication(application.id);

    setIsWithdrawing(false);

    if (error) {
      setWithdrawError(error.message);
    } else if (data) {
      setApplication(data);
      setIsWithdrawModalOpen(false);
      // Reload history to reflect the withdrawn stage
      const histRes = await applicationService.getApplicationStatusHistory(application.id);
      if (histRes.data) setHistory(histRes.data);
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/candidate/applications');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Build timeline steps based on stage and history
  const buildTimelineSteps = (currentStage: ApplicationStage): TimelineStep[] => {
    const stageOrder: ApplicationStage[] = ['new', 'screening', 'interview', 'offer', 'hired'];
    const stageIndex = stageOrder.indexOf(currentStage);

    const formatDateForStage = (st: string) => {
      const entry = history.find((h) => h.to_stage === st);
      if (entry) {
        return new Date(entry.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      }
      return undefined;
    };

    if (currentStage === 'withdrawn') {
      return [
        { title: 'Submitted', date: formatDateForStage('new') || 'Applied', status: 'completed' },
        { title: 'Application Withdrawn', date: formatDateForStage('withdrawn') || 'Withdrawn', status: 'current' },
      ];
    }

    if (currentStage === 'rejected') {
      return [
        { title: 'Submitted', date: formatDateForStage('new') || 'Applied', status: 'completed' },
        { title: 'Profile Reviewed', status: 'completed' },
        { title: 'Not Selected', status: 'current' },
      ];
    }

    return [
      {
        title: 'Submitted',
        date: formatDateForStage('new') || (application ? new Date(application.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''),
        status: stageIndex >= 0 ? (stageIndex === 0 ? 'current' : 'completed') : 'completed',
      },
      {
        title: 'Screening',
        date: formatDateForStage('screening'),
        status: stageIndex > 1 ? 'completed' : stageIndex === 1 ? 'current' : 'upcoming',
      },
      {
        title: 'Interview',
        date: formatDateForStage('interview'),
        status: stageIndex > 2 ? 'completed' : stageIndex === 2 ? 'current' : 'upcoming',
      },
      {
        title: 'Offer',
        date: formatDateForStage('offer'),
        status: stageIndex > 3 ? 'completed' : stageIndex === 3 ? 'current' : 'upcoming',
      },
      {
        title: 'Onboarding',
        date: formatDateForStage('hired'),
        status: stageIndex === 4 ? 'completed' : 'upcoming',
      },
    ];
  };

  const getStageBadge = (stage: ApplicationStage) => {
    switch (stage) {
      case 'new': return <Badge variant="indigo">Application Submitted</Badge>;
      case 'screening': return <Badge variant="cyan">Under Initial Review</Badge>;
      case 'shortlisted': return <Badge variant="emerald">Shortlisted</Badge>;
      case 'interview': return <Badge variant="indigo">Interview Stage</Badge>;
      case 'offer': return <Badge variant="emerald">Offer Extended</Badge>;
      case 'hired': return <Badge variant="emerald">Hired</Badge>;
      case 'rejected': return <Badge variant="slate">Archived</Badge>;
      case 'withdrawn': return <Badge variant="slate">Withdrawn by Candidate</Badge>;
      default: return <Badge variant="slate">{stage}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <CandidateShell title="Application Overview" currentPath="/candidate/applications">
        <div className="space-y-6">
          <div className="h-6 w-32 bg-kth-slate-200 rounded animate-pulse" />
          <div className="bg-white p-8 rounded-2xl border border-kth-slate-200 space-y-6 animate-pulse">
            <div className="h-8 bg-kth-slate-200 rounded w-2/3" />
            <div className="h-4 bg-kth-slate-100 rounded w-1/3" />
            <div className="h-20 bg-kth-slate-100 rounded-xl" />
          </div>
        </div>
      </CandidateShell>
    );
  }

  if (errorMessage || !application) {
    return (
      <CandidateShell title="Application Not Found" currentPath="/candidate/applications">
        <div className="bg-white p-12 rounded-2xl border border-kth-slate-200 text-center max-w-lg mx-auto my-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-kth-slate-100 text-kth-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-lg text-kth-slate-900">Application Record Not Found</h3>
          <p className="text-xs text-kth-slate-500 leading-relaxed">
            {errorMessage || 'This application does not exist or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Applications
            </Button>
          </div>
        </div>
      </CandidateShell>
    );
  }

  const job = application.job;
  const isSalaryValid = job && ((job.min_salary_inr && job.min_salary_inr > 0) || (job.max_salary_inr && job.max_salary_inr > 0));
  const salaryText = isSalaryValid
    ? `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`
    : 'Salary not disclosed';

  const year = new Date(application.applied_at).getFullYear() || 2026;
  const cleanId = application.id.replace(/^(demo-app-|app-)/, '').slice(0, 5).toUpperCase();
  const applicationRef = `KTH-${year}-${cleanId}`;

  const isWithdrawable = application.stage !== 'withdrawn' && application.stage !== 'hired' && application.stage !== 'rejected';

  return (
    <CandidateShell title={`Application — ${job?.title || 'Requisition'}`} currentPath="/candidate/applications">
      <div className="space-y-6 font-sans">
        {/* Back link */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Applications</span>
          </button>

          {isWithdrawable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              Withdraw Application
            </Button>
          )}
        </div>

        <Card className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getStageBadge(application.stage)}
                <span className="text-xs text-kth-slate-400 font-mono">
                  App #{applicationRef}
                </span>
              </div>
              <h1 className="font-display text-2xl font-extrabold text-kth-slate-900">{job?.title}</h1>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-kth-slate-600 mt-1">
                <span className="font-semibold text-kth-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-kth-slate-400" />
                  {job?.company?.name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-kth-slate-400" />
                  {job?.location}
                </span>
              </div>
            </div>

            <div className="font-mono text-lg font-bold text-kth-primary-600">
              {salaryText}
            </div>
          </div>

          {/* Full Application History Timeline */}
          <div className="border-t border-b border-kth-slate-200 py-6">
            <h2 className="font-display font-bold text-sm text-kth-slate-900 mb-4">Application Lifecycle</h2>
            <ProgressTimeline steps={buildTimelineSteps(application.stage)} />
          </div>

          {/* Scheduled Interview Section */}
          {interviews.length > 0 && (
            <div className="bg-cyan-50 p-5 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-2.5 mb-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                <h3 className="font-display font-bold text-base text-cyan-950">Scheduled Interview Round</h3>
              </div>
              <p className="text-xs text-cyan-900 mb-4">
                You have a confirmed interview session scheduled with the recruitment team.
              </p>
              <div className="bg-white p-4 rounded-lg border border-cyan-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-kth-slate-400 block text-[10px]">SCHEDULED DATE & TIME</span>
                  <strong className="text-kth-slate-900 font-semibold">
                    {new Date(interviews[0].scheduled_start).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </div>
                <div>
                  <span className="text-kth-slate-400 block text-[10px]">INTERVIEW TYPE</span>
                  <strong className="text-kth-slate-900 font-semibold flex items-center gap-1 capitalize">
                    {interviews[0].interview_type === 'walk_in' ? (
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    ) : interviews[0].interview_type === 'on_site' ? (
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-kth-primary-600" />
                    )}
                    {interviews[0].interview_type.replace('_', ' ')}
                  </strong>
                </div>
                <div>
                  {interviews[0].interview_type === 'walk_in' || interviews[0].interview_type === 'on_site' ? (
                    <>
                      <span className="text-kth-slate-400 block text-[10px]">VENUE / OFFICE LOCATION</span>
                      <strong className="text-kth-slate-900 font-semibold truncate block">
                        {interviews[0].venue_address || interviews[0].location || 'Enterprise Office Headquarters'}
                      </strong>
                    </>
                  ) : (
                    <>
                      <span className="text-kth-slate-400 block text-[10px]">MEETING LINK</span>
                      {interviews[0].meeting_link ? (
                        <a
                          href={interviews[0].meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-kth-primary-600 font-bold hover:underline truncate block"
                        >
                          Join Meeting Link →
                        </a>
                      ) : (
                        <span className="text-kth-slate-500 font-medium">Link will be shared prior to start</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cover Note Section if Submitted */}
          {application.cover_letter && (
            <div>
              <h2 className="font-display font-bold text-sm text-kth-slate-900 mb-2">Submitted Cover Note</h2>
              <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-xs text-kth-slate-700 whitespace-pre-line leading-relaxed">
                {application.cover_letter}
              </div>
            </div>
          )}

          {/* Submitted Resume Summary */}
          <div>
            <h2 className="font-display font-bold text-sm text-kth-slate-900 mb-2">Attached Profile Document</h2>
            <div className="bg-kth-slate-50 p-3 rounded-lg border border-kth-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-kth-primary-600" />
                <span className="font-semibold text-kth-slate-800">
                  {application.resume_url ? 'Attached Candidate Resume' : 'Verified Candidate Profile Snapshot'}
                </span>
              </div>
              <Badge variant="emerald">Verified Submission</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Withdrawal Confirmation Dialog */}
      <Dialog
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Application"
        description="Are you sure you want to withdraw your application for this position?"
      >
        <div className="space-y-4 text-left">
          {withdrawError && (
            <Alert variant="error" title="Action Failed">
              {withdrawError}
            </Alert>
          )}

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Withdrawing will remove your candidacy from the active hiring pipeline for <strong>{job?.title}</strong>. This action is recorded in the hiring timeline.
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsWithdrawModalOpen(false)}
              disabled={isWithdrawing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConfirmWithdraw}
              disabled={isWithdrawing}
              isLoading={isWithdrawing}
              className="bg-rose-600 text-white hover:bg-rose-700 border-transparent font-bold"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
            </Button>
          </div>
        </div>
      </Dialog>
    </CandidateShell>
  );
};
