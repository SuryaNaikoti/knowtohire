import React, { useState } from 'react';
import { CandidatePipelineCard } from './CandidatePipelineCard';
import { CandidateQuickView } from './CandidateQuickView';
import { applicationService, JobApplication, ApplicationStage } from '@/services';

export interface CandidatePipelineProps {
  applications: JobApplication[];
  onApplicationUpdated?: (updatedApp: JobApplication) => void;
  showArchives?: boolean;
}

export const CandidatePipeline: React.FC<CandidatePipelineProps> = ({
  applications,
  onApplicationUpdated,
  showArchives = false,
}) => {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  const activeStages: { stage: ApplicationStage; label: string }[] = [
    { stage: 'new', label: 'New Applicants' },
    { stage: 'screening', label: 'Screening' },
    { stage: 'shortlisted', label: 'Shortlisted' },
    { stage: 'interview', label: 'Interview' },
    { stage: 'offer', label: 'Offer Stage' },
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

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 font-sans">
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
    </>
  );
};
