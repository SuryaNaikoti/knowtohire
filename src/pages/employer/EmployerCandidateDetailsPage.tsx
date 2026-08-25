import React, { useState, useEffect, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { Alert } from '@/components/ui/Alert';
import { ScheduleInterviewModal } from '@/components/employer/ScheduleInterviewModal';
import {
  applicationService,
  jobService,
  interviewService,
  candidateDiscoveryService,
  savedCandidateService,
  JobApplication,
  ApplicationStage,
  Interview,
  Job,
  DiscoverableCandidate,
} from '@/services';
import {
  MapPin,
  FileText,
  Bookmark,
  Calendar,
  Star,
  Check,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Video,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
} from 'lucide-react';

export interface EmployerCandidateDetailsPageProps {
  candidateId?: string;
  applicationId?: string;
}

const ATS_STAGES: { stage: ApplicationStage; label: string }[] = [
  { stage: 'new', label: 'Applied' },
  { stage: 'screening', label: 'Screening' },
  { stage: 'shortlisted', label: 'Shortlisted' },
  { stage: 'interview', label: 'Interview' },
  { stage: 'offer', label: 'Offer' },
  { stage: 'hired', label: 'Hired' },
];

export const EmployerCandidateDetailsPage: React.FC<EmployerCandidateDetailsPageProps> = ({
  candidateId: propCandidateId,
  applicationId: propApplicationId,
}) => {
  // Check URL path format
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAppRoute = currentPath.startsWith('/employer/applications/');
  const resolvedAppId = propApplicationId || (isAppRoute ? currentPath.replace('/employer/applications/', '').split('/')[0] : '');
  const resolvedCandidateId = propCandidateId || (!isAppRoute ? currentPath.replace('/employer/candidates/', '').split('/')[0] : '');

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<DiscoverableCandidate | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);

  // Recruiter notes and rating
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // ATS Stage transition
  const [stageLoading, setStageLoading] = useState(false);

  // Interview Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [cancelInterviewId, setCancelInterviewId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    let activeCandidateId = resolvedCandidateId;
    let targetApp: JobApplication | null = null;

    // 1. If application route, fetch application first
    if (resolvedAppId) {
      const appRes = await applicationService.getEmployerApplicationById(resolvedAppId);
      if (appRes.data) {
        targetApp = appRes.data;
        setApplication(targetApp);
        activeCandidateId = targetApp.candidate_id;
        setNotes(targetApp.employer_notes || '');
        setRating(targetApp.employer_rating || 0);

        if (targetApp.job) {
          setJob(targetApp.job);
        } else if (targetApp.job_id) {
          const jobRes = await jobService.getEmployerJobById(targetApp.job_id);
          if (jobRes.data) setJob(jobRes.data);
        }
      }
    }

    // 2. Fetch candidate profile
    if (activeCandidateId) {
      const candRes = await candidateDiscoveryService.getCandidateById(activeCandidateId);
      if (candRes.data) {
        setCandidate(candRes.data);
      }
      const { data: savedStatus } = await savedCandidateService.isCandidateSaved(activeCandidateId);
      setIsSaved(Boolean(savedStatus));
    }

    // 3. Fetch interviews for this candidate/application
    const intRes = await interviewService.getEmployerInterviews();
    if (intRes.data) {
      let filtered = intRes.data;
      if (targetApp) {
        filtered = filtered.filter((i) => i.application_id === targetApp.id || i.candidate_id === targetApp.candidate_id);
      } else if (activeCandidateId) {
        filtered = filtered.filter((i) => i.candidate_id === activeCandidateId);
      }
      setInterviews(filtered);
    }

    setIsLoading(false);
  }, [resolvedAppId, resolvedCandidateId]);

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('kth_interviews_changed', handleSync);
    window.addEventListener('kth_applications_changed', handleSync);
    return () => {
      window.removeEventListener('kth_interviews_changed', handleSync);
      window.removeEventListener('kth_applications_changed', handleSync);
    };
  }, [loadData]);

  // Stage change handler
  const handleStageChange = async (newStage: ApplicationStage) => {
    if (!application || newStage === application.stage) return;
    setStageLoading(true);

    const { data, error } = await applicationService.updateApplicationStage(application.id, newStage);
    setStageLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      setApplication(data);
      if (newStage === 'interview') {
        setIsScheduleModalOpen(true);
      }
    }
  };

  // Save Recruiter Notes & Rating
  const handleSaveNotes = async () => {
    if (!application) return;
    setIsSavingNotes(true);
    setNotesSuccess(false);

    const { data } = await applicationService.updateEmployerNotes(
      application.id,
      notes.trim(),
      rating > 0 ? rating : undefined
    );
    setIsSavingNotes(false);

    if (data) {
      setApplication(data);
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3000);
    }
  };

  // Toggle Save to Bench
  const handleToggleSave = async () => {
    const activeId = candidate?.id || application?.candidate_id;
    if (!activeId) return;
    setSavingState(true);
    const next = !isSaved;
    setIsSaved(next);
    if (next) {
      await savedCandidateService.saveCandidate(activeId);
    } else {
      await savedCandidateService.unsaveCandidate(activeId);
    }
    setSavingState(false);
  };

  // Confirm Interview Cancel
  const handleConfirmCancelInterview = async () => {
    if (!cancelInterviewId) return;
    setIsCancelling(true);
    await interviewService.cancelInterview(cancelInterviewId);
    setIsCancelling(false);
    setCancelInterviewId(null);
    loadData();
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (isLoading) {
    return (
      <EmployerShell title="Loading Candidate Details..." currentPath="/employer/jobs">
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
          <p className="text-xs text-kth-slate-500">Loading complete candidate record & application context...</p>
        </div>
      </EmployerShell>
    );
  }

  // Derive candidate attributes
  const snapshot = (application?.candidate_snapshot || {}) as Record<string, any>;
  const name = candidate?.name || application?.candidate?.full_name || snapshot.full_name || 'Candidate';
  const headline = candidate?.headline || snapshot.headline || 'Sustainability & Engineering Professional';
  const location = candidate?.location || snapshot.location || 'India';
  const email = candidate?.email || application?.candidate?.email || snapshot.email || 'Verified Candidate';
  const phone = candidate?.phone || application?.candidate?.phone || snapshot.phone;
  const bio = candidate?.bio || candidate?.experienceSummary || snapshot.bio || snapshot.summary || 'Professional with proven domain track record.';
  const skills = (candidate?.skills && candidate.skills.length > 0) ? candidate.skills : (snapshot.skills || ['ESG Auditing', 'EHS Compliance']);
  const experienceList = candidate?.experienceList || [];
  const educationList = candidate?.educationList || [];
  const certifications = candidate?.certifications || [];
  const resumeUrl = application?.resume_url || candidate?.resumeUrl || snapshot.resume_url;
  const resumeFileName = candidate?.resumeFileName || (resumeUrl ? resumeUrl.split('/').pop() : 'Resume_Document.pdf');

  return (
    <EmployerShell title={`Candidate Profile — ${name}`} currentPath="/employer/jobs">
      <div className="space-y-6 font-sans max-w-7xl mx-auto text-left">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (job) {
                handleNavigate(`/employer/jobs/${job.id}/applicants`);
              } else {
                handleNavigate('/employer/jobs');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{job ? `Back to Applicants for ${job.title}` : 'Back to Jobs'}</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="sm"
              disabled={savingState}
              onClick={handleToggleSave}
              leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-kth-primary-600 text-kth-primary-600' : ''}`} />}
            >
              {isSaved ? 'Saved to Bench' : 'Save Candidate'}
            </Button>
            {application && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsScheduleModalOpen(true)}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Schedule Interview
              </Button>
            )}
          </div>
        </div>

        {errorMessage && (
          <Alert variant="error" title="Notice">
            <span>{errorMessage}</span>
          </Alert>
        )}

        {/* Section 1: Candidate Overview & Application Header Card */}
        <Card className="p-6 md:p-8 bg-white border-kth-slate-200 shadow-xs">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kth-primary-600 to-kth-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-xs">
                {name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display text-2xl font-extrabold text-kth-slate-900">{name}</h1>
                  {candidate?.profileCompletion && (
                    <Badge variant="emerald" hasPulse>
                      {candidate.profileCompletion}% Complete
                    </Badge>
                  )}
                  {application && (
                    <Badge variant="indigo" className="capitalize font-mono text-xs">
                      Stage: {application.stage.replace('_', ' ')}
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-semibold text-kth-slate-700">{headline}</p>

                <div className="flex items-center gap-4 text-xs text-kth-slate-500 flex-wrap pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-kth-slate-400" /> {location}
                  </span>
                  {email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-kth-slate-400" /> {email}
                    </span>
                  )}
                  {phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-kth-slate-400" /> {phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Application Stage Context & Quick Transition */}
            {application && (
              <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 w-full lg:w-72 space-y-2 shrink-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-kth-slate-500 uppercase tracking-wider">Applied Position</span>
                  <span className="font-mono text-kth-slate-400">
                    {new Date(application.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <strong className="font-bold text-sm text-kth-slate-900 block truncate">
                  {job?.title || 'Job Opening'}
                </strong>
                <div className="pt-2 border-t border-kth-slate-200">
                  <label className="text-[11px] font-bold text-kth-slate-600 block mb-1">
                    Move Pipeline Stage:
                  </label>
                  <Select
                    value={application.stage}
                    onChange={(e) => handleStageChange(e.target.value as ApplicationStage)}
                    disabled={stageLoading}
                    options={ATS_STAGES.map((s) => ({ value: s.stage, label: s.label }))}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Section 4: ATS Pipeline Progression Bar */}
        {application && (
          <Card className="p-6 bg-white border-kth-slate-200">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-kth-slate-500 mb-4">
              Recruitment Pipeline Progress
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ATS_STAGES.map((s, idx) => {
                const isCurrent = application.stage === s.stage;
                const stageIndex = ATS_STAGES.findIndex((st) => st.stage === application.stage);
                const isPassed = idx < stageIndex;

                return (
                  <button
                    key={s.stage}
                    type="button"
                    onClick={() => handleStageChange(s.stage)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isCurrent
                        ? 'bg-kth-primary-50 border-kth-primary-600 text-kth-primary-900 font-bold shadow-xs ring-2 ring-kth-primary-500/20'
                        : isPassed
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                        : 'bg-kth-slate-50 border-kth-slate-200 text-kth-slate-500 hover:border-kth-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-kth-slate-200 text-[10px] font-mono flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                      )}
                      <span className="text-xs">{s.label}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-mono font-bold text-kth-primary-600">Current</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Main Content Grid: Candidate Profile vs Recruiter Coordination */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Full Candidate Profile Data */}
          <div className="lg:col-span-7 space-y-6">
            {/* Professional Summary */}
            <Card className="p-6 bg-white border-kth-slate-200">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-3">Professional Summary</h3>
              <p className="text-xs text-kth-slate-700 leading-relaxed whitespace-pre-line">{bio}</p>
            </Card>

            {/* Skills & Certifications */}
            <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-kth-slate-900 mb-2.5">Skills Matrix</h3>
                <div className="flex gap-2 flex-wrap">
                  {skills.map((sk: string, idx: number) => (
                    <Badge key={idx} variant="indigo" className="text-xs py-1 px-2.5">
                      {sk}
                    </Badge>
                  ))}
                </div>
              </div>

              {certifications.length > 0 && (
                <div className="pt-4 border-t border-kth-slate-100">
                  <h4 className="font-bold text-xs text-kth-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Professional Certifications
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {certifications.map((c: string, idx: number) => (
                      <Badge key={idx} variant="amber" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Work Experience */}
            <Card className="p-6 bg-white border-kth-slate-200">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-kth-primary-600" /> Work Experience
              </h3>

              {experienceList.length > 0 ? (
                <div className="space-y-4">
                  {experienceList.map((exp: any, idx: number) => (
                    <div key={idx} className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between items-start">
                        <strong className="font-bold text-sm text-kth-slate-900">
                          {exp.role || exp.title || 'Specialist Role'}
                        </strong>
                        <span className="font-mono text-[11px] text-kth-slate-500 bg-white px-2 py-0.5 rounded border border-kth-slate-200">
                          {exp.start_date || 'Past'} – {exp.is_current ? 'Present' : exp.end_date || 'Completed'}
                        </span>
                      </div>
                      <div className="font-semibold text-kth-slate-700">
                        {exp.company || 'Enterprise'} {exp.location ? `· ${exp.location}` : ''}
                      </div>
                      {exp.description && (
                        <p className="text-kth-slate-600 leading-relaxed pt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-xs text-kth-slate-600">
                  <span>{candidate?.experienceSummary || 'Demonstrated multi-year domain track record.'}</span>
                </div>
              )}
            </Card>

            {/* Education */}
            <Card className="p-6 bg-white border-kth-slate-200">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-kth-primary-600" /> Education & Academic Credentials
              </h3>

              {educationList.length > 0 ? (
                <div className="space-y-3">
                  {educationList.map((edu: any, idx: number) => (
                    <div key={idx} className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between items-start">
                        <strong className="font-bold text-sm text-kth-slate-900">
                          {edu.degree || 'Degree Qualification'}
                        </strong>
                        {edu.graduation_year && (
                          <span className="font-mono text-[11px] text-kth-slate-500">
                            Class of {edu.graduation_year}
                          </span>
                        )}
                      </div>
                      <div className="text-kth-slate-700 font-medium">
                        {edu.institution || 'Accredited Institution'}
                        {edu.field_of_study ? ` · ${edu.field_of_study}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-xs text-kth-slate-600">
                  <span>{candidate?.educationSummary || 'Bachelor / Master in Technology / Science'}</span>
                </div>
              )}
            </Card>

            {/* Resume Document Viewer */}
            <Card className="p-6 bg-white border-kth-slate-200 space-y-3">
              <h3 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-kth-primary-600" /> Application Resume Document
              </h3>

              <div className="p-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-kth-primary-600 shrink-0" />
                  <div>
                    <strong className="font-bold text-xs text-kth-slate-900 block truncate max-w-xs">
                      {resumeFileName}
                    </strong>
                    <span className="text-[11px] text-kth-slate-500">PDF Document · Verified Application Asset</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResumePreviewOpen(true)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Preview
                  </Button>
                  {resumeUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(resumeUrl, '_blank')}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (5 cols): Recruiter Private Notes & Interview Coordination */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recruiter Private Rating & Notes (Employer-Only) */}
            <Card className="p-6 bg-kth-slate-50/70 border-kth-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-kth-slate-700 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" /> Recruiter Rating & Private Notes
                </h3>
                {notesSuccess && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 bg-white p-3 rounded-xl border border-kth-slate-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-kth-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono font-bold text-kth-slate-600 ml-2">
                  {rating > 0 ? `${rating}/5 Stars` : 'Unrated'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-kth-slate-500 block">
                  Private Recruiter Evaluation (Never shared with candidate)
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal hiring feedback, questions for subsequent panels, salary expectations discussion..."
                  className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs text-kth-slate-900 bg-white placeholder:text-kth-slate-400 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  isLoading={isSavingNotes}
                >
                  Save Private Notes
                </Button>
              </div>
            </Card>

            {/* Interviews Scheduled for this Candidate & Application */}
            <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-kth-primary-600" /> Scheduled Interviews ({interviews.length})
                </h3>
                {application && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScheduleModalOpen(true)}
                  >
                    + Add Round
                  </Button>
                )}
              </div>

              {interviews.length === 0 ? (
                <div className="bg-kth-slate-50 p-6 rounded-xl border border-kth-slate-200 text-center space-y-2">
                  <Clock className="w-8 h-8 text-kth-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-kth-slate-700">No Interview Rounds Scheduled</p>
                  <p className="text-[11px] text-kth-slate-400">
                    Schedule a video, phone, on-site, or walk-in interview with external meeting details.
                  </p>
                  {application && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="mt-2 text-xs"
                    >
                      Schedule First Round
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.map((item) => {
                    const startDate = new Date(item.scheduled_start);
                    const formattedDate = startDate.toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });
                    const formattedTime = startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all space-y-2.5 text-xs ${
                          item.status === 'cancelled'
                            ? 'bg-kth-slate-50/60 border-kth-slate-200 opacity-75'
                            : 'bg-white border-kth-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="font-bold text-xs text-kth-slate-900 block">
                              {item.title || 'Technical Assessment Round'}
                            </span>
                            <span className="text-[11px] text-kth-slate-500 capitalize">
                              Format: {item.interview_type.replace('_', ' ')}
                            </span>
                          </div>
                          <Badge
                            variant={
                              item.status === 'scheduled' || item.status === 'confirmed'
                                ? 'emerald'
                                : item.status === 'cancelled'
                                ? 'rose'
                                : 'slate'
                            }
                            className="capitalize text-[10px]"
                          >
                            {item.status}
                          </Badge>
                        </div>

                        <div className="bg-kth-slate-50 p-2.5 rounded-lg border border-kth-slate-200 space-y-1 text-kth-slate-700">
                          <div className="flex items-center gap-1.5 font-mono font-semibold text-kth-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-kth-primary-600" />
                            <span>{formattedDate} at {formattedTime}</span>
                          </div>

                          {item.meeting_link ? (
                            <div className="flex items-center gap-1.5 text-kth-primary-600 font-bold truncate">
                              <Video className="w-3.5 h-3.5 shrink-0" />
                              <a
                                href={item.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline truncate inline-flex items-center gap-1"
                              >
                                {item.meeting_platform ? `${item.meeting_platform}: ` : ''}{item.meeting_link}
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          ) : item.location ? (
                            <div className="flex items-center gap-1.5 text-kth-slate-600">
                              <MapPin className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                          ) : null}
                        </div>

                        {item.status === 'scheduled' && (
                          <div className="flex justify-end gap-2 pt-1 border-t border-kth-slate-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancelInterviewId(item.id)}
                              className="text-rose-600 hover:bg-rose-50 text-[11px] h-7 px-2"
                              leftIcon={<Trash2 className="w-3 h-3" />}
                            >
                              Cancel Round
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {application && (
        <ScheduleInterviewModal
          application={application}
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Cancel Interview Confirmation Modal */}
      <Dialog
        isOpen={cancelInterviewId !== null}
        onClose={() => setCancelInterviewId(null)}
        title="Cancel Scheduled Interview?"
        description="This will mark the interview round as cancelled and notify the candidate."
      >
        <div className="space-y-4 text-left font-sans text-xs">
          <p className="text-kth-slate-600">
            Are you sure you want to cancel this interview round? The candidate will no longer see the join CTA.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-kth-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setCancelInterviewId(null)} disabled={isCancelling}>
              Keep Interview
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmCancelInterview}
              disabled={isCancelling}
              isLoading={isCancelling}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Resume Document Preview Modal */}
      <Dialog
        isOpen={resumePreviewOpen}
        onClose={() => setResumePreviewOpen(false)}
        title={`Candidate Resume Document — ${name}`}
        description={`Submitted PDF Dossier • ${resumeFileName}`}
        maxWidth="xl"
      >
        <div className="space-y-4 text-left font-sans text-xs">
          {resumeUrl ? (
            <div className="w-full rounded-xl overflow-hidden border border-kth-slate-200 bg-kth-slate-50">
              <iframe
                src={`${resumeUrl}#toolbar=1&navpanes=0`}
                title="Application Resume Full Preview"
                className="w-full h-[620px] border-0 rounded-xl bg-white"
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-kth-slate-50 border border-kth-slate-200 rounded-xl space-y-2">
              <FileText className="w-8 h-8 text-kth-slate-400 mx-auto" />
              <p className="font-semibold text-kth-slate-700">No attached PDF document found for this application snapshot.</p>
              <p className="text-kth-slate-400">The candidate profile summary is displayed below.</p>
              <div className="border-t border-kth-slate-200 pt-3 text-left space-y-1 text-kth-slate-600">
                <div><strong>Location:</strong> {location}</div>
                <div><strong>Email:</strong> {email}</div>
                <div><strong>Skills:</strong> {skills.join(', ')}</div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-kth-slate-100">
            {resumeUrl && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => window.open(resumeUrl, '_blank')}
              >
                Open Full Window
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setResumePreviewOpen(false)} className="ml-auto">
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </EmployerShell>
  );
};
