import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
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
  CheckCircle2,
} from 'lucide-react';

export const CandidateInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    return () => {
      window.removeEventListener('kth_interviews_changed', handleSync);
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

  const getInterviewTypeMeta = (type: InterviewType) => {
    switch (type) {
      case 'video':
        return { label: 'Video Interview', icon: Video, variant: 'indigo' as const };
      case 'phone':
        return { label: 'Phone Interview', icon: Phone, variant: 'cyan' as const };
      case 'on_site':
        return { label: 'On-site / In-person', icon: MapPin, variant: 'emerald' as const };
      case 'walk_in':
        return { label: 'Walk-in Interview', icon: Building2, variant: 'amber' as const };
      case 'external':
        return { label: 'External Platform', icon: ExternalLink, variant: 'indigo' as const };
      case 'hr_screening':
        return { label: 'HR Talent Screening', icon: Phone, variant: 'cyan' as const };
      case 'technical_deep_dive':
        return { label: 'Technical Assessment', icon: Video, variant: 'indigo' as const };
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

  const handleOpenDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDetailsOpen(true);
  };

  const handleNavigateJobs = () => {
    window.history.pushState({}, '', '/candidate/jobs');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const renderInterviewCard = (interview: Interview, isPast = false) => {
    const typeMeta = getInterviewTypeMeta(interview.interview_type);
    const TypeIcon = typeMeta.icon;
    const isVideo = interview.interview_type === 'video' || interview.interview_type === 'technical_deep_dive' || interview.interview_type === 'case_study';
    const isExternal = interview.interview_type === 'external';
    const isOnsite = interview.interview_type === 'on_site' || interview.interview_type === 'executive_review';
    const isWalkIn = interview.interview_type === 'walk_in';
    const isPhone = interview.interview_type === 'phone' || interview.interview_type === 'hr_screening';

    const companyName = interview.company?.name || 'Verified Enterprise';
    const jobTitle = interview.job?.title || 'Job Opening';

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
            {isVideo && (
              <div className="flex items-center gap-2 text-kth-slate-600">
                <Video className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                <span>
                  {interview.meeting_platform ? `${interview.meeting_platform} Video Call` : 'Online Video Conference'}
                  {interview.meeting_link ? '' : ' (Link pending from recruiter)'}
                </span>
              </div>
            )}

            {isPhone && (
              <div className="flex items-center gap-2 text-kth-slate-600">
                <Phone className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                <span>
                  {interview.contact_phone ? `Direct Call: ${interview.contact_phone}` : 'Recruiter will initiate phone call'}
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
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 mt-3 border-t border-kth-slate-100 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => handleOpenDetails(interview)} className="text-xs text-kth-slate-600">
            View Details
          </Button>

          {!isPast && interview.status === 'scheduled' && (
            <div>
              {isVideo && interview.meeting_link && (
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

              {isExternal && interview.meeting_link && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => window.open(interview.meeting_link!, '_blank')}
                  className="font-bold text-xs"
                >
                  Open Interview Link
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
                  onClick={() => handleOpenDetails(interview)}
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
            description="When recruiters review your job applications and move you to the interview stage, your interview details will appear here."
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
              Past / Completed Rounds ({pastInterviews.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastInterviews.map((interview) => renderInterviewCard(interview, true))}
            </div>
          </div>
        )}
      </div>

      {/* Full Interview Details Modal */}
      {selectedInterview && (
        <Dialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={selectedInterview.title || 'Interview Details'}
          description={`Requisition: ${selectedInterview.job?.title || 'Open Position'}`}
        >
          <div className="space-y-4 text-left font-sans text-xs">
            {/* Type & Status Bar */}
            <div className="flex justify-between items-center bg-kth-slate-50 p-3 rounded-xl border border-kth-slate-200">
              <div className="flex items-center gap-2">
                <Badge variant={getInterviewTypeMeta(selectedInterview.interview_type).variant}>
                  {getInterviewTypeMeta(selectedInterview.interview_type).label}
                </Badge>
                {selectedInterview.round_name && (
                  <span className="font-semibold text-kth-slate-700">{selectedInterview.round_name}</span>
                )}
              </div>
              {getStatusBadge(selectedInterview.status)}
            </div>

            {/* Enterprise & Position */}
            <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-kth-slate-400 uppercase block">COMPANY & ROLE</span>
              <div className="font-semibold text-sm text-kth-slate-900">
                {selectedInterview.company?.name || 'Recruiting Enterprise'}
              </div>
              <div className="text-kth-slate-600">{selectedInterview.job?.title}</div>
            </div>

            {/* Date & Time Window */}
            <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-kth-slate-400 uppercase block">INTERVIEW SCHEDULE</span>
              <div className="font-mono text-xs font-semibold text-kth-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-kth-primary-600" />
                <span>{formatSchedule(selectedInterview)}</span>
              </div>
            </div>

            {/* Venue / Location Details */}
            {(selectedInterview.venue_address || selectedInterview.location) && (
              <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-kth-slate-400 uppercase block">VENUE / LOCATION</span>
                <div className="text-kth-slate-900 font-medium leading-relaxed">
                  {selectedInterview.venue_address || selectedInterview.location}
                </div>
                {selectedInterview.map_url && (
                  <a
                    href={selectedInterview.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-kth-primary-600 font-bold hover:underline pt-1"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Open Google Maps Directions
                  </a>
                )}
              </div>
            )}

            {/* Meeting Link for Video / External */}
            {selectedInterview.meeting_link && (
              <div className="bg-cyan-50/70 p-3.5 rounded-xl border border-cyan-200 space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-900 uppercase block">ONLINE MEETING LINK</span>
                <a
                  href={selectedInterview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-kth-primary-600 font-bold text-xs hover:underline break-all"
                >
                  <Video className="w-4 h-4 shrink-0" />
                  <span>{selectedInterview.meeting_link}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}

            {/* Phone Contact */}
            {selectedInterview.contact_phone && (
              <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-kth-slate-400 uppercase block">RECRUITER CONTACT NUMBER</span>
                <div className="font-mono text-sm font-semibold text-kth-slate-900 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-kth-primary-600" />
                  <span>{selectedInterview.contact_phone}</span>
                </div>
              </div>
            )}

            {/* Interviewer Info */}
            {(selectedInterview.interviewer_name || selectedInterview.interviewer_role) && (
              <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-kth-slate-400 uppercase block">INTERVIEWER / RECRUITER</span>
                <div className="font-semibold text-kth-slate-900">
                  {selectedInterview.interviewer_name || 'Hiring Manager'}
                  {selectedInterview.interviewer_role ? ` · ${selectedInterview.interviewer_role}` : ''}
                </div>
              </div>
            )}

            {/* Required Documents for Walk-in or In-person */}
            {selectedInterview.required_documents && selectedInterview.required_documents.length > 0 && (
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-2">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">MANDATORY DOCUMENTS TO BRING</span>
                <ul className="space-y-1 list-none pl-0">
                  {selectedInterview.required_documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-amber-950 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions & Notes */}
            {(selectedInterview.instructions || selectedInterview.notes) && (
              <div className="bg-kth-slate-50 p-3.5 rounded-xl border border-kth-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-kth-slate-400 uppercase block">CANDIDATE INSTRUCTIONS & NOTES</span>
                <p className="text-kth-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedInterview.instructions || selectedInterview.notes}
                </p>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              {selectedInterview.meeting_link && selectedInterview.status === 'scheduled' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Video className="w-3.5 h-3.5" />}
                  onClick={() => window.open(selectedInterview.meeting_link!, '_blank')}
                >
                  Join Meeting Call
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </CandidateShell>
  );
};
