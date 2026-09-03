import React from 'react';
import { Card } from '@/components/ui/Card';
import { JobApplication, ApplicationStage } from '@/services';
import { MapPin, Star, ArrowRight, UserX } from 'lucide-react';

export interface CandidatePipelineCardProps {
  application: JobApplication;
  onQuickView: (application: JobApplication) => void;
  onAdvanceStage?: (application: JobApplication, nextStage: ApplicationStage) => void;
  onRejectCandidate?: (application: JobApplication) => void;
}

export const CandidatePipelineCard: React.FC<CandidatePipelineCardProps> = ({
  application,
  onQuickView,
  onAdvanceStage,
  onRejectCandidate,
}) => {
  const snapshot = (application.candidate_snapshot || {}) as Record<string, any>;
  const candidateName = application.candidate?.full_name || snapshot.full_name || 'Candidate';
  const headline = snapshot.headline || '';
  const location = snapshot.location || '—';
  const jobTitle = application.job?.title || 'Requisition';

  const getNextStage = (current: ApplicationStage): ApplicationStage | null => {
    switch (current) {
      case 'new': return 'screening';
      case 'screening': return 'shortlisted';
      case 'shortlisted': return 'interview';
      case 'interview': return 'offer';
      case 'offer': return 'hired';
      default: return null;
    }
  };

  const nextStage = getNextStage(application.stage);
  const isRejectable = application.stage !== 'rejected' && application.stage !== 'withdrawn' && application.stage !== 'hired';

  return (
    <Card
      variant="interactive"
      className="p-3.5 bg-white border-kth-slate-200 cursor-pointer group font-sans hover:shadow-sm transition-all"
      onClick={() => onQuickView(application)}
    >
      <div className="flex justify-between items-start mb-1.5">
        <h4
          className="font-display font-bold text-xs text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors line-clamp-1 hover:underline cursor-pointer"
          title="Open Candidate Quick View"
        >
          {candidateName}
        </h4>
        {application.employer_rating && application.employer_rating > 0 && (
          <span className="flex items-center text-[10px] font-mono font-bold text-amber-500">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
            {application.employer_rating}
          </span>
        )}
      </div>

      {headline && <p className="text-[11px] text-kth-slate-600 font-medium truncate mb-1.5">{headline}</p>}

      <div className="flex items-center gap-1 text-[10px] text-kth-slate-500 mb-2 truncate">
        <span className="font-semibold text-kth-slate-700 truncate">{jobTitle}</span>
      </div>

      <div className="flex items-center justify-between text-[10px] text-kth-slate-400 border-t border-kth-slate-100 pt-2 gap-2">
        <span className="flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 text-kth-slate-400 shrink-0" /> {location.split(',')[0]}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {isRejectable && onRejectCandidate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRejectCandidate(application);
              }}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-0.5 hover:underline"
              title="Decline / Reject candidate at this stage"
            >
              <UserX className="w-2.5 h-2.5" /> Reject
            </button>
          )}

          {nextStage && onAdvanceStage ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdvanceStage(application, nextStage);
              }}
              className="text-[10px] font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-0.5 hover:underline"
            >
              Advance <ArrowRight className="w-2.5 h-2.5" />
            </button>
          ) : (
            <span>
              {new Date(application.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
