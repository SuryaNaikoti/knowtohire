import React, { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import {
  applicationService,
  savedCandidateService,
  resumeService,
  JobApplication,
  ApplicationStage,
  DiscoverableCandidate,
  CandidateExperienceItem,
  CandidateEducationItem,
} from '@/services';
import { EmployerCandidate } from '@/data/employerMockData';
import {
  MapPin,
  FileText,
  Bookmark,
  Calendar,
  Star,
  Check,
  ExternalLink,
  Download,
  ArrowRight,
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface CandidateQuickViewProps {
  application?: JobApplication | null;
  candidate?: DiscoverableCandidate | EmployerCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationUpdated?: (updatedApp: JobApplication) => void;
}

export const CandidateQuickView: React.FC<CandidateQuickViewProps> = ({
  application,
  candidate,
  isOpen,
  onClose,
  onApplicationUpdated,
}) => {
  const [currentApp, setCurrentApp] = useState<JobApplication | null>(application || null);
  const [stageLoading, setStageLoading] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // Recruiter notes and rating state
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  useEffect(() => {
    setCurrentApp(application || null);
    if (application?.employer_notes) {
      setNotes(application.employer_notes);
    } else {
      setNotes('');
    }
    if (application?.employer_rating) {
      setRating(application.employer_rating);
    } else {
      setRating(0);
    }
    setIsBioExpanded(false);

    // Check saved state
    const targetId = application?.candidate_id || candidate?.id;
    if (targetId) {
      savedCandidateService.isCandidateSaved(targetId).then((res) => {
        setIsSaved(Boolean(res.data));
      });
    }
  }, [application, candidate, isOpen]);

  // Candidate Data Resolution from Canonical Entities
  const snapshot = (currentApp?.candidate_snapshot || {}) as Record<string, any>;
  const discCand = candidate as DiscoverableCandidate | undefined;
  const legacyCand = candidate as EmployerCandidate | undefined;

  const candidateId = currentApp?.candidate_id || candidate?.id || '';

  const candidateName =
    currentApp?.candidate?.full_name ||
    snapshot.full_name ||
    discCand?.name ||
    legacyCand?.name ||
    'Candidate';

  const candidateEmail =
    currentApp?.candidate?.email ||
    snapshot.email ||
    discCand?.email ||
    '';

  const candidateHeadline =
    snapshot.headline ||
    discCand?.headline ||
    legacyCand?.title ||
    '';

  const candidateLocation =
    snapshot.location ||
    discCand?.location ||
    legacyCand?.location ||
    '—';

  const candidateSkills: string[] = Array.isArray(snapshot.skills) && snapshot.skills.length > 0
    ? snapshot.skills
    : Array.isArray(discCand?.skills) && discCand.skills.length > 0
    ? discCand.skills
    : legacyCand?.skills || [];

  const candidateBio =
    snapshot.bio ||
    snapshot.summary ||
    discCand?.bio ||
    discCand?.experienceSummary ||
    legacyCand?.summary ||
    'No professional summary available.';

  // Snapshot Attributes
  const profileCompletion =
    typeof discCand?.profileCompletion === 'number'
      ? discCand.profileCompletion
      : typeof legacyCand?.matchScore === 'number'
      ? legacyCand.matchScore
      : undefined;

  const experienceYears =
    typeof discCand?.experienceYears === 'number'
      ? discCand.experienceYears
      : typeof legacyCand?.experienceYears === 'number'
      ? legacyCand.experienceYears
      : undefined;

  const domain =
    discCand?.domain ||
    (snapshot.domain_specialization as string) ||
    '—';

  const educationText =
    discCand?.educationSummary ||
    legacyCand?.education ||
    (Array.isArray(discCand?.educationList) && discCand.educationList.length > 0
      ? `${(discCand.educationList[0] as CandidateEducationItem).degree || 'Degree'} · ${(discCand.educationList[0] as CandidateEducationItem).institution || 'University'}`
      : 'Graduate Degree');

  const expectedSalaryFormatted = discCand?.expectedSalaryINR
    ? `₹${(discCand.expectedSalaryINR / 100000).toFixed(1)}L/yr`
    : legacyCand?.salaryExpectationINR || 'Not specified';

  const noticePeriodFormatted = discCand?.noticePeriodDays !== undefined
    ? discCand.noticePeriodDays === 0
      ? 'Immediate (0 Days)'
      : `${discCand.noticePeriodDays} Days`
    : legacyCand?.availability || 'Not specified';

  const workModeText =
    discCand?.workModePreference ||
    (snapshot.work_mode_preference as string) ||
    (snapshot.remote_preference as string) ||
    'Not specified';

  // Key Strengths: Top 4-5 core competencies derived from verified skills and certifications
  const keyStrengths: string[] = Array.from(
    new Set([
      ...candidateSkills.slice(0, 4),
      ...(discCand?.certifications || []),
      ...(legacyCand?.certifications || []),
    ])
  ).slice(0, 5);

  // Relevant Experience Timeline
  const experienceItems: CandidateExperienceItem[] =
    Array.isArray(discCand?.experienceList) && discCand.experienceList.length > 0
      ? discCand.experienceList
      : [];

  // Resume Document Resolution
  let rawResume = currentApp?.resume_url || snapshot.resume_url || discCand?.resumeUrl;
  if (!rawResume || rawResume.includes('knowtohire.com/resumes')) {
    const fallbackId = candidateId || '00000000-0000-0000-0000-000000000001';
    const stored = resumeService.getStoredDemoResume(fallbackId);
    if (stored?.url) {
      rawResume = stored.url;
    }
  }
  const candidateResume = rawResume;
  const resumeFileName = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;

  const handleDownloadResume = () => {
    if (!candidateResume) return;
    if (candidateResume.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = candidateResume;
      link.download = resumeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(candidateResume, '_blank');
    }
  };

  const currentStage: ApplicationStage = currentApp?.stage || 'new';

  // Stage advancement
  const handleStageChange = async (newStage: ApplicationStage) => {
    if (!currentApp || newStage === currentApp.stage) return;
    setStageLoading(true);

    const { data } = await applicationService.updateApplicationStage(currentApp.id, newStage);
    setStageLoading(false);

    if (data) {
      setCurrentApp(data);
      onApplicationUpdated?.(data);
    }
  };

  // Save Recruiter Notes & Rating
  const handleSaveNotes = async () => {
    if (!currentApp) return;
    setIsSavingNotes(true);
    setNotesSuccess(false);

    const { data } = await applicationService.updateEmployerNotes(
      currentApp.id,
      notes.trim(),
      rating > 0 ? rating : undefined
    );
    setIsSavingNotes(false);

    if (data) {
      setCurrentApp(data);
      setNotesSuccess(true);
      onApplicationUpdated?.(data);
      setTimeout(() => setNotesSuccess(false), 3000);
    }
  };

  // Save/Unsave Candidate to Bench
  const handleToggleSaveCandidate = async () => {
    if (!candidateId) return;

    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    if (nextSavedState) {
      await savedCandidateService.saveCandidate(candidateId);
    } else {
      await savedCandidateService.unsaveCandidate(candidateId);
    }
  };

  const handleNavigateToFullProfile = () => {
    onClose();
    if (currentApp) {
      window.history.pushState({}, '', `/employer/applications/${currentApp.id}`);
    } else if (candidateId) {
      window.history.pushState({}, '', `/employer/candidates/${candidateId}`);
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getStageVariant = (st: ApplicationStage): 'indigo' | 'cyan' | 'emerald' | 'slate' => {
    switch (st) {
      case 'new': return 'indigo';
      case 'screening': return 'cyan';
      case 'shortlisted': return 'emerald';
      case 'interview': return 'indigo';
      case 'offer': return 'emerald';
      case 'hired': return 'emerald';
      default: return 'slate';
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={`Candidate Quick View — ${candidateName}`}
        width="max-w-xl sm:max-w-2xl"
      >
        <div className="space-y-6 font-sans text-left">
          {/* Section 1: Candidate Identity Header */}
          <div className="flex items-start gap-4 pb-4 border-b border-kth-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-kth-primary-600 to-indigo-900 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
              {candidateName
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-display font-bold text-lg text-kth-slate-900 truncate">
                  {candidateName}
                </h3>
                {currentApp && (
                  <Badge variant={getStageVariant(currentStage)} className="capitalize text-xs font-semibold">
                    {currentStage.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-semibold text-kth-slate-700 mb-1.5">{candidateHeadline}</p>
              <div className="flex items-center gap-4 text-xs text-kth-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-kth-slate-400" /> {candidateLocation}
                </span>
                {candidateEmail && <span className="font-mono">{candidateEmail}</span>}
              </div>
            </div>
          </div>

          {/* Section 2: Recruiter Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-kth-slate-50 p-3 rounded-2xl border border-kth-slate-200">
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {candidateResume ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  leftIcon={<FileText className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold flex-1 sm:flex-none justify-center"
                >
                  View Resume
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  leftIcon={<FileText className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold flex-1 sm:flex-none justify-center"
                >
                  Profile Snapshot
                </Button>
              )}

              <Button
                variant={isSaved ? 'secondary' : 'outline'}
                size="sm"
                onClick={handleToggleSaveCandidate}
                leftIcon={
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      isSaved ? 'fill-kth-primary-600 text-kth-primary-600' : ''
                    }`}
                  />
                }
                className="text-xs font-semibold flex-1 sm:flex-none justify-center"
              >
                {isSaved ? 'Saved to Bench' : 'Save Candidate'}
              </Button>

              {currentApp && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(true)}
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold flex-1 sm:flex-none justify-center"
                >
                  Interview
                </Button>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleNavigateToFullProfile}
              className="text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs w-full sm:w-auto justify-center"
            >
              View Full Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Section 3: Candidate Quick Snapshot Grid */}
          <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 space-y-2.5">
            <h4 className="font-bold text-[10px] text-kth-slate-400 uppercase tracking-wider font-mono">
              Candidate Snapshot
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <div className="bg-kth-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                <span className="text-[10px] text-kth-slate-400 uppercase font-bold block">
                  Profile Completion
                </span>
                <span className="font-bold font-mono text-emerald-700">
                  {profileCompletion !== undefined ? `${profileCompletion}% Complete` : 'Completed Profile'}
                </span>
              </div>
              <div className="bg-kth-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                <span className="text-[10px] text-kth-slate-400 uppercase font-bold block">
                  Experience
                </span>
                <span className="font-semibold text-kth-slate-900">
                  {experienceYears !== undefined ? `${experienceYears}+ Years` : 'Demonstrated Track Record'}
                </span>
              </div>
              <div className="bg-kth-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                <span className="text-[10px] text-kth-slate-400 uppercase font-bold block">
                  Domain / Specialty
                </span>
                <span className="font-semibold text-kth-primary-700 truncate block" title={domain}>
                  {domain}
                </span>
              </div>
              <div className="bg-kth-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                <span className="text-[10px] text-kth-slate-400 uppercase font-bold block">
                  Location
                </span>
                <span className="font-semibold text-kth-slate-800 truncate block">
                  {candidateLocation}
                </span>
              </div>
              <div className="bg-kth-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                <span className="text-[10px] text-kth-slate-400 uppercase font-bold block">
                  Education
                </span>
                <span className="font-semibold text-kth-slate-800 truncate block" title={educationText}>
                  {educationText}
                </span>
              </div>
              <div className="bg-kth-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                <span className="text-[10px] text-kth-slate-400 uppercase font-bold block">
                  Expected Salary
                </span>
                <span className="font-mono font-bold text-kth-slate-900">
                  {expectedSalaryFormatted}
                </span>
              </div>
              <div className="bg-kth-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                <span className="text-[10px] text-kth-slate-400 uppercase font-bold block">
                  Notice Period
                </span>
                <span className="font-semibold text-kth-slate-800">
                  {noticePeriodFormatted}
                </span>
              </div>
              <div className="bg-kth-slate-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                <span className="text-[10px] text-kth-slate-400 uppercase font-bold block">
                  Work Mode
                </span>
                <span className="font-semibold text-kth-slate-800">
                  {workModeText}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Verified Skills */}
          {candidateSkills.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-[10px] text-kth-slate-500 uppercase tracking-wider font-mono">
                Verified Skills ({candidateSkills.length})
              </h4>
              <div className="flex gap-1.5 flex-wrap">
                {candidateSkills.slice(0, 10).map((skill, idx) => (
                  <Badge key={idx} variant="indigo" className="text-[11px] py-0.5">
                    {skill}
                  </Badge>
                ))}
                {candidateSkills.length > 10 && (
                  <span className="text-[11px] text-kth-slate-500 self-center font-medium">
                    +{candidateSkills.length - 10} more in profile
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Professional Summary */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-[10px] text-kth-slate-500 uppercase tracking-wider font-mono">
              Professional Summary
            </h4>
            <div className="bg-kth-slate-50 p-3 rounded-xl border border-kth-slate-200 text-xs text-kth-slate-700 leading-relaxed">
              <p className={isBioExpanded ? '' : 'line-clamp-4'}>
                {candidateBio}
              </p>
              {candidateBio.length > 200 && (
                <button
                  type="button"
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                  className="mt-1.5 text-xs text-kth-primary-600 hover:text-kth-primary-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  {isBioExpanded ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Read full summary <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Section 6: Key Strengths */}
          {keyStrengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-[10px] text-kth-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Key Strengths & Focus Areas
              </h4>
              <div className="flex gap-1.5 flex-wrap">
                {keyStrengths.map((str, idx) => (
                  <Badge key={idx} variant="amber" className="text-[11px] py-0.5">
                    {str}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Relevant Experience (Concise Timeline) */}
          {experienceItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-[10px] text-kth-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-kth-primary-600" /> Relevant Experience
              </h4>
              <div className="space-y-2">
                {experienceItems.slice(0, 2).map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white rounded-lg border border-kth-slate-200 text-xs flex justify-between items-start gap-2"
                  >
                    <div>
                      <strong className="font-bold text-kth-slate-900 block truncate">
                        {exp.title}
                      </strong>
                      <span className="text-kth-slate-600 text-[11px] block truncate">
                        {exp.company} {exp.location ? `· ${exp.location}` : ''}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-kth-slate-500 shrink-0 bg-kth-slate-50 px-2 py-0.5 rounded border border-kth-slate-200">
                      {exp.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: ATS Pipeline Stage Movement (Only when in ATS pipeline mode) */}
          {currentApp && (
            <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 space-y-2">
              <label className="text-[10px] font-bold text-kth-slate-700 uppercase tracking-wider block font-mono">
                ATS Pipeline Stage
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={currentApp.stage}
                    onChange={(e) => handleStageChange(e.target.value as ApplicationStage)}
                    disabled={stageLoading}
                    options={[
                      { value: 'new', label: 'New Applicant' },
                      { value: 'screening', label: 'Screening Round' },
                      { value: 'shortlisted', label: 'Shortlisted' },
                      { value: 'interview', label: 'Interview Round' },
                      { value: 'offer', label: 'Offer Extended' },
                      { value: 'hired', label: 'Hired' },
                      { value: 'rejected', label: 'Archived / Not Selected' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 9: Recruiter Evaluation Rating & Private Notes (Only when in ATS application mode) */}
          {currentApp && (
            <div className="bg-kth-slate-50 p-3.5 rounded-xl border border-kth-slate-200 space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-kth-slate-700 uppercase tracking-wider font-mono">
                  Recruiter Rating & Private Notes
                </label>
                {notesSuccess && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>

              {/* Star Rating Selection */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-kth-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono text-kth-slate-500 ml-2">
                  {rating > 0 ? `${rating}/5 Stars` : 'Unrated'}
                </span>
              </div>

              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal recruiter feedback..."
                className="w-full rounded-lg border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 bg-white placeholder:text-kth-slate-400 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
              />

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  isLoading={isSavingNotes}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}

          {/* Section 10: Bottom Full Profile Action CTA */}
          <div className="pt-3 border-t border-kth-slate-200 flex justify-between items-center">
            <span className="text-xs text-kth-slate-500">
              Need full experience & education history?
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNavigateToFullProfile}
            >
              View Full Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Resume Document Preview Modal */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Resume & Profile Document — ${candidateName}`}
        description="Verified Candidate Profile"
        maxWidth="xl"
      >
        <div className="space-y-4 text-left font-sans text-xs">
          {candidateResume ? (
            <div className="w-full rounded-xl overflow-hidden border border-kth-slate-200 bg-kth-slate-50">
              <iframe
                src={`${candidateResume}#toolbar=1&navpanes=0`}
                title="Candidate Resume Full Preview"
                className="w-full h-[580px] border-0 rounded-xl bg-white"
              />
            </div>
          ) : (
            <div className="w-full bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-kth-primary-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-kth-slate-900">{candidateName}</h4>
                  <p className="text-xs text-kth-slate-500">{candidateHeadline}</p>
                </div>
              </div>
              <div className="border-t border-kth-slate-200 pt-3 text-xs text-kth-slate-700 space-y-2">
                {candidateEmail && <div><strong>Email:</strong> {candidateEmail}</div>}
                <div><strong>Location:</strong> {candidateLocation}</div>
                {candidateSkills.length > 0 && <div><strong>Skills:</strong> {candidateSkills.join(', ')}</div>}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-kth-slate-100">
            {candidateResume && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => window.open(candidateResume, '_blank')}
                >
                  Open Full Window
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleDownloadResume}
                >
                  Download
                </Button>
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={() => setIsPreviewOpen(false)} className="ml-auto">
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Interview Scheduling Modal */}
      {currentApp && (
        <ScheduleInterviewModal
          application={currentApp}
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={() => {
            setCurrentApp((prev) => (prev ? { ...prev, stage: 'interview' } : null));
            onApplicationUpdated?.({ ...currentApp, stage: 'interview' });
          }}
        />
      )}
    </>
  );
};
