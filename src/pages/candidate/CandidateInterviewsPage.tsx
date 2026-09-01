import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { interviewService, Interview, InterviewType, InterviewStatus } from '@/services/interviewService';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building2,
  Phone,
  ExternalLink,
  FileCheck,
  User,
  Info,
  Navigation,
} from 'lucide-react';

function isValidUrl(urlString?: string | null): boolean {
  if (!urlString) return false;
  try {
    const url = new URL(urlString.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface CandidateInterviewsPageProps {
  onNavigate?: (path: string) => void;
}

export const CandidateInterviewsPage: React.FC<CandidateInterviewsPageProps> = ({ onNavigate }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await interviewService.getMyInterviews();
    if (error) {
      setErrorMessage(error.message);
      setInterviews([]);
    } else if (data) {
      setInterviews(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadInterviews();

    const handleSync = () => {
      loadInterviews();
    };

    window.addEventListener('kth_interviews_changed', handleSync);
    window.addEventListener('kth_applications_changed', handleSync);
    return () => {
      window.removeEventListener('kth_interviews_changed', handleSync);
      window.removeEventListener('kth_applications_changed', handleSync);
    };
  }, [loadInterviews]);

  // Categorize Upcoming vs Past
  const now = new Date();
  const upcomingInterviews = interviews
    .filter((i) => {
      if (i.status === 'completed' || i.status === 'cancelled' || i.status === 'no_show') {
        return false;
      }
      const endDate = i.scheduled_end ? new Date(i.scheduled_end) : new Date(i.scheduled_start);
      return endDate >= now;
    })
    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime());

  const pastInterviews = interviews
    .filter((i) => {
      if (i.status === 'completed' || i.status === 'cancelled' || i.status === 'no_show') {
        return true;
      }
      const endDate = i.scheduled_end ? new Date(i.scheduled_end) : new Date(i.scheduled_start);
      return endDate < now;
    })
    .sort((a, b) => new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime());

  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="emerald" hasPulse>Scheduled</Badge>;
      case 'confirmed':
        return <Badge variant="emerald">Confirmed</Badge>;
      case 'rescheduled':
        return <Badge variant="amber">Rescheduled</Badge>;
      case 'completed':
        return <Badge variant="slate">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="rose">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="slate">No Show</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const getInterviewTypeMeta = (type: InterviewType, platform?: string | null) => {
    switch (type) {
      case 'video':
        return { label: platform ? `${platform} Video Interview` : 'Video Interview', icon: Video, variant: 'indigo' as const };
      case 'phone':
        return { label: 'Phone Interview', icon: Phone, variant: 'cyan' as const };
      case 'on_site':
        return { label: 'On-site Interview', icon: MapPin, variant: 'emerald' as const };
      case 'walk_in':
        return { label: 'Walk-in Interview', icon: Building2, variant: 'amber' as const };
      case 'external':
        return { label: platform ? `${platform}` : 'External Interview', icon: ExternalLink, variant: 'indigo' as const };
      case 'hr_screening':
        return { label: 'HR Talent Screening', icon: Phone, variant: 'cyan' as const };
      case 'technical_deep_dive':
        return { label: platform ? `${platform} Technical Interview` : 'Technical Interview', icon: Video, variant: 'indigo' as const };
      case 'case_study':
        return { label: 'Case Study & Presentation', icon: Video, variant: 'indigo' as const };
      case 'executive_review':
        return { label: 'Executive Review', icon: Building2, variant: 'emerald' as const };
      default:
        return { label: String(type).replace(/_/g, ' '), icon: Calendar, variant: 'slate' as const };
    }
  };

  const formatSchedule = (interview: Interview) => {
    if (interview.interview_type === 'walk_in' && (interview.date_from || interview.date_to)) {
      const fromStr = interview.date_from ? new Date(interview.date_from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
      const toStr = interview.date_to ? new Date(interview.date_to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const windowStr = interview.time_window ? ` · ${interview.time_window}` : '';
      return `${fromStr}${toStr ? ` – ${toStr}` : ''}${windowStr}`;
    }

    const startDate = new Date(interview.scheduled_start);
    const dateStr = startDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const startTimeStr = startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    let endTimeStr = '';
    if (interview.scheduled_end) {
      endTimeStr = ` – ${new Date(interview.scheduled_end).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }

    return `${dateStr} · ${startTimeStr}${endTimeStr}`;
  };

  const handleNavigateJobs = () => {
    window.history.pushState({}, '', '/candidate/jobs');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const renderInterviewCard = (interview: Interview, isPast = false) => {
    const typeMeta = getInterviewTypeMeta(interview.interview_type, interview.meeting_platform);
    const TypeIcon = typeMeta.icon;
    const isVideo = interview.interview_type === 'video' || interview.interview_type === 'technical_deep_dive' || interview.interview_type === 'case_study';
    const isExternal = interview.interview_type === 'external';
    const isOnsite = interview.interview_type === 'on_site' || interview.interview_type === 'executive_review';
    const isWalkIn = interview.interview_type === 'walk_in';
    const isPhone = interview.interview_type === 'phone' || interview.interview_type === 'hr_screening';

    const companyName = interview.company?.name || 'Verified Enterprise';
    const jobTitle = interview.job?.title || 'Job Opening';
    const hasValidMeetingLink = isValidUrl(interview.meeting_link);
    const isJoinable = !isPast && (interview.status === 'scheduled' || interview.status === 'confirmed' || interview.status === 'rescheduled');

    return (
      <Card
        key={interview.id}
        variant="interactive"
        className={`p-6 transition-all border border-kth-slate-200 hover:border-kth-primary-300 hover:shadow-xs flex flex-col justify-between ${
          isPast ? 'opacity-85 bg-kth-slate-50/50' : 'bg-white'
        }`}
      >
        <div className="space-y-3">
          {/* Header Bar */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={typeMeta.variant} className="gap-1.5 text-[11px] font-semibold py-0.5">
                <TypeIcon className="w-3.5 h-3.5" />
                {typeMeta.label}
              </Badge>
              {interview.round_name && (
                <span className="text-[11px] font-semibold text-kth-slate-500 bg-kth-slate-100 px-2 py-0.5 rounded-md border border-kth-slate-200">
                  {interview.round_name}
                </span>
              )}
            </div>
            {getStatusBadge(interview.status)}
          </div>

          {/* Title & Role */}
          <div>
            <h3 className="font-display text-base font-bold text-kth-slate-900 leading-snug">
              {interview.title || jobTitle}
            </h3>
            <div className="flex items-center gap-2 text-xs text-kth-slate-500 mt-1">
              <span className="font-semibold text-kth-slate-800 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-kth-slate-400" />
                {companyName}
              </span>
              <span>•</span>
              <span>{jobTitle}</span>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="bg-kth-slate-50 p-3 rounded-xl border border-kth-slate-200/80 space-y-2 text-xs text-kth-slate-700">
            <div className="flex items-center gap-2 font-mono font-medium text-kth-slate-800">
              <Calendar className="w-3.5 h-3.5 text-kth-primary-600 shrink-0" />
              <span>{formatSchedule(interview)}</span>
            </div>

            {/* Type-Specific Content Snippet */}
            {(isVideo || isExternal) && (
              <div className="flex items-center gap-2 text-kth-slate-600">
                <Video className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                <span>
                  {interview.meeting_platform ? `${interview.meeting_platform}` : (isVideo ? 'Video Interview' : 'External Platform')}
                  {!hasValidMeetingLink ? ' — Meeting link will be provided by the employer.' : ''}
                </span>
              </div>
            )}

            {isPhone && (
              <div className="flex items-center gap-2 text-kth-slate-600">
                <Phone className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                <span>
                  {interview.contact_phone ? `Direct Call: ${interview.contact_phone}` : 'Call details will be provided by the employer.'}
                </span>
              </div>
            )}

            {(isOnsite || isWalkIn) && (interview.venue_address || interview.location) && (
              <div className="flex items-start gap-2 text-kth-slate-600">
                <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{interview.venue_address || interview.location}</span>
              </div>
            )}

            {interview.interviewer_name && (
              <div className="flex items-center gap-2 text-kth-slate-600">
                <User className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                <span>
                  Interviewer: <strong>{interview.interviewer_name}</strong>
                  {interview.interviewer_role ? ` (${interview.interviewer_role})` : ''}
                </span>
              </div>
            )}

            {isWalkIn && interview.required_documents && interview.required_documents.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-amber-800 pt-1 border-t border-kth-slate-200/60">
                <FileCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Bring: {interview.required_documents.join(', ')}</span>
              </div>
            )}

            {interview.instructions && (
              <div className="text-[11px] text-kth-slate-600 pt-1 border-t border-kth-slate-200/60 line-clamp-2">
                <strong className="text-kth-slate-800">Note:</strong> {interview.instructions}
              </div>
            )}
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 mt-3 border-t border-kth-slate-100 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const target = `/candidate/interviews/${interview.id}`;
              if (onNavigate) {
                onNavigate(target);
              } else {
                window.history.pushState({}, '', target);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="text-xs text-kth-slate-600 font-semibold"
          >
            View Full Briefing
          </Button>

          {isJoinable && (
            <div>
              {(isVideo || isExternal) && hasValidMeetingLink && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Video className="w-3.5 h-3.5" />}
                  onClick={() => window.open(interview.meeting_link!, '_blank')}
                  className="font-bold text-xs"
                >
                  Join Interview
                </Button>
              )}

              {isOnsite && (interview.map_url || interview.venue_address || interview.location) && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Navigation className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (interview.map_url) {
                      window.open(interview.map_url, '_blank');
                    } else {
                      const query = encodeURIComponent(`${interview.venue_address || interview.location}`);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }
                  }}
                  className="text-xs font-semibold"
                >
                  View Location
                </Button>
              )}

              {isWalkIn && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Info className="w-3.5 h-3.5" />}
                  onClick={() => { window.location.href = `/candidate/interviews/${interview.id}`; }}
                  className="text-xs font-semibold"
                >
                  View Interview Details
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <CandidateShell title="My Scheduled Interviews" currentPath="/candidate/interviews">
      <div className="space-y-8 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-kth-slate-900 leading-tight">
              My Scheduled Interviews
            </h1>
            <p className="text-xs text-kth-slate-500 mt-1">
              Upcoming and past interviews with meeting details, recruiter information, and interview instructions.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="indigo" className="font-mono text-xs py-1 px-2.5">
              {upcomingInterviews.length} Upcoming
            </Badge>
            {pastInterviews.length > 0 && (
              <Badge variant="slate" className="font-mono text-xs py-1 px-2.5">
                {pastInterviews.length} Past
              </Badge>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="error" title="Failed to Load Interviews">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={loadInterviews}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-kth-slate-200 p-6 space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 bg-kth-slate-200 rounded w-28" />
                  <div className="h-4 bg-kth-slate-100 rounded w-16" />
                </div>
                <div className="h-6 bg-kth-slate-200 rounded w-3/4" />
                <div className="h-20 bg-kth-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Clean Empty State */}
        {!isLoading && !errorMessage && interviews.length === 0 && (
          <EmptyState
            title="No Interviews Scheduled Yet"
            description="When recruiters move your applications to the interview stage, your interview details will appear here."
            actionText="Discover Relevant Jobs"
            onAction={handleNavigateJobs}
            icon={<Calendar className="w-8 h-8 text-kth-slate-400" />}
          />
        )}

        {/* Upcoming Section */}
        {!isLoading && !errorMessage && upcomingInterviews.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-kth-primary-600" />
              Upcoming Interviews ({upcomingInterviews.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingInterviews.map((interview) => renderInterviewCard(interview, false))}
            </div>
          </div>
        )}

        {/* Past Section */}
        {!isLoading && !errorMessage && pastInterviews.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-kth-slate-200">
            <h2 className="font-display font-bold text-base text-kth-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-kth-slate-400" />
              Past Interviews ({pastInterviews.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastInterviews.map((interview) => renderInterviewCard(interview, true))}
            </div>
          </div>
        )}
      </div>
    </CandidateShell>
  );
};
