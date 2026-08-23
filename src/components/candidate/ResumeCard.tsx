import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { FileText, Eye, UploadCloud, AlertTriangle } from 'lucide-react';

export interface ResumeCardProps {
  fileName?: string;
  uploadDate?: string;
  atsScore?: number;
  hasResume?: boolean;
  isPDF?: boolean;
  fileFormat?: string;
  isUploading?: boolean;
  onPreview?: () => void;
  onReplace?: () => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  fileName = 'Candidate_Resume.pdf',
  uploadDate = 'Recently uploaded',
  atsScore = 87,
  hasResume = true,
  isPDF = true,
  fileFormat = 'PDF',
  isUploading = false,
  onPreview,
  onReplace,
}) => {
  const isFormatSupported = hasResume && isPDF;

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              !hasResume
                ? 'bg-kth-slate-100 text-kth-slate-400'
                : isFormatSupported
                ? 'bg-kth-primary-50 text-kth-primary-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {!hasResume ? (
              <FileText className="w-6 h-6" />
            ) : isFormatSupported ? (
              <FileText className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div className="min-w-0">
            <Badge
              variant={
                !hasResume
                  ? 'mono'
                  : isFormatSupported
                  ? 'indigo'
                  : 'rose'
              }
              className="mb-1"
            >
              {!hasResume
                ? 'No Resume Uploaded'
                : isFormatSupported
                ? 'Active Resume'
                : 'Unsupported Format'}
            </Badge>
            <h3 className="font-display font-bold text-base text-kth-slate-900 truncate">
              {hasResume ? fileName : 'No resume file attached'}
            </h3>
            <span className="text-xs text-kth-slate-500 block mt-0.5">
              {!hasResume
                ? 'Upload a PDF resume for verified applications and ATS ranking.'
                : isFormatSupported
                ? `Uploaded ${uploadDate} • PDF`
                : `Uploaded ${uploadDate} • ${fileFormat} (PDF Required)`}
            </span>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          {isFormatSupported && onPreview && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Eye className="w-4 h-4" />}
              onClick={onPreview}
            >
              Preview
            </Button>
          )}
          <Button
            variant={isFormatSupported ? 'primary' : 'emerald'}
            size="sm"
            leftIcon={<UploadCloud className="w-4 h-4" />}
            onClick={onReplace}
            isLoading={isUploading}
          >
            {isUploading
              ? 'Uploading Resume...'
              : !hasResume
              ? 'Upload Resume'
              : !isFormatSupported
              ? 'Replace with PDF'
              : 'Replace Resume'}
          </Button>
        </div>
      </div>

      <div className="bg-kth-slate-50 p-4 rounded-xl border border-kth-slate-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-kth-slate-700">ATS Formatting Compatibility</span>
          <span className="font-mono text-sm font-bold text-kth-accent-emerald">
            {isFormatSupported ? `${atsScore}%` : 'N/A'}
          </span>
        </div>
        <Progress value={isFormatSupported ? atsScore : 0} color="emerald" className="mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-kth-slate-600">
          <div><strong className="text-kth-slate-900">Keywords:</strong> {isFormatSupported ? '92%' : '—'}</div>
          <div><strong className="text-kth-slate-900">Structure:</strong> {isFormatSupported ? '88%' : '—'}</div>
          <div><strong className="text-kth-slate-900">Experience:</strong> {isFormatSupported ? '85%' : '—'}</div>
          <div><strong className="text-kth-slate-900">Skills:</strong> {isFormatSupported ? '83%' : '—'}</div>
        </div>
      </div>
    </Card>
  );
};
