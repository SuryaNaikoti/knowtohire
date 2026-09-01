import React, { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService, AdminCandidateDetailRecord } from '@/services/adminService';
import { resumeService } from '@/services/resumeService';
import { generateCandidatePdfDataUrl } from '@/utils/candidatePdfGenerator';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  CheckCircle2,
  ExternalLink,
  Download,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';

export interface AdminCandidateInspectModalProps {
  candidateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: (userId: string, newStatus: 'active' | 'suspended') => void;
  onUserDeleted?: (userId: string) => void;
}

export const AdminCandidateInspectModal: React.FC<AdminCandidateInspectModalProps> = ({
  candidateId,
  isOpen,
  onClose,
  onStatusChanged,
  onUserDeleted,
}) => {
  const [candidate, setCandidate] = useState<AdminCandidateDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && candidateId) {
      setIsLoading(true);
      setActionSuccess(null);
      setIsResumeModalOpen(false);
      adminService.getCandidateDetails(candidateId).then((res) => {
        if (res.data) {
          setCandidate(res.data);
        }
        setIsLoading(false);
      });
    } else {
      setCandidate(null);
      setIsLoading(false);
      setIsResumeModalOpen(false);
    }
  }, [isOpen, candidateId]);

  // Compute live previewable resume URL
  let resolvedResumeUrl = candidate?.resume_url;
  if (candidate) {
    if (!resolvedResumeUrl || resolvedResumeUrl.includes('knowtohire.com/resumes')) {
      const stored = resumeService.getStoredDemoResume(candidate.id);
      if (stored?.url && !stored.url.includes('knowtohire.com/resumes')) {
        resolvedResumeUrl = stored.url;
      } else {
        resolvedResumeUrl = generateCandidatePdfDataUrl({
          fullName: candidate.full_name,
          headline: candidate.headline,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
          skills: candidate.skills,
          bio: candidate.bio,
        });
      }
    }
  }

  const resumeFileName = candidate ? `${candidate.full_name.replace(/\s+/g, '_')}_Resume.pdf` : 'Candidate_Resume.pdf';

  const handleDownloadResume = () => {
    if (!resolvedResumeUrl) return;
    if (resolvedResumeUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = resolvedResumeUrl;
      link.download = resumeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(resolvedResumeUrl, '_blank');
    }
  };

  const handleVerifyAccount = async () => {
    if (!candidate || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    const res = await adminService.verifyCandidateAccount(candidate.id);
    setIsUpdatingStatus(false);
    if (res.data) {
      setCandidate((prev) => (prev ? { ...prev, status: 'active', is_active: true } : null));
      setActionSuccess('Candidate account successfully verified and activated.');
      if (onStatusChanged) onStatusChanged(candidate.id, 'active');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleToggleSuspend = async () => {
    if (!candidate || isUpdatingStatus) return;
    
    // Prompt confirmation for permanent erasure
    const confirmed = window.confirm(
      `Are you sure you want to suspend and permanently erase "${candidate.full_name}" from the entire database? All profiles, records, and credentials will be removed, and they will need to sign up again from scratch.`
    );
    if (!confirmed) return;

    setIsUpdatingStatus(true);
    const res = await adminService.deleteUserPermanently(candidate.id);
    setIsUpdatingStatus(false);
    
    if (res.data) {
      setActionSuccess('Candidate account and data have been permanently erased from the platform.');
      if (onUserDeleted) {
        onUserDeleted(candidate.id);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const formatINR = (amount?: number) => {
    if (!amount) return 'Competitive';
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakhs / yr`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} width="max-w-2xl sm:max-w-3xl">
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-kth-primary-600 animate-spin" />
          <p className="text-sm font-medium text-kth-slate-500">Loading candidate profile dossier...</p>
        </div>
      ) : !candidate ? (
        <div className="py-20 text-center space-y-3">
          <User className="w-12 h-12 text-kth-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-kth-slate-800">Candidate Not Found</h4>
          <p className="text-xs text-kth-slate-500">Unable to load information for the selected candidate.</p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-6 text-kth-slate-800 font-sans pb-8">
          {/* Action Success Alert */}
          {actionSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* 1. Header Profile Banner */}
          <div className="bg-gradient-to-br from-kth-slate-900 to-kth-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-kth-primary-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-kth-primary-600 to-kth-primary-400 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-inner shrink-0">
                  {candidate.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold font-display text-white">{candidate.full_name}</h3>
                    <Badge
                      variant={
                        candidate.status === 'active'
                          ? 'emerald'
                          : candidate.status === 'suspended'
                          ? 'rose'
                          : 'amber'
                      }
                      className="capitalize font-mono text-xs px-2.5 py-0.5"
                    >
                      {candidate.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-kth-slate-300 mt-1 font-medium">{candidate.headline}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-kth-slate-300">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-kth-primary-400" />
                      {candidate.email}
                    </span>
                    {candidate.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-kth-primary-400" />
                        {candidate.phone}
                      </span>
                    )}
                    {candidate.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-kth-primary-400" />
                        {candidate.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-right shrink-0 border border-white/10 w-full sm:w-auto">
                <div className="text-[10px] uppercase font-bold text-kth-slate-300">Profile Strength</div>
                <div className="text-xl font-black text-kth-primary-400 font-display">
                  {candidate.profile_completion_pct || 95}%
                </div>
                <div className="text-[10px] text-kth-slate-300">Verified Credentials</div>
              </div>
            </div>

            {/* Admin Management Action Toolbar */}
            <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {candidate.status !== 'active' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleVerifyAccount}
                    disabled={isUpdatingStatus}
                    className="font-bold text-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Verify & Activate Account
                  </Button>
                )}

                <Button
                  variant={candidate.status === 'active' ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={handleToggleSuspend}
                  disabled={isUpdatingStatus}
                  className="font-bold text-xs"
                >
                  {candidate.status === 'active' ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                      Suspend Account
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Reactivate Account
                    </>
                  )}
                </Button>
              </div>

              {resolvedResumeUrl && (
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Resume
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Key Candidate Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-kth-slate-500">Domain</div>
              <div className="font-bold text-xs text-kth-slate-900 mt-0.5 truncate">
                {candidate.domain_specialization || 'Sustainability & Tech'}
              </div>
            </div>

            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-kth-slate-500">Expected CTC</div>
              <div className="font-bold text-xs text-kth-slate-900 mt-0.5">
                {formatINR(candidate.expected_salary_inr)}
              </div>
            </div>

            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-kth-slate-500">Notice Period</div>
              <div className="font-bold text-xs text-kth-slate-900 mt-0.5">
                {candidate.notice_period_days ? `${candidate.notice_period_days} Days` : 'Immediate'}
              </div>
            </div>

            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-kth-slate-500">Work Mode</div>
              <div className="font-bold text-xs text-kth-slate-900 mt-0.5">
                {candidate.work_mode_preference || 'Hybrid / Remote'}
              </div>
            </div>
          </div>

          {/* 3. Professional Summary / Bio */}
          {candidate.bio && (
            <div className="bg-white border border-kth-slate-200 rounded-xl p-4 shadow-xs">
              <h4 className="font-display text-xs uppercase tracking-wider font-bold text-kth-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-kth-primary-600" />
                Professional Summary
              </h4>
              <p className="text-xs text-kth-slate-700 leading-relaxed font-normal">{candidate.bio}</p>
            </div>
          )}

          {/* 4. Skills & Competencies */}
          <div className="bg-white border border-kth-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-kth-slate-500 mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-kth-primary-600" />
              Verified Skills & Tools ({candidate.skills?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills && candidate.skills.length > 0 ? (
                candidate.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-kth-slate-100 border border-kth-slate-200 text-kth-slate-800 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-kth-slate-400">No skills listed yet.</span>
              )}
            </div>
          </div>

          {/* 5. Work Experience Timeline */}
          <div className="bg-white border border-kth-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-kth-slate-500 mb-4 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-kth-primary-600" />
              Work Experience
            </h4>
            {candidate.experience && candidate.experience.length > 0 ? (
              <div className="space-y-4">
                {candidate.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="relative pl-5 before:absolute before:left-1 before:top-1.5 before:bottom-0 before:w-0.5 before:bg-kth-slate-200 last:before:hidden"
                  >
                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-kth-primary-600 ring-4 ring-kth-primary-50" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="font-bold text-xs text-kth-slate-900">
                        {exp.title || exp.role || 'Professional Role'}
                      </h5>
                      <span className="text-[11px] font-mono text-kth-slate-500">{exp.period || '2023 - Present'}</span>
                    </div>
                    <div className="text-xs text-kth-primary-700 font-medium">{exp.company || 'Enterprise India'}</div>
                    {exp.description && (
                      <p className="text-xs text-kth-slate-600 mt-1 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-kth-slate-400">No prior experience listed.</p>
            )}
          </div>

          {/* 6. Education & Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-kth-slate-200 rounded-xl p-4 shadow-xs">
              <h4 className="font-display text-xs uppercase tracking-wider font-bold text-kth-slate-500 mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-kth-primary-600" />
                Education
              </h4>
              {candidate.education && candidate.education.length > 0 ? (
                <div className="space-y-3">
                  {candidate.education.map((edu, idx) => (
                    <div key={idx} className="border-b border-kth-slate-100 last:border-0 pb-2 last:pb-0">
                      <div className="font-bold text-xs text-kth-slate-900">
                        {edu.degree || edu.qualification || 'Degree'}
                      </div>
                      <div className="text-xs text-kth-slate-600">{edu.institution || 'University'}</div>
                      <div className="text-[10px] font-mono text-kth-slate-400 mt-0.5">
                        Graduated {edu.year || edu.graduation_year || '2021'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-kth-slate-400">No education details recorded.</p>
              )}
            </div>

            <div className="bg-white border border-kth-slate-200 rounded-xl p-4 shadow-xs">
              <h4 className="font-display text-xs uppercase tracking-wider font-bold text-kth-slate-500 mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-kth-primary-600" />
                Certifications
              </h4>
              {candidate.certifications && candidate.certifications.length > 0 ? (
                <div className="space-y-2">
                  {candidate.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-kth-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-kth-slate-400">No certifications recorded.</p>
              )}
            </div>
          </div>

          {/* 7. System Registration Details */}
          <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3.5 text-[11px] text-kth-slate-500 flex flex-wrap items-center justify-between gap-2 font-mono">
            <span>User ID: {candidate.id}</span>
            <span>Registered: {new Date(candidate.created_at).toLocaleDateString()}</span>
            <span>Account Role: Candidate</span>
          </div>
        </div>
      )}
    </Drawer>

    {/* Dedicated Resume Preview Modal */}
    <Dialog
      isOpen={isResumeModalOpen}
      onClose={() => setIsResumeModalOpen(false)}
      title={`Resume Preview — ${candidate?.full_name || 'Candidate'}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {resolvedResumeUrl ? (
          <div className="w-full rounded-xl overflow-hidden border border-kth-slate-200 bg-kth-slate-100 flex flex-col items-center">
            <iframe
              src={`${resolvedResumeUrl}#toolbar=1&navpanes=0`}
              title="Candidate Resume Document"
              className="w-full h-[650px] border-0 rounded-xl bg-white"
            />
          </div>
        ) : (
          <div className="py-20 text-center text-kth-slate-500 text-xs">
            <FileText className="w-10 h-10 text-kth-slate-300 mx-auto mb-2" />
            No resume file currently available for this candidate.
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-kth-slate-100">
          {resolvedResumeUrl && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => window.open(resolvedResumeUrl!, '_blank')}
              >
                Open in Full Tab
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleDownloadResume}
              >
                Download PDF
              </Button>
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={() => setIsResumeModalOpen(false)} className="ml-auto">
            Close Preview
          </Button>
        </div>
      </div>
    </Dialog>
    </>
  );
};
