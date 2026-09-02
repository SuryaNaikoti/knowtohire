import React, { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import {
  interviewService,
  applicationService,
  candidateDiscoveryService,
  JobApplication,
  DiscoverableCandidate,
  InterviewType,
} from '@/services';
import { navigateTo } from '@/utils/navigation';
import {
  ArrowLeft,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface EmployerScheduleInterviewPageProps {
  candidateId?: string;
  onNavigate?: (path: string) => void;
}

export const EmployerScheduleInterviewPage: React.FC<EmployerScheduleInterviewPageProps> = ({ candidateId: propCandidateId, onNavigate }) => {
  const rawUrlSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const pathId = typeof window !== 'undefined' ? window.location.pathname.split('/employer/schedule/')[1]?.split('?')[0] : undefined;
  const id = propCandidateId || pathId;
  const applicationIdParam = rawUrlSearch?.get('applicationId') || undefined;

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [candidate, setCandidate] = useState<DiscoverableCandidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('Technical Assessment & Domain Deep Dive');
  const [interviewType, setInterviewType] = useState<InterviewType>('technical_deep_dive');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/kth-interview');
  const [venueAddress, setVenueAddress] = useState('');
  const [interviewerName, setInterviewerName] = useState('Lead Enterprise Hiring Manager');
  const [contactPhone, setContactPhone] = useState('+91 80 4912 8000');
  const [instructions, setInstructions] = useState('Please review the technical and domain requirements before joining.');

  useEffect(() => {
    async function loadTarget() {
      if (applicationIdParam) {
        const appRes = await applicationService.getApplicationById(applicationIdParam);
        if (appRes.data) {
          setApplication(appRes.data);
          return;
        }
      }
      
      if (id) {
        // Try finding candidate applications or candidate profile
        const appsRes = await applicationService.getMyApplications();
        if (appsRes.data) {
          const matchApp = (appsRes.data as JobApplication[]).find(
            (a: JobApplication) => a.id === id || a.candidate_id === id || a.candidate?.id === id
          );
          if (matchApp) {
            setApplication(matchApp);
          }
        }
        const candRes = await candidateDiscoveryService.getCandidateById(id);
        if (candRes.data) {
          setCandidate(candRes.data);
        }
      }
    }
    loadTarget();
  }, [id, applicationIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!date) {
      setErrorMessage('Please select an interview schedule date.');
      return;
    }

    const scheduledStart = new Date(`${date}T${startTime}:00`).toISOString();
    const scheduledEnd = new Date(`${date}T${endTime}:00`).toISOString();

    if (new Date(scheduledEnd) <= new Date(scheduledStart)) {
      setErrorMessage('Interview end time must be later than start time.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const effectiveAppId = application?.id || 'app-demo-active';
    const effectiveJobId = application?.job_id || application?.job?.id || 'job-esg-lead';
    const effectiveCompanyId = application?.company_id || 'company-enterprise';
    const effectiveCandId = application?.candidate_id || candidate?.id || id || 'cand-1';

    const res = await interviewService.scheduleInterview({
      application_id: effectiveAppId,
      job_id: effectiveJobId,
      company_id: effectiveCompanyId,
      candidate_id: effectiveCandId,
      title: title.trim(),
      interview_type: interviewType,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      meeting_link: (interviewType === 'video' || interviewType === 'technical_deep_dive' || interviewType === 'external') ? meetingLink.trim() : undefined,
      location: (interviewType === 'on_site' || interviewType === 'walk_in') ? venueAddress.trim() : undefined,
      venue_address: (interviewType === 'on_site' || interviewType === 'walk_in') ? venueAddress.trim() : undefined,
      interviewer_name: interviewerName.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
      instructions: instructions.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error.message);
    } else {
      if (application) {
        await applicationService.updateApplicationStage(application.id, 'interview');
      }
      setSuccessMessage('Interview successfully scheduled and calendar briefing dispatched to candidate.');
      setTimeout(() => {
        handleBack();
      }, 800);
    }
  };

  const handleBack = () => {
    let target = '/employer/pipeline';
    if (applicationIdParam) {
      target = `/employer/applications/${applicationIdParam}`;
    } else if (id) {
      target = `/employer/candidates/${id}`;
    }

    if (onNavigate) {
      onNavigate(target);
    } else {
      navigateTo(target);
    }
  };

  const candidateDisplayName =
    candidate?.name ||
    application?.candidate?.full_name ||
    (application?.candidate_snapshot as Record<string, string>)?.full_name ||
    'Selected Candidate';

  const positionTitle =
    application?.job?.title ||
    candidate?.headline ||
    'Enterprise Requisition';

  return (
    <EmployerShell title="Schedule Candidate Interview" currentPath="/employer/candidates">
      <div className="space-y-6 max-w-4xl mx-auto font-sans">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Candidate Dossier</span>
          </button>
        </div>

        {errorMessage && (
          <Alert variant="error" title="Scheduling Error">
            <div className="flex items-start gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          </Alert>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Hero Context Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Official Interview Dispatch
              </span>
              <span className="text-xs text-slate-300 font-medium">{positionTitle}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{candidateDisplayName}</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-cyan-300" />
          </div>
        </div>

        {/* Schedule Form Card */}
        <Card className="p-6 sm:p-8 bg-white border-kth-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Interview Round Title *"
              placeholder="e.g. Technical Assessment & Domain Deep Dive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Interview Format"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                options={[
                  { value: 'technical_deep_dive', label: 'Technical Assessment Round' },
                  { value: 'video', label: 'Video Interview (Google Meet / Zoom)' },
                  { value: 'hr_screening', label: 'HR Talent Screening Call' },
                  { value: 'on_site', label: 'On-site Enterprise Office Interview' },
                  { value: 'walk_in', label: 'Walk-in Interview Drive' },
                  { value: 'case_study', label: 'Case Study & Presentation' },
                  { value: 'executive_review', label: 'Executive Panel Review' },
                ]}
              />

              <Input
                label="Scheduled Date *"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Time *"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />

              <Input
                label="End Time *"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            {(interviewType === 'video' || interviewType === 'technical_deep_dive' || interviewType === 'external' || interviewType === 'case_study') && (
              <Input
                label="Meeting Video Call URL"
                placeholder="https://meet.google.com/kth-interview"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            )}

            {(interviewType === 'on_site' || interviewType === 'walk_in' || interviewType === 'executive_review') && (
              <Input
                label="Venue Address & Corporate Office"
                placeholder="e.g. KnowToHire Tech Park, 4th Floor, Electronic City, Bengaluru"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Interviewer Name"
                placeholder="e.g. S. Sharma, Lead Architect"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
              />

              <Input
                label="Recruiter Contact Number"
                placeholder="+91 80 4912 8000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-kth-slate-700">
                Preparation Instructions & Briefing Notes for Candidate
              </label>
              <textarea
                rows={4}
                placeholder="Specify presentation expectations, technical environment, statutory standards, or materials the candidate should review..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-kth-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Send className="w-4 h-4" />}
                isLoading={isSubmitting}
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold"
              >
                Confirm & Dispatch Interview Schedule
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </EmployerShell>
  );
};
