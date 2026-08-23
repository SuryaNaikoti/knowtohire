import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { ResumeCard } from '@/components/candidate/ResumeCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import {
  candidateProfileService,
  CandidateFullProfile,
  resumeService,
} from '@/services';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const CandidateResumePage: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Data States ───────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<CandidateFullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ─── Action States ─────────────────────────────────────────────────────────
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ─── Modal Preview State ───────────────────────────────────────────────────
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // ─── Load Candidate Profile & Active Resume ────────────────────────────────
  const loadResumeData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const res = await candidateProfileService.getMyCandidateProfile();

    if (res.error) {
      setLoadError(res.error.message);
      setProfile(null);
    } else if (res.data) {
      setProfile(res.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  // ─── Trigger File Selection ────────────────────────────────────────────────
  const handleTriggerUpload = () => {
    setUploadError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // ─── Handle File Upload & Supabase Persistence ────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Strict PDF Validation (Extension, MIME type, Size, Magic Bytes %PDF-)
    const validation = await resumeService.validatePDFResumeFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Please upload a valid PDF resume.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!user) {
      setUploadError('You must be signed in to upload a resume.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    // 2. Upload to Supabase Storage ('resumes' bucket with Content-Type: application/pdf)
    const uploadRes = await resumeService.uploadResume(user.id, file);

    if (uploadRes.error || !uploadRes.url) {
      setUploadError(uploadRes.error || 'Failed to upload resume to storage.');
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Persist new resume_url to candidate_profiles in Supabase
    const updateRes = await candidateProfileService.updateMyCandidateProfile({
      resumeUrl: uploadRes.url,
    });

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (updateRes.error) {
      setUploadError(updateRes.error.message || 'Failed to update candidate profile record.');
      return;
    }

    if (updateRes.data) {
      setProfile(updateRes.data);
      setSuccessMessage('Your new resume is now active and ready to use.');
    }
  };

  // ─── Derived Resume Metadata ───────────────────────────────────────────────
  const hasResume = Boolean(profile?.resumeUrl);
  const isPDF = resumeService.isPDFResume(profile?.resumeUrl);
  const fileFormat = resumeService.getResumeFormat(profile?.resumeUrl);
  
  // Check stored demo metadata first to preserve authentic uploaded filename
  const effectiveUserId = user?.id || profile?.id || '00000000-0000-0000-0000-000000000001';
  const storedMetadata = resumeService.getStoredDemoResume(effectiveUserId) || (user?.id ? resumeService.getStoredDemoResume(user.id) : null);
  const fileName = resumeService.extractResumeFileName(
    profile?.resumeUrl,
    storedMetadata?.fileName || 'Surya Naikoti - CV.pdf',
    storedMetadata?.fileName
  );
  
  const uploadDate = (storedMetadata?.uploadedAt || profile?.updatedAt)
    ? new Date(storedMetadata?.uploadedAt || profile!.updatedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '24 Aug 2026';

  return (
    <CandidateShell title="Resume & ATS Analysis" currentPath="/candidate/resume">
      <div className="space-y-6 font-sans">
        {/* Hidden File Picker Input - PDF Only */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="resume-file-picker"
        />

        {/* ─── Notification Alerts ───────────────────────────────────────────── */}
        {uploadError && (
          <Alert variant="error" title="Upload Failed">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{uploadError}</span>
              <Button variant="outline" size="sm" onClick={handleTriggerUpload}>
                Try Again
              </Button>
            </div>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" title="Resume Updated Successfully">
            <div className="flex justify-between items-center">
              <span>{successMessage}</span>
              <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)}>
                Dismiss
              </Button>
            </div>
          </Alert>
        )}

        {/* Legacy Unsupported Document Alert */}
        {hasResume && !isPDF && (
          <Alert variant="warning" title="Unsupported Resume Format Detected">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>
                Your previously uploaded resume is stored as a <strong>{fileFormat}</strong> document. Word documents cannot be previewed inline or processed by the ATS engine. Please replace your resume with a genuine PDF document.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTriggerUpload}
                isLoading={isUploading}
              >
                Upload PDF Resume
              </Button>
            </div>
          </Alert>
        )}

        {loadError && (
          <Alert variant="error" title="Unable to Load Resume Data">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>{loadError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadResumeData}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* ─── Loading Skeletons ─────────────────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-kth-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-kth-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-kth-slate-200 rounded w-1/3" />
                </div>
              </div>
              <div className="h-16 bg-kth-slate-100 rounded-xl" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-kth-slate-200 h-64" />
          </div>
        )}

        {/* ─── Real Database-Backed Resume Card ──────────────────────────────── */}
        {!isLoading && (
          <>
            <ResumeCard
              fileName={fileName}
              uploadDate={uploadDate}
              atsScore={87}
              hasResume={hasResume}
              isPDF={isPDF}
              fileFormat={fileFormat}
              isUploading={isUploading}
              onPreview={() => setIsPreviewModalOpen(true)}
              onReplace={handleTriggerUpload}
            />

            {/* ATS Score Improvement Recommendations */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-base text-kth-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-kth-accent-emerald" /> ATS Optimization Recommendations
                </h3>
                <Badge variant={isPDF ? 'emerald' : 'mono'}>
                  {isPDF ? 'ATS Benchmark Audit' : 'Audit Pending (PDF Required)'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-emerald-950">
                      {isPDF ? 'Regulatory Framework Alignment' : 'Profile Benchmark'}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {isPDF
                        ? 'Your verified PDF resume and candidate profile align with mandatory Indian sustainability frameworks (BRSR Core, Scope 1 & 2 GHG).'
                        : 'Your candidate profile and target preferences align with mandatory Indian sustainability frameworks (BRSR Core, Scope 1 & 2 GHG).'}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-950">
                      {isPDF ? 'Suggested Keyword Addition' : 'Profile-Based Keyword Suggestion'}
                    </h4>
                    <p className="text-xs text-amber-800">
                      {isPDF
                        ? 'Adding "Science-Based Targets (SBTi)" will increase your ATS match score for Senior ESG roles to 94%.'
                        : 'Adding "Science-Based Targets (SBTi)" to your profile and resume aligns with Senior ESG sustainability roles in India.'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* ─── Real Resume Document Preview Card ─────────────────────────── */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-kth-slate-900">Document Preview</h3>
                  <p className="text-xs text-kth-slate-500">
                    {hasResume && isPDF
                      ? 'Live preview of your verified PDF resume stored in Supabase.'
                      : hasResume && !isPDF
                      ? 'Upload a PDF resume to enable document preview.'
                      : 'Upload your PDF resume to preview it here.'}
                  </p>
                </div>
                {hasResume && isPDF && profile?.resumeUrl && (
                  <div className="flex items-center gap-2">
                    <Badge variant="mono">PDF Format</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      onClick={() => window.open(profile.resumeUrl!, '_blank')}
                    >
                      Open in New Tab
                    </Button>
                  </div>
                )}
              </div>

              {/* State 1: Genuine PDF Document Available */}
              {hasResume && isPDF && profile?.resumeUrl ? (
                <div className="w-full rounded-xl overflow-hidden border border-kth-slate-200 bg-kth-slate-50">
                  <iframe
                    src={`${profile.resumeUrl}#toolbar=1&navpanes=0`}
                    title="Candidate Resume Document"
                    className="w-full h-[640px] border-0 rounded-xl bg-white"
                  />
                </div>
              ) : hasResume && !isPDF ? (
                /* State 2: Legacy Unsupported Document (e.g. DOCX) - NEVER load in iframe to prevent auto-download */
                <div className="w-full py-16 bg-amber-50/40 border border-dashed border-amber-300 rounded-xl flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h4 className="font-display font-bold text-base text-kth-slate-900">
                      Unsupported Document Format ({fileFormat})
                    </h4>
                    <p className="text-xs text-kth-slate-600 leading-relaxed">
                      Your current active resume is a Word document (<strong>{fileName}</strong>). Web browsers cannot preview Word documents inline. Please upload a PDF version to enable the interactive document preview.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<UploadCloud className="w-4 h-4" />}
                    onClick={handleTriggerUpload}
                    isLoading={isUploading}
                  >
                    {isUploading ? 'Uploading PDF Resume...' : 'Replace with PDF Resume'}
                  </Button>
                </div>
              ) : (
                /* State 3: No Resume Uploaded */
                <div className="w-full py-16 bg-kth-slate-50 border border-dashed border-kth-slate-300 rounded-xl flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-white text-kth-slate-400 flex items-center justify-center border border-kth-slate-200 shadow-xs">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h4 className="font-display font-bold text-base text-kth-slate-900">
                      No Resume Uploaded
                    </h4>
                    <p className="text-xs text-kth-slate-500 leading-relaxed">
                      Upload your updated resume in PDF format to view the interactive document preview, unlock one-click applications, and generate your ATS score.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<UploadCloud className="w-4 h-4" />}
                    onClick={handleTriggerUpload}
                    isLoading={isUploading}
                  >
                    {isUploading ? 'Uploading Resume...' : 'Upload PDF Resume'}
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {/* ─── Fullscreen / Dedicated PDF Preview Modal ─────────────────────────── */}
      <Dialog
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={fileName}
        description={
          isPDF
            ? `Uploaded on ${uploadDate} • Verified PDF Document`
            : `Uploaded on ${uploadDate} • ${fileFormat} Document (PDF Required for Preview)`
        }
        maxWidth="xl"
      >
        <div className="space-y-4">
          {hasResume && isPDF && profile?.resumeUrl ? (
            <div className="w-full rounded-xl overflow-hidden border border-kth-slate-200 bg-kth-slate-50">
              <iframe
                src={`${profile.resumeUrl}#toolbar=1&navpanes=0`}
                title="Resume Full Preview"
                className="w-full h-[620px] border-0 rounded-xl bg-white"
              />
            </div>
          ) : hasResume && !isPDF ? (
            <div className="py-12 text-center text-kth-slate-600 text-xs space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-semibold text-kth-slate-800">
                Word documents ({fileFormat}) cannot be previewed in the PDF viewer.
              </p>
              <p className="text-kth-slate-500 max-w-sm mx-auto">
                Please upload a PDF version of your resume to enable full document preview and ATS parsing.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleTriggerUpload();
                }}
              >
                Upload PDF Now
              </Button>
            </div>
          ) : (
            <div className="py-12 text-center text-kth-slate-500 text-xs">
              No resume document available for preview.
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-kth-slate-100">
            {hasResume && isPDF && profile?.resumeUrl && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => window.open(profile.resumeUrl!, '_blank')}
              >
                Open Full Window
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPreviewModalOpen(false)}
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </CandidateShell>
  );
};
