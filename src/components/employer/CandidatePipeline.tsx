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
  const [mobileActiveStage, setMobileActiveStage] = useState<ApplicationStage>('new');

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

  const mobileFilteredApps = applications.filter((a) => a.stage === mobileActiveStage);

  return (
    <>
      {/* Mobile Stage Selector Tabs (< sm) */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
      <div className="hidden sm:flex gap-4 overflow-x-auto pb-4 pt-1 font-sans">
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
