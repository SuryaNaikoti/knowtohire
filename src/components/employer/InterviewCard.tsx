import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Interview, InterviewStatus } from '@/services';
import { Calendar, Video, ExternalLink, MapPin } from 'lucide-react';

export interface InterviewCardProps {
  interview: Interview;
  onMarkCompleted?: (interviewId: string) => void;
  onCancel?: (interviewId: string) => void;
  isActionLoading?: boolean;
}

export const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  onMarkCompleted,
  onCancel,
  isActionLoading = false,
}) => {
  const candidateName = interview.candidate?.full_name || 'Candidate';
  const jobTitle = interview.job?.title || 'Job Opening';

  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="emerald" hasPulse>Scheduled</Badge>;
      case 'completed':
        return <Badge variant="cyan">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="slate">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="amber">Rescheduled</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const startDate = new Date(interview.scheduled_start);
  const formattedDate = startDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="p-5 bg-white border-kth-slate-200 flex flex-col justify-between h-full font-sans shadow-xs">
      <div>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="indigo" className="text-[10px] capitalize">
            {interview.interview_type.replace('_', ' ')}
          </Badge>
          {getStatusBadge(interview.status)}
        </div>

        <h4 className="font-display font-bold text-base text-kth-slate-900 mb-0.5">{candidateName}</h4>
        <p className="text-xs text-kth-slate-500 font-medium mb-3">{jobTitle}</p>

        <div className="bg-kth-slate-50 p-3 rounded-xl border border-kth-slate-200 space-y-2 text-xs text-kth-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-kth-primary-600 shrink-0" />
            <span className="font-semibold">{formattedDate} at {formattedTime}</span>
          </div>
          {interview.location && (
            <div className="flex items-center gap-2 text-kth-slate-600">
              <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
              <span>{interview.location}</span>
            </div>
          )}
          {interview.notes && (
            <div className="text-[11px] text-kth-slate-500 italic pt-1 border-t border-kth-slate-200">
              &quot;{interview.notes}&quot;
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-kth-slate-100 flex items-center justify-between gap-2 flex-wrap">
        {interview.meeting_link ? (
          <a
            href={interview.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700"
          >
            <Video className="w-3.5 h-3.5" /> Join Call <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : (
          <span className="text-xs text-kth-slate-400">Onsite / Phone</span>
        )}

        {interview.status === 'scheduled' && (
          <div className="flex items-center gap-1.5">
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => onCancel(interview.id)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
            )}
            {onMarkCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkCompleted(interview.id)}
                disabled={isActionLoading}
              >
                Mark Done
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
