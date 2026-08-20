import React, { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { applicationService, savedCandidateService, JobApplication, ApplicationStage } from '@/services';
import { EmployerCandidate } from '@/data/employerMockData';
import { MapPin, FileText, Bookmark, Calendar, Star, Check } from 'lucide-react';

export interface CandidateQuickViewProps {
  application?: JobApplication | null;
  candidate?: EmployerCandidate | null;
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Recruiter notes and rating state
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [stageLoading, setStageLoading] = useState(false);

  useEffect(() => {
    setCurrentApp(application || null);
    if (application) {
      setNotes(application.employer_notes || '');
      setRating(application.employer_rating || 0);

      // Check if candidate is saved
      const checkSaved = async () => {
        const { data } = await savedCandidateService.isCandidateSaved(application.candidate_id);
        setIsSaved(data || false);
      };
      checkSaved();
    } else if (candidate) {
      setIsSaved(candidate.isSaved || false);
    }
  }, [application, candidate]);

  if (!currentApp && !candidate) return null;

  // Extract snapshot fields
  const snapshot = currentApp ? ((currentApp.candidate_snapshot || {}) as Record<string, any>) : {};
  const candidateName =
    currentApp?.candidate?.full_name ||
    snapshot.full_name ||
    candidate?.name ||
    'Candidate';
  const candidateEmail = currentApp?.candidate?.email || snapshot.email || '';
  const candidateHeadline = snapshot.headline || candidate?.title || 'Sustainability Professional';
  const candidateLocation = snapshot.location || candidate?.location || 'India';
  const candidateSkills: string[] = Array.isArray(snapshot.skills)
    ? snapshot.skills
    : candidate?.skills || [];
  const candidateBio =
    snapshot.bio ||
    snapshot.summary ||
    candidate?.summary ||
    'No candidate bio provided.';
  const candidateResume = currentApp?.resume_url || snapshot.resume_url;
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
    const candidateId = currentApp?.candidate_id || candidate?.id;
    if (!candidateId) return;

    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    if (nextSavedState) {
      await savedCandidateService.saveCandidate(candidateId);
    } else {
      await savedCandidateService.unsaveCandidate(candidateId);
    }
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
      >
        <div className="space-y-6 font-sans text-left">
          {/* Candidate Identity Header */}
          <div className="flex items-start gap-4 pb-4 border-b border-kth-slate-200">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kth-primary-600 to-kth-slate-900 text-white font-extrabold text-lg flex items-center justify-center shrink-0">
              {candidateName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-display font-bold text-lg text-kth-slate-900">{candidateName}</h3>
                <Badge variant={getStageVariant(currentStage)} className="capitalize">
                  {currentStage.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs font-semibold text-kth-slate-700 mb-1">{candidateHeadline}</p>
              <div className="flex items-center gap-3 text-xs text-kth-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {candidateLocation}</span>
                {candidateEmail && <span>{candidateEmail}</span>}
              </div>
            </div>
          </div>

          {/* Recruiter Quick Actions Bar */}
          <div className="flex gap-2 flex-wrap bg-kth-slate-50 p-3 rounded-xl border border-kth-slate-200">
            {currentApp && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleModalOpen(true)}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Schedule Interview
              </Button>
            )}
            {candidateResume ? (
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} leftIcon={<FileText className="w-3.5 h-3.5" />}>
                View Resume
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} leftIcon={<FileText className="w-3.5 h-3.5" />}>
                Profile Snapshot
              </Button>
            )}
            <Button
              variant={isSaved ? "secondary" : "outline"}
              size="sm"
              onClick={handleToggleSaveCandidate}
              leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-kth-primary-600 text-kth-primary-600' : ''}`} />}
            >
              {isSaved ? 'Saved to Bench' : 'Save Candidate'}
            </Button>
          </div>

          {/* Stage Movement Selector (Only when application is present) */}
          {currentApp && (
            <div className="bg-white p-4 rounded-xl border border-kth-slate-200 space-y-2">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
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

          {/* Recruiter Evaluation Rating & Private Notes */}
          {currentApp && (
            <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider">
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
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal evaluation feedback, technical ratings, or questions for subsequent interviewers..."
                className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 bg-white placeholder:text-kth-slate-400 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
              />

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  isLoading={isSavingNotes}
                >
                  Save Recruiter Notes
                </Button>
              </div>
            </div>
          )}

          {/* Candidate Skills List */}
          {candidateSkills.length > 0 && (
            <div>
              <h4 className="font-bold text-xs text-kth-slate-500 uppercase tracking-wider mb-2">Verified Skills</h4>
              <div className="flex gap-1.5 flex-wrap">
                {candidateSkills.map((s, idx) => (
                  <Badge key={idx} variant="indigo" className="text-[11px]">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Summary / Bio */}
          <div>
            <h4 className="font-bold text-xs text-kth-slate-500 uppercase tracking-wider mb-1">Candidate Profile Bio</h4>
            <p className="text-xs text-kth-slate-700 leading-relaxed whitespace-pre-line">{candidateBio}</p>
          </div>

          {/* Application Metadata if available */}
          {currentApp && (
            <div className="space-y-2 text-xs text-kth-slate-600 bg-white p-3.5 rounded-xl border border-kth-slate-200">
              <div className="flex justify-between">
                <span>Applied Position:</span>
                <strong className="text-kth-slate-900">{currentApp.job?.title || 'Position'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Application Date:</span>
                <strong className="text-kth-slate-900">
                  {new Date(currentApp.applied_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Application ID:</span>
                <strong className="font-mono text-kth-slate-500">{currentApp.id.slice(0, 8)}</strong>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Resume Document Preview Modal */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Resume & Profile Document — ${candidateName}`}
        description="Verified Candidate Profile"
      >
        <div className="space-y-4 text-left font-sans">
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
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsPreviewOpen(false)}>Close</Button>
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
            // Advance local stage to 'interview'
            setCurrentApp((prev) => prev ? { ...prev, stage: 'interview' } : null);
            onApplicationUpdated?.({ ...currentApp, stage: 'interview' });
          }}
        />
      )}
    </>
  );
};
