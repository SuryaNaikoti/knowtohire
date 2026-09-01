import React, { useState, useEffect } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { candidateProfileService, CandidateFullProfile, resumeService } from '@/services';
import { generateCandidatePdfDataUrl } from '@/utils/candidatePdfGenerator';
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  Download,
  Loader2,
} from 'lucide-react';

interface CandidateResumePreviewPageProps {
  onNavigate?: (path: string) => void;
}

export const CandidateResumePreviewPage: React.FC<CandidateResumePreviewPageProps> = ({ onNavigate }) => {
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
      window.history.pushState({}, '', '/candidate/resume');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const effectiveResumeUrl = React.useMemo(() => {
    if (profile?.resumeUrl && profile.resumeUrl.startsWith('data:application/pdf')) {
      return profile.resumeUrl;
    }
    if (profile?.resumeUrl && (profile.resumeUrl.startsWith('http') || profile.resumeUrl.startsWith('blob:'))) {
      return profile.resumeUrl;
    }
    // Generate valid ATS PDF Data URL fallback from candidate profile
    const candName = profile?.fullName || user?.user_metadata?.full_name || 'Surya Naikoti';
    return generateCandidatePdfDataUrl({
      fullName: candName,
      headline: profile?.headline || 'Senior Full Stack & Enterprise Software Engineer',
      email: profile?.email || user?.email || 'surya.naikoti@knowtohire.com',
      phone: profile?.phone || '+91 98765 43210',
      location: profile?.location || 'Hyderabad, Telangana, India',
      skills: profile?.skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Cloud Architecture'],
      bio: profile?.bio || 'Experienced engineering professional with proven expertise delivering scalable full-stack applications, distributed services, and business solutions.',
    });
  }, [profile, user]);

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

          {effectiveResumeUrl && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => window.open(effectiveResumeUrl, '_blank')}
              >
                Open in Full Window
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white text-xs font-bold shadow-xs"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = effectiveResumeUrl;
                  a.download = fileName;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
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
          ) : effectiveResumeUrl ? (
            <div className="w-full rounded-xl overflow-hidden border border-kth-slate-200 bg-kth-slate-50">
              <iframe
                src={`${effectiveResumeUrl}#toolbar=1&navpanes=0`}
                title="Resume Full Document Preview"
                className="w-full h-[780px] border-0 rounded-xl bg-white"
              />
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
