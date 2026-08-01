import React from 'react';
import type { ApplicationTimelineEntry } from '../../lib/services/applications/types';
import { Clock, ArrowRight } from 'lucide-react';

interface CandidateTimelineProps {
  timeline: ApplicationTimelineEntry[];
}

export const CandidateTimeline: React.FC<CandidateTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-emerald-600" /> Shared Application History Timeline
      </h4>
      <div className="space-y-2 relative pl-4 border-l border-slate-200">
        {timeline.map((entry) => (
          <div key={entry.id} className="relative text-xs space-y-0.5">
            <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                {entry.stage} <ArrowRight className="w-3 h-3 text-slate-400" />
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Updated by <span className="font-semibold text-slate-700">{entry.actingUser}</span>
            </p>
            {entry.notes && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded-md border border-slate-100 mt-1">
                "{entry.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
