import React from 'react';
import { useHiringWorkspace } from '../../context/HiringWorkspaceContext';
import type { HiringPipelineStage } from '../../types/employer.types';
import { ChevronRight } from 'lucide-react';

export const HiringPipelineStudio: React.FC = () => {
  const { advanceCandidatePipelineStage } = useHiringWorkspace();

  const stages: HiringPipelineStage[] = [
    'Applied',
    'Shortlisted',
    'Recruiter Screen',
    'Technical Interview',
    'Manager Interview',
    'Offer Extended',
    'Offer Accepted',
  ];

  const pipelineItems = [
    { id: 'app_1', candidateName: 'Alex Rivera', role: 'Senior Full-Stack ESG Engineer', stage: 'Technical Interview', fitScore: 92 },
    { id: 'app_2', candidateName: 'Elena Rostova', role: 'Climate AI & Data Systems Architect', stage: 'Shortlisted', fitScore: 94 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Opportunity-Centric Hiring Pipeline Kanban</h3>
          <p className="text-xs text-slate-500">Track candidate progression across hiring pipeline stages.</p>
        </div>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto">
        {stages.slice(0, 4).map((stage) => {
          const itemsInStage = pipelineItems.filter((i) => i.stage === stage);

          return (
            <div key={stage} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shrink-0 min-w-[220px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage}</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-extrabold rounded-full text-slate-700">
                  {itemsInStage.length}
                </span>
              </div>

              <div className="space-y-2">
                {itemsInStage.map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.candidateName}</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                        {item.fitScore}% Fit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.role}</p>

                    <button
                      type="button"
                      onClick={() => advanceCandidatePipelineStage(item.id, 'Technical Interview')}
                      className="w-full mt-1 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      <span>Advance Stage</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
