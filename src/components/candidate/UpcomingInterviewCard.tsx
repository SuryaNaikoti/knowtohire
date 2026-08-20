import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Video, MapPin, ArrowRight, Clock } from 'lucide-react';
import { Interview, InterviewType } from '@/services';

export interface UpcomingInterviewCardProps {
  interview: Interview;
  onViewAll?: () => void;
}

const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  hr_screening: 'HR Screening',
  technical_deep_dive: 'Technical Round',
  case_study: 'Case Study',
  executive_review: 'Executive Review',
};

export const UpcomingInterviewCard: React.FC<UpcomingInterviewCardProps> = ({
  interview,
  onViewAll,
}) => {
  const startDate = new Date(interview.scheduled_start);
  const now = new Date();
  const diffMs = startDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let timeLabel: string;
  if (diffDays > 0) {
    timeLabel = `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    timeLabel = `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  } else {
    timeLabel = 'Starting soon';
  }

  const formattedDate = startDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const isVirtual = Boolean(interview.meeting_link);
  // company data is joined at runtime but not in TS type
  const companyName = (interview as any).company?.name;

  return (
    <Card className="p-5 border-l-4 border-l-kth-primary-600 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant="indigo" className="gap-1 text-[10px]">
          <Calendar className="w-3 h-3" /> Next Interview
        </Badge>
        <span className="text-xs font-mono font-bold text-kth-accent-emerald">{timeLabel}</span>
      </div>

      {/* Interview title */}
      <div>
        <h4 className="font-display font-bold text-sm text-kth-slate-900 leading-snug">
          {interview.title}
        </h4>
        {interview.job && (
          <p className="text-xs text-kth-slate-500 mt-0.5 truncate">
            {interview.job.title}
            {companyName ? ` · ${companyName}` : ''}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-kth-slate-600">
          <Clock className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
          <span>
            {formattedDate} · {formattedTime}
          </span>
        </div>
        {isVirtual ? (
          <div className="flex items-center gap-2 text-xs text-kth-slate-600">
            <Video className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
            <span>Virtual Interview</span>
          </div>
        ) : interview.location ? (
          <div className="flex items-center gap-2 text-xs text-kth-slate-600">
            <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
            <span className="truncate">{interview.location}</span>
          </div>
        ) : null}
        <Badge variant="indigo" className="text-[10px] py-0.5 px-2 w-fit mt-1">
          {INTERVIEW_TYPE_LABELS[interview.interview_type] || interview.interview_type}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {isVirtual && interview.meeting_link && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => window.open(interview.meeting_link!, '_blank')}
          >
            <Video className="w-3 h-3" /> Join Meeting
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className={`text-xs ${!isVirtual ? 'w-full' : ''}`}
          onClick={onViewAll}
        >
          View All <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
};
