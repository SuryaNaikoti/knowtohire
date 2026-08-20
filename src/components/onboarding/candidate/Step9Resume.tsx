import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { CandidateOnboardingData } from '@/types/onboarding';
import { uploadResume, validatePDFResumeFile } from '@/services/resumeService';
import { useAuth } from '@/context/AuthContext';
import { UploadCloud, FileText, CheckCircle2, Trash2, AlertCircle, Loader2 } from 'lucide-react';

export interface Step9ResumeProps {
  data: CandidateOnboardingData;
  onChange: (updates: Partial<CandidateOnboardingData>) => void;
  errors: Record<string, string>;
}

export const Step9Resume: React.FC<Step9ResumeProps> = ({
  data,
  onChange,
  errors,
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    const validation = await validatePDFResumeFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format. Please upload a PDF file.');
      return;
    }

    setIsUploading(true);
    const userId = user?.id || 'temp-candidate';
    const result = await uploadResume(userId, file);
    setIsUploading(false);

    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      onChange({
        resumeUrl: result.url,
        resumeFileName: result.fileName || file.name,
        resumeFileSize: result.fileSize || file.size,
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange({
      resumeUrl: '',
      resumeFileName: '',
      resumeFileSize: 0,
    });
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasResume = Boolean(data.resumeUrl && data.resumeFileName);

  return (
    <div className="space-y-6 text-left">
      <OnboardingStepHeader
        stepNumber={9}
        title="Resume / Curriculum Vitae (CV)"
        subtitle="Upload your updated resume in PDF format (Max 10MB)."
        tag="Document Verification"
      />

      <div className="space-y-4">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
          id="resume-file-upload"
        />

        {/* Existing Uploaded Document State */}
        {hasResume ? (
          <div className="p-5 rounded-xl bg-white border-2 border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-kth-slate-900 truncate">
                      {data.resumeFileName}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Uploaded
                    </span>
                  </div>
                  <p className="text-xs text-kth-slate-500 mt-0.5">
                    {formatBytes(data.resumeFileSize)} • PDF Document • Ready for ATS parsing & employer review
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                className="text-kth-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Remove and replace resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-kth-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Replace Document
              </Button>
            </div>
          </div>
        ) : (
          /* Dropzone Upload Box */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative p-8 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center
              flex flex-col items-center justify-center gap-3 bg-white
              ${isDragOver ? 'border-kth-primary-600 bg-kth-primary-50/20 scale-[0.99]' : 'border-kth-slate-200 hover:border-kth-primary-400 hover:bg-kth-slate-50/50'}
              ${isUploading ? 'opacity-60 pointer-events-none' : ''}
              ${errors.resumeUrl || uploadError ? 'border-red-300 bg-red-50/20' : ''}
            `}
          >
            <div className="w-14 h-14 rounded-full bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-kth-slate-900">
                {isUploading ? 'Uploading PDF Document...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-kth-slate-500">
                PDF document only (Max 10MB)
              </p>
            </div>

            {!isUploading && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2 pointer-events-none"
              >
                Select PDF File
              </Button>
            )}
          </div>
        )}

        {/* Upload or Validation Error */}
        {(uploadError || errors.resumeUrl) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{uploadError || errors.resumeUrl}</span>
          </div>
        )}
      </div>
    </div>
  );
};
