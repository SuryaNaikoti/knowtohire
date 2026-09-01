import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { interviewService, Interview, InterviewType, InterviewStatus } from '@/services/interviewService';
import {
  ArrowLeft,
  Calendar,
  Video,
  MapPin,
  Building2,
  Phone,
  ExternalLink,
  Navigation,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Briefcase,
  User,
  FileCheck,
} from 'lucide-react';

interface CandidateInterviewDetailsPageProps {
  interviewId?: string;
  onNavigate?: (path: string) => void;
}

function isValidUrl(urlString?: string | null): boolean {
  if (!urlString) return false;
  try {
    const url = new URL(urlString.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const CandidateInterviewDetailsPage: React.FC<CandidateInterviewDetailsPageProps> = ({ interviewId: propId, onNavigate }) => {
  const routerParams = useParams<{ id: string }>();
  const id = propId || routerParams.id || (typeof window !== 'undefined' ? window.location.pathname.split('/candidate/interviews/')[1] : undefined);
  const navigate = useNavigate();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      interviewService.getInterviewById(id).then((res) => {
        if (res.data) {
          setInterview(res.data);
        } else {
          setError(res.error?.message || 'Interview schedule record not found.');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setError('Invalid or missing Interview ID.');
    }
  }, [id]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/candidate/interviews');
    } else {
      navigate('/candidate/interviews');
    }
  };

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

  const formatSchedule = (i: Interview) => {
    if (i.interview_type === 'walk_in' && (i.date_from || i.date_to)) {
      const fromStr = i.date_from ? new Date(i.date_from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
      const toStr = i.date_to ? new Date(i.date_to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const windowStr = i.time_window ? ` · ${i.time_window}` : '';
      return `${fromStr}${toStr ? ` – ${toStr}` : ''}${windowStr}`;
    }

    const startDate = new Date(i.scheduled_start);
    const dateStr = startDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = startDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <CandidateShell title="Interview Briefing & Schedule" currentPath="/candidate/interviews">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Interviews</span>
          </button>
          <span className="text-xs font-mono text-kth-slate-400">Interview ID: {id}</span>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <Card className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Retrieving interview schedule credentials...</p>
          </Card>
        ) : interview ? (
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={getInterviewTypeMeta(interview.interview_type, interview.meeting_platform).variant}>
                    {getInterviewTypeMeta(interview.interview_type, interview.meeting_platform).label}
                  </Badge>
                  {interview.round_name && (
                    <span className="text-xs text-slate-300 font-mono font-semibold">
                      {interview.round_name}
                    </span>
                  )}
                </div>
                {getStatusBadge(interview.status)}
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {interview.title || 'Official Technical & Fit Interview'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  {interview.company?.name || 'Recruiting Enterprise'} • Position: {interview.job?.title || 'Open Requisition'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/80 flex items-center gap-2 text-xs font-mono text-cyan-300">
                <Calendar className="w-4 h-4" />
                <span>{formatSchedule(interview)}</span>
              </div>
            </div>

            {/* Video Meeting Call Direct Link */}
            {interview.meeting_link && isValidUrl(interview.meeting_link) && (
              <Card className="p-6 bg-gradient-to-r from-cyan-50 to-indigo-50/50 border-cyan-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-cyan-900 uppercase tracking-wider block">
                    {interview.meeting_platform ? `${interview.meeting_platform} Session Link` : 'Online Video Room'}
                  </span>
                  <p className="text-xs text-slate-700 font-mono break-all">{interview.meeting_link}</p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold text-xs shrink-0 shadow-xs"
                  leftIcon={<Video className="w-4 h-4" />}
                  onClick={() => window.open(interview.meeting_link!, '_blank')}
                >
                  Join Meeting Call
                </Button>
              </Card>
            )}

            {/* Logistics & Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(interview.venue_address || interview.location) && (
                <Card className="p-6 space-y-3 bg-white border-kth-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-kth-slate-100 pb-3">
                    <MapPin className="w-4 h-4 text-kth-primary-600" />
                    Venue Location & Coordinates
                  </h3>
                  <p className="text-xs text-kth-slate-700 leading-relaxed font-normal">
                    {interview.venue_address || interview.location}
                  </p>
                  {interview.map_url && (
                    <a
                      href={interview.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-kth-primary-600 hover:underline pt-2"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open Google Maps Driving Directions</span>
                    </a>
                  )}
                </Card>
              )}

              {(interview.interviewer_name || interview.contact_phone) && (
                <Card className="p-6 space-y-3 bg-white border-kth-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-kth-slate-100 pb-3">
                    <User className="w-4 h-4 text-kth-primary-600" />
                    Interviewer & Recruiter Contact
                  </h3>
                  {interview.interviewer_name && (
                    <div className="text-xs">
                      <span className="text-kth-slate-500 block text-[11px]">Interviewer</span>
                      <strong className="text-kth-slate-900">{interview.interviewer_name}</strong>
                      {interview.interviewer_role && <span className="text-kth-slate-600"> · {interview.interviewer_role}</span>}
                    </div>
                  )}
                  {interview.contact_phone && (
                    <div className="text-xs pt-1">
                      <span className="text-kth-slate-500 block text-[11px]">Direct Recruiter Helpline</span>
                      <span className="font-mono font-bold text-kth-slate-900 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-kth-primary-600" />
                        {interview.contact_phone}
                      </span>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Mandatory Documentation Checklist */}
            {interview.required_documents && interview.required_documents.length > 0 && (
              <Card className="p-6 space-y-3 bg-amber-50/60 border-amber-200 shadow-sm">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2 border-b border-amber-200/80 pb-3">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  Mandatory Documents to Carry / Present
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950 font-medium list-none pl-0">
                  {interview.required_documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Candidate Instructions & Briefing Notes */}
            {(interview.instructions || interview.notes) && (
              <Card className="p-6 space-y-3 bg-white border-kth-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-kth-slate-100 pb-3">
                  <Briefcase className="w-4 h-4 text-kth-primary-600" />
                  Candidate Briefing & Preparation Notes
                </h3>
                <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200 text-xs text-kth-slate-700 whitespace-pre-line leading-relaxed">
                  {interview.instructions || interview.notes}
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </CandidateShell>
  );
};
