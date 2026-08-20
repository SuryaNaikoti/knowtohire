import React, { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { candidateDiscoveryService, DiscoverableCandidate } from '@/services/candidateDiscoveryService';
import { savedCandidateService } from '@/services/savedCandidateService';
import { MapPin, FileText, CheckCircle2, ArrowLeft, Loader2, Bookmark, Mail, Phone } from 'lucide-react';

export interface EmployerCandidateDetailsPageProps {
  candidateId?: string;
}

export const EmployerCandidateDetailsPage: React.FC<EmployerCandidateDetailsPageProps> = ({ candidateId }) => {
  const activeId = candidateId || window.location.pathname.replace('/employer/candidates/', '');
  const [candidate, setCandidate] = useState<DiscoverableCandidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const res = await candidateDiscoveryService.getCandidateById(activeId);
      if (!isMounted) return;
      if (res.data) {
        setCandidate(res.data);
        const { data: savedStatus } = await savedCandidateService.isCandidateSaved(res.data.id);
        if (isMounted) setIsSaved(Boolean(savedStatus));
      }
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [activeId]);

  const handleToggleSave = async () => {
    if (!candidate) return;
    setSavingState(true);
    const next = !isSaved;
    setIsSaved(next);
    if (next) {
      await savedCandidateService.saveCandidate(candidate.id);
    } else {
      await savedCandidateService.unsaveCandidate(candidate.id);
    }
    setSavingState(false);
  };

  if (isLoading) {
    return (
      <EmployerShell title="Loading Candidate..." currentPath="/employer/candidates">
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
          <p className="text-xs text-kth-slate-500">Retrieving candidate profile record...</p>
        </div>
      </EmployerShell>
    );
  }

  if (!candidate) {
    return (
      <EmployerShell title="Candidate Not Found" currentPath="/employer/candidates">
        <Card className="p-8 text-center max-w-md mx-auto">
          <h3 className="font-display font-bold text-base text-kth-slate-900 mb-2">Candidate Not Found</h3>
          <p className="text-xs text-kth-slate-500 mb-4">The selected candidate profile could not be located.</p>
          <Button variant="primary" onClick={() => (window.location.href = '/employer/candidates')}>
            Return to Candidates
          </Button>
        </Card>
      </EmployerShell>
    );
  }

  return (
    <EmployerShell title={`Candidate Profile — ${candidate.name}`} currentPath="/employer/candidates">
      <div className="space-y-6">
        <button
          onClick={() => (window.location.href = '/employer/candidates')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-kth-slate-600 hover:text-kth-primary-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidate Discovery
        </button>

        {/* Recruiter Candidate Profile Header */}
        <Card className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kth-primary-600 to-kth-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-xs">
                {candidate.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="font-display text-2xl font-extrabold text-kth-slate-900">{candidate.name}</h1>
                  <Badge variant="emerald" hasPulse>
                    {candidate.profileCompletion}% Complete
                  </Badge>
                  <Badge variant="cyan">{candidate.domain}</Badge>
                </div>
                <p className="text-sm font-semibold text-kth-slate-700 mb-1">{candidate.headline}</p>
                <div className="flex items-center gap-4 text-xs text-kth-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-kth-slate-400" /> {candidate.location}
                  </span>
                  <span>{candidate.experienceYears}+ Years Exp.</span>
                  <span className="font-mono text-kth-primary-600 font-bold">
                    Exp: ₹{(candidate.expectedSalaryINR / 100000).toFixed(1)}L/yr
                  </span>
                  <span>Notice: {candidate.noticePeriodDays} Days</span>
                </div>
              </div>
            </div>

            {/* Recruiter Action Bar */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={isSaved ? 'secondary' : 'outline'}
                size="sm"
                disabled={savingState}
                onClick={handleToggleSave}
                leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-kth-primary-600 text-kth-primary-600' : ''}`} />}
              >
                {isSaved ? 'Saved to Bench' : 'Save Candidate'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => (window.location.href = `/employer/pipeline`)}
              >
                View in ATS Pipeline
              </Button>
            </div>
          </div>
        </Card>

        {/* Candidate Details & Resume Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-3">Professional Summary</h3>
              <p className="text-xs text-kth-slate-700 leading-relaxed">{candidate.experienceSummary}</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-3">Verified Skill Matrix</h3>
              <div className="flex gap-2 flex-wrap">
                {candidate.skills.map((sk, idx) => (
                  <Badge key={idx} variant="indigo" className="text-xs">
                    {sk}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-3">Education & Credentials</h3>
              <div className="bg-kth-slate-50 p-3.5 rounded-lg border border-kth-slate-200 text-xs">
                <strong className="font-bold text-kth-slate-900 block mb-1">
                  {candidate.educationSummary || 'Higher Education Degree'}
                </strong>
                <div className="space-y-1 text-kth-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Specialization in {candidate.domain}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-3">Direct Contact Channel</h3>
              <div className="space-y-3 text-xs text-kth-slate-700">
                <div className="flex items-center gap-2.5 p-3 bg-kth-slate-50 rounded-lg border border-kth-slate-200">
                  <Mail className="w-4 h-4 text-kth-primary-600" />
                  <span>{candidate.email || 'Email verified on platform'}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2.5 p-3 bg-kth-slate-50 rounded-lg border border-kth-slate-200">
                    <Phone className="w-4 h-4 text-kth-primary-600" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-bold text-base text-kth-slate-900 mb-3">Candidate Resume</h3>
              <div className="w-full h-48 bg-kth-slate-100 border border-kth-slate-200 rounded-lg flex flex-col items-center justify-center text-kth-slate-500 text-center p-4">
                <FileText className="w-10 h-10 opacity-40 mb-2 text-kth-primary-600" />
                <span className="text-xs font-semibold text-kth-slate-700">Resume Document</span>
                <span className="text-[11px] text-kth-slate-400 mt-1">Verified on KnowToHire</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </EmployerShell>
  );
};
