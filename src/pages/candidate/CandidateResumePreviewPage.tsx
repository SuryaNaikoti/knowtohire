import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { candidateProfileService, CandidateFullProfile, resumeService } from '@/services';
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  Download,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface CandidateResumePreviewPageProps {
  onNavigate?: (path: string) => void;
}

export const CandidateResumePreviewPage: React.FC<CandidateResumePreviewPageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<CandidateFullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileName, setFileName] = useState('Candidate_Resume.pdf');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [uploadDate, setUploadDate] = useState('Recently updated');

  useEffect(() => {
    candidateProfileService.getMyCandidateProfile().then((res) => {
      if (res.data) {
        setProfile(res.data);
        const effectiveUserId = user?.id || res.data.id || '00000000-0000-0000-0000-000000000001';
        const stored = resumeService.getStoredDemoResume(effectiveUserId) || (user?.id ? resumeService.getStoredDemoResume(user.id) : null);
        if (stored?.fileName) {
          setFileName(stored.fileName);
          const ext = stored.fileName.split('.').pop()?.toUpperCase();
          if (ext) setFileFormat(ext);
        }
        if (res.data.updatedAt) {
          setUploadDate(new Date(res.data.updatedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }));
        }
      }
      setIsLoading(false);
    });
  }, [user]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/candidate/resume');
    } else {
      navigate('/candidate/resume');
    }
  };

  const isPDF = fileFormat === 'PDF' || (profile?.resumeUrl && profile.resumeUrl.endsWith('.pdf'));

  return (
    <CandidateShell title="Resume Document Studio" currentPath="/candidate/resume">
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Resume Management & ATS Score</span>
          </button>
        </div>

        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="cyan" className="text-[10px] font-bold">
                {fileFormat} VERIFIED ASSET
              </Badge>
              <span className="text-xs text-slate-300 font-mono">Updated: {uploadDate}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">{fileName}</h1>
          </div>

          {profile?.resumeUrl && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => window.open(profile.resumeUrl!, '_blank')}
              >
                Open in Full Window
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white text-xs font-bold shadow-xs"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => window.open(profile.resumeUrl!, '_blank')}
              >
                Download PDF
              </Button>
            </div>
          )}
        </div>

        {/* Main Document Viewer */}
        <Card className="p-4 sm:p-6 bg-white border-kth-slate-200 shadow-sm">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500 font-medium">Loading resume preview...</p>
            </div>
          ) : profile?.resumeUrl && isPDF ? (
            <div className="w-full rounded-xl overflow-hidden border border-kth-slate-200 bg-kth-slate-50">
              <iframe
                src={`${profile.resumeUrl}#toolbar=1&navpanes=0`}
                title="Resume Full Document Preview"
                className="w-full h-[780px] border-0 rounded-xl bg-white"
              />
            </div>
          ) : profile?.resumeUrl && !isPDF ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-kth-slate-900">Word Document Preview Unavailable</h3>
                <p className="text-xs text-kth-slate-500 mt-1 leading-relaxed">
                  Word documents ({fileFormat}) cannot be rendered directly in browser PDF viewers. Please convert or re-upload your resume as a standardized PDF.
                </p>
              </div>
              <Button variant="primary" size="md" onClick={handleBack} className="text-xs font-bold">
                Return to Upload PDF
              </Button>
            </div>
          ) : (
            <div className="py-20 text-center text-kth-slate-500 text-xs space-y-3">
              <FileText className="w-10 h-10 text-kth-slate-300 mx-auto" />
              <p>No active resume document has been uploaded yet.</p>
              <Button variant="primary" size="sm" onClick={handleBack}>
                Upload Resume
              </Button>
            </div>
          )}
        </Card>
      </div>
    </CandidateShell>
  );
};
