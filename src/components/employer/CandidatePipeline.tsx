import React, { useState } from 'react';
import { CandidatePipelineCard } from './CandidatePipelineCard';
import { CandidateQuickView } from './CandidateQuickView';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { applicationService, JobApplication, ApplicationStage } from '@/services';
import { UserX, AlertCircle } from 'lucide-react';

export interface CandidatePipelineProps {
  applications: JobApplication[];
  onApplicationUpdated?: (updatedApp: JobApplication) => void;
  showArchives?: boolean;
}

const REJECTION_REASONS = [
  'Qualifications / Experience Mismatch',
  'Salary Expectation Mismatch',
  'Selected Another Candidate for Position',
  'Technical Evaluation Not Cleared',
  'Culture & Communication Fit Mismatch',
  'Candidate Withdrew / Unresponsive',
  'Position Placed on Hold / Closed',
  'Other Requirements Unmet',
];

export const CandidatePipeline: React.FC<CandidatePipelineProps> = ({
  applications,
  onApplicationUpdated,
  showArchives = false,
}) => {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [mobileActiveStage, setMobileActiveStage] = useState<ApplicationStage>('new');
  
  // Rejection modal state
  const [appToReject, setAppToReject] = useState<JobApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>(REJECTION_REASONS[0]);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const activeStages: { stage: ApplicationStage; label: string }[] = [
    { stage: 'new', label: 'New Applicants' },
    { stage: 'screening', label: 'Screening' },
    { stage: 'shortlisted', label: 'Shortlisted' },
    { stage: 'interview', label: 'Interview' },
    { stage: 'offer', label: 'Offer Extended' },
    { stage: 'hired', label: 'Hired' },
  ];

  const archiveStages: { stage: ApplicationStage; label: string }[] = [
    { stage: 'rejected', label: 'Not Selected' },
    { stage: 'withdrawn', label: 'Withdrawn' },
  ];

  const stagesToRender = showArchives ? [...activeStages, ...archiveStages] : activeStages;

  const handleAdvanceStage = async (app: JobApplication, nextStage: ApplicationStage) => {
    const { data } = await applicationService.updateApplicationStage(app.id, nextStage);
    if (data) {
      onApplicationUpdated?.(data);
    }
  };

  const handleOpenRejectModal = (app: JobApplication) => {
    setAppToReject(app);
    setRejectionReason(REJECTION_REASONS[0]);
    setRejectError(null);
  };

  const handleConfirmReject = async () => {
    if (!appToReject) return;
    setIsRejecting(true);
    setRejectError(null);

    const { data, error } = await applicationService.rejectApplication(appToReject.id, rejectionReason);
    setIsRejecting(false);

    if (error) {
      setRejectError(error.message);
    } else if (data) {
      onApplicationUpdated?.(data);
      setAppToReject(null);
      if (selectedApplication?.id === data.id) {
        setSelectedApplication(data);
      }
    }
  };

  const mobileFilteredApps = applications.filter((a) => a.stage === mobileActiveStage);

  return (
    <>
      {/* Mobile Stage Selector Tabs (< sm) */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-scroll">
          {stagesToRender.map(({ stage, label }) => {
            const count = applications.filter((a) => a.stage === stage).length;
            const isActive = mobileActiveStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setMobileActiveStage(stage)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                  isActive
                    ? 'bg-kth-primary-600 text-white border-kth-primary-700 shadow-sm'
                    : 'bg-white text-kth-slate-700 border-kth-slate-200 hover:bg-kth-slate-50'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-kth-slate-100 text-kth-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Single Column Cards List */}
        <div className="bg-kth-slate-100/90 p-3.5 rounded-2xl border border-kth-slate-200 space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-xs uppercase tracking-wider text-kth-slate-800">
              {stagesToRender.find((s) => s.stage === mobileActiveStage)?.label}
            </span>
            <span className="text-xs text-kth-slate-500 font-mono">
              {mobileFilteredApps.length} candidates
            </span>
          </div>

          <div className="space-y-2.5">
            {mobileFilteredApps.length > 0 ? (
              mobileFilteredApps.map((app) => (
                <CandidatePipelineCard
                  key={app.id}
                  application={app}
                  onQuickView={(a) => setSelectedApplication(a)}
                  onAdvanceStage={handleAdvanceStage}
                  onRejectCandidate={handleOpenRejectModal}
                />
              ))
            ) : (
              <div className="p-6 text-center text-xs text-kth-slate-400 border border-dashed border-kth-slate-200 rounded-xl bg-white">
                No candidates currently in this stage
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop & Tablet Multi-Column Kanban (>= sm) */}
      <div className="hidden sm:flex gap-4 overflow-x-auto pb-4 pt-1 font-sans scrollbar-none touch-scroll">
        {stagesToRender.map(({ stage, label }) => {
          const stageApps = applications.filter((a) => a.stage === stage);

          return (
            <div
              key={stage}
              className="w-72 shrink-0 bg-kth-slate-100/80 p-3 rounded-2xl border border-kth-slate-200 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-kth-slate-700">
                  {label}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white rounded-full text-kth-slate-600 border border-kth-slate-200">
                  {stageApps.length}
                </span>
              </div>

              {/* Column Candidate Cards List */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {stageApps.length > 0 ? (
                  stageApps.map((app) => (
                    <CandidatePipelineCard
                      key={app.id}
                      application={app}
                      onQuickView={(a) => setSelectedApplication(a)}
                      onAdvanceStage={handleAdvanceStage}
                      onRejectCandidate={handleOpenRejectModal}
                    />
                  ))
                ) : (
                  <div className="p-5 text-center text-xs text-kth-slate-400 border border-dashed border-kth-slate-200 rounded-xl bg-white/50">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Quick View Slide-Over Drawer */}
      <CandidateQuickView
        application={selectedApplication}
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        onApplicationUpdated={(updated) => {
          setSelectedApplication(updated);
          onApplicationUpdated?.(updated);
        }}
      />

      {/* Candidate Rejection Confirmation Dialog */}
      <Dialog
        isOpen={appToReject !== null}
        onClose={() => setAppToReject(null)}
        title="Conclude Application (Decline / Reject)"
        description={`Are you sure you want to mark this candidate as not selected? This will update the candidate's tracking dashboard and move them to the archived pipeline.`}
      >
        <div className="space-y-4 text-left font-sans">
          {rejectError && (
            <Alert variant="error" title="Rejection Failed">
              {rejectError}
            </Alert>
          )}

          {appToReject && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <UserX className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {appToReject.candidate?.full_name || (appToReject.candidate_snapshot as any)?.full_name || 'Candidate'}
                </span>
              </div>
              <p className="text-[11px] text-rose-700">
                Applied for: <strong>{appToReject.job?.title || 'Requisition'}</strong> · Current stage: <strong className="capitalize">{appToReject.stage}</strong>
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block font-mono">
              Primary Rejection Reason
            </label>
            <Select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              options={REJECTION_REASONS.map((r) => ({ value: r, label: r }))}
            />
          </div>

          <div className="flex items-start gap-2 p-2.5 bg-kth-slate-50 rounded-xl border border-kth-slate-200 text-[11px] text-kth-slate-600">
            <AlertCircle className="w-4 h-4 text-kth-slate-400 shrink-0 mt-0.5" />
            <span>
              The candidate will receive an updated status in their application tracker stating that the selection process for this opening has concluded.
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAppToReject(null)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConfirmReject}
              disabled={isRejecting}
              isLoading={isRejecting}
              className="bg-rose-600 text-white hover:bg-rose-700 border-transparent font-bold"
            >
              {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
