import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { applicationService, Job, JobApplication } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/design-system/tokens';
import { CheckCircle2, FileText, Send, Building2, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

export interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (application: JobApplication) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdApplication, setCreatedApplication] = useState<JobApplication | null>(null);

  const salaryText = `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { data, error } = await applicationService.applyToJob({
      job_id: job.id,
      cover_letter: coverLetter.trim() || undefined,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      setCreatedApplication(data);
      onSuccess?.(data);
    }
  };

  const handleModalClose = () => {
    setCoverLetter('');
    setErrorMessage(null);
    setCreatedApplication(null);
    onClose();
  };

  const handleNavigateToApplication = (applicationId: string) => {
    handleModalClose();
    window.history.pushState({}, '', `/candidate/applications/${applicationId}`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleModalClose}
      title={createdApplication ? "Application Submitted" : `Apply to ${job.company?.name || 'Enterprise'}`}
      description={createdApplication ? undefined : `Position: ${job.title}`}
    >
      {createdApplication ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-extrabold text-lg text-kth-slate-900">
              Application Successfully Sent!
            </h4>
            <p className="text-xs text-kth-slate-500 max-w-sm mx-auto leading-relaxed">
              Your candidate profile snapshot and application documents have been securely forwarded to <strong>{job.company?.name || 'the hiring team'}</strong>.
            </p>
          </div>

          <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-kth-slate-500">Position:</span>
              <span className="font-semibold text-kth-slate-900">{job.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kth-slate-500">Enterprise:</span>
              <span className="font-semibold text-kth-slate-900">{job.company?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kth-slate-500">Initial Stage:</span>
              <span className="font-bold text-kth-primary-600 uppercase text-[10px]">New Applicant</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleModalClose}
            >
              Continue Browsing
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleNavigateToApplication(createdApplication.id)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View Application Tracker
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {errorMessage && (
            <Alert variant="error" title="Submission Failed">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            </Alert>
          )}

          {/* Job Snapshot Summary Box */}
          <div className="bg-kth-slate-50 p-3.5 rounded-xl border border-kth-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-kth-slate-900">{job.title}</span>
              <span className="font-mono font-bold text-kth-primary-600">{salaryText}</span>
            </div>
            <div className="flex items-center gap-3 text-kth-slate-500 text-[11px]">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {job.company?.name}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
            </div>
          </div>

          {/* Candidate Profile Verification Preview */}
          <div className="p-3.5 bg-kth-primary-50/50 rounded-xl border border-kth-primary-100 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-kth-primary-800 uppercase tracking-wider">Candidate Snapshot</span>
              <span className="text-[10px] font-semibold text-kth-primary-600 bg-white px-2 py-0.5 rounded border border-kth-primary-200">
                Live Profile
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-kth-primary-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'C'}
              </div>
              <div className="truncate">
                <div className="font-bold text-kth-slate-900 truncate">{profile?.full_name || 'Candidate'}</div>
                <div className="text-[11px] text-kth-slate-500 truncate">{user?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-kth-primary-700">
              <FileText className="w-3.5 h-3.5" />
              <span>Standard candidate resume & verified credentials will be attached automatically.</span>
            </div>
          </div>

          {/* Optional Cover Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-kth-slate-700">
              Cover Note / Introduction <span className="text-kth-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Briefly highlight why your experience in ESG / sustainability fits this opening..."
              className="w-full rounded-xl border border-kth-slate-200 px-3.5 py-2.5 text-xs text-kth-slate-900 placeholder:text-kth-slate-400 focus:outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleModalClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              leftIcon={!isSubmitting ? <Send className="w-3.5 h-3.5" /> : undefined}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
