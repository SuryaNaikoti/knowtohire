import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { jobService, applicationService, Job, JobApplication } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/design-system/tokens';
import {
  ArrowLeft,
  Loader2,
  Send,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';

interface CandidateApplyPageProps {
  jobId?: string;
  onNavigate?: (path: string) => void;
}

export const CandidateApplyPage: React.FC<CandidateApplyPageProps> = ({ jobId: propJobId, onNavigate }) => {
  const { id: routerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, role, loginWithDemo } = useAuth();

  const resolvedJobId =
    propJobId ||
    routerId ||
    (window.location.pathname.startsWith('/jobs/')
      ? window.location.pathname.replace('/jobs/', '').replace('/apply', '')
      : '') ||
    (window.location.pathname.startsWith('/candidate/jobs/')
      ? window.location.pathname.replace('/candidate/jobs/', '').replace('/apply', '')
      : '') ||
    '';

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdApplication, setCreatedApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    if (resolvedJobId) {
      setIsLoading(true);
      setErrorMessage(null);
      jobService.getPublishedJobById(resolvedJobId).then((res) => {
        if (res.data) {
          setJob(res.data);
          setIsLoading(false);
        } else {
          // fallback to getJobById
          jobService.getJobById(resolvedJobId).then((fallbackRes) => {
            if (fallbackRes.data) {
              setJob(fallbackRes.data);
            } else {
              setErrorMessage('Job requisition not found.');
            }
            setIsLoading(false);
          }).catch(() => {
            setErrorMessage('Job requisition not found.');
            setIsLoading(false);
          });
        }
      }).catch(() => {
        setErrorMessage('Failed to load position.');
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setErrorMessage('No Job ID specified.');
    }
  }, [resolvedJobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || isSubmitting) return;

    if (!isAuthenticated) {
      setErrorMessage('Please sign in as a candidate to submit your application.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await applicationService.applyToJob({
      job_id: job.id,
      cover_letter: coverLetter.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error.message);
    } else if (res.data) {
      setCreatedApplication(res.data);
    }
  };

  const handleBack = () => {
    const backPath = job ? `/jobs/${job.id}` : '/jobs';
    if (onNavigate) {
      onNavigate(backPath);
    } else {
      window.history.pushState({}, '', backPath);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleNavigateTracker = (appId: string) => {
    const targetPath = `/candidate/applications/${appId}`;
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-kth-slate-50 py-8 sm:py-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Requisition Details</span>
          </button>
        </div>

        {isLoading ? (
          <Card className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Loading position credentials...</p>
          </Card>
        ) : createdApplication ? (
          /* Application Success View */
          <Card className="p-8 sm:p-12 text-center space-y-6 bg-white border-kth-slate-200 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl text-kth-slate-900">
                Application Successfully Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-kth-slate-600 max-w-lg mx-auto leading-relaxed">
                Your candidate profile credentials, ATS resume snapshot, and cover note have been securely transmitted to{' '}
                <strong className="text-kth-slate-900">{job?.company?.name || 'the hiring team'}</strong>.
              </p>
            </div>

            <div className="bg-kth-slate-50 p-6 rounded-2xl border border-kth-slate-200 text-left text-xs space-y-3 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-kth-slate-500 font-medium">Position:</span>
                <span className="font-bold text-kth-slate-900">{job?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kth-slate-500 font-medium">Enterprise Employer:</span>
                <span className="font-bold text-kth-slate-900">{job?.company?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kth-slate-500 font-medium">Initial ATS Stage:</span>
                <span className="font-bold text-kth-primary-600 uppercase text-[11px] font-mono">New Applicant</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-kth-slate-200">
                <span className="text-kth-slate-500 font-medium">Submission ID:</span>
                <span className="font-mono text-kth-slate-700">{createdApplication.id}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Button
                variant="secondary"
                size="md"
                className="text-xs font-semibold"
                onClick={handleBack}
              >
                Browse More Positions
              </Button>
              <Button
                variant="primary"
                size="md"
                className="text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs"
                onClick={() => handleNavigateTracker(createdApplication.id)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Application Tracker
              </Button>
            </div>
          </Card>
        ) : job ? (
          /* Application Submission Studio */
          <div className="space-y-6">
            {/* Position Summary Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan" className="text-[10px] font-bold">
                    JOB REQUISITION
                  </Badge>
                  <span className="text-xs text-indigo-300 font-semibold">{job.category}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{job.title}</h1>
                <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium text-white">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    {job.company?.name || 'Verified Enterprise'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono font-bold text-cyan-300">
                    {formatINR(job.min_salary_inr)} - {formatINR(job.max_salary_inr, true)}
                  </span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <Alert variant="error" title="Submission Failed">
                <div className="flex items-start gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Candidate Credentials Verification Box */}
              <Card className="p-6 space-y-4 bg-white border-kth-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-kth-primary-600" />
                    Verified Candidate Snapshot
                  </h3>
                  <Badge variant={isAuthenticated ? "emerald" : "amber"} className="text-[10px] font-bold">
                    {isAuthenticated ? "Profile Linked" : "Sign-in Recommended"}
                  </Badge>
                </div>

                {!isAuthenticated && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold block">You are currently browsing as a guest.</span>
                        <span className="text-amber-800 text-[11px]">
                          Sign in or authenticate as a candidate to link your verified ATS profile and submit.
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs font-semibold py-1 px-3 bg-white"
                        onClick={() => {
                          if (onNavigate) onNavigate(`/login?redirect=/jobs/${resolvedJobId}/apply`);
                          else window.location.href = `/login?redirect=/jobs/${resolvedJobId}/apply`;
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="text-xs font-bold py-1 px-3 bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={async () => {
                          await loginWithDemo('candidate');
                        }}
                      >
                        Quick Candidate Demo
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80">
                    <span className="text-[11px] text-kth-slate-500 font-medium block">Applicant Name</span>
                    <strong className="text-sm text-kth-slate-900 block mt-0.5">
                      {profile?.full_name || user?.email?.split('@')[0] || (isAuthenticated ? 'Authenticated Candidate' : 'Candidate (Guest)')}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80">
                    <span className="text-[11px] text-kth-slate-500 font-medium block">Applicant Email</span>
                    <span className="text-xs font-mono font-bold text-kth-slate-900 block mt-0.5">
                      {user?.email || 'candidate@knowtohire.com'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">ATS Profile Snapshot Ready</strong>
                    <span>Your standardized skills, experience history, and verified education will be attached automatically upon submission.</span>
                  </div>
                </div>
              </Card>

              {/* Cover Letter Studio */}
              <Card className="p-6 space-y-4 bg-white border-kth-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-kth-primary-600" />
                    Cover Letter & Relevant Experience Note
                  </h3>
                  <span className="text-[11px] text-kth-slate-400 font-mono">Optional</span>
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={6}
                    placeholder="Highlight your domain expertise (e.g. SEBI BRSR compliance, ESG assurance, carbon auditing) and why you are an exceptional fit for this requisition..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-kth-slate-200 focus:outline-none focus:ring-2 focus:ring-kth-primary-500 focus:border-transparent leading-relaxed"
                  />
                  <p className="text-[11px] text-kth-slate-400">
                    A tailored cover note increases your ATS review engagement by up to 40%.
                  </p>
                </div>
              </Card>

              {/* Submission Action Bar */}
              <div className="flex items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-kth-slate-200 shadow-xs">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleBack}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="text-xs font-bold bg-kth-primary-600 hover:bg-kth-primary-700 text-white shadow-xs"
                  leftIcon={<Send className="w-4 h-4" />}
                  isLoading={isSubmitting}
                >
                  Submit Official Application
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};
