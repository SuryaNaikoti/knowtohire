import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/design-system/tokens';
import {
  ArrowLeft,
  Building2,
  MapPin,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface EmployerJobPreviewPageProps {
  onNavigate?: (path: string) => void;
}

export const EmployerJobPreviewPage: React.FC<EmployerJobPreviewPageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('kth_job_preview_data');
      if (raw) {
        setJobData(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/employer/jobs/new');
    } else {
      window.history.pushState({}, '', '/employer/jobs/new');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const title = jobData?.title || 'Lead Environmental & ESG Assurance Specialist';
  const department = jobData?.department || 'Sustainability & Compliance';
  const location = jobData?.location || 'Bengaluru, Karnataka (Hybrid)';
  const minSalary = Number(jobData?.min_salary_inr || 1800000);
  const maxSalary = Number(jobData?.max_salary_inr || 2600000);
  const description = jobData?.description || 'Lead corporate sustainability audits and ESG compliance for enterprise stakeholders.';
  const responsibilities = jobData?.responsibilities || ['Conduct statutory audits', 'Lead Scope 1 & 2 carbon accounting'];
  const requirements = jobData?.requirements || ['5+ years experience in environmental auditing', 'Certified lead auditor qualification'];
  const skills = jobData?.skills || ['BRSR Core', 'GHG Protocol', 'ESG Assurance'];

  return (
    <EmployerShell title="Job Requisition Candidate Preview" currentPath="/employer/jobs">
      <div className="space-y-6 max-w-4xl mx-auto font-sans">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Editor</span>
          </button>
          <Badge variant="amber" className="text-[11px] font-bold">
            <Eye className="w-3.5 h-3.5 mr-1" />
            LIVE CANDIDATE VIEW SIMULATION
          </Badge>
        </div>

        {/* Position Summary Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="text-[10px] font-bold">
              VERIFIED REQUISITION
            </Badge>
            <span className="text-xs text-indigo-300 font-semibold">{department}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>

          <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap pt-1">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Building2 className="w-4 h-4 text-cyan-400" /> Verified Enterprise
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" /> {location}
            </span>
            <span className="flex items-center gap-1.5 font-mono font-bold text-cyan-300">
              {formatINR(minSalary)} - {formatINR(maxSalary, true)}
            </span>
          </div>
        </div>

        {/* Requisition Details Card */}
        <Card className="p-6 sm:p-8 bg-white border-kth-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider">Position Overview</h3>
            <p className="text-xs sm:text-sm text-kth-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {description}
            </p>
          </div>

          {responsibilities.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-kth-slate-100">
              <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider">Key Responsibilities</h3>
              <ul className="space-y-2 list-none pl-0">
                {responsibilities.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-kth-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requirements.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-kth-slate-100">
              <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider">Requirements & Qualifications</h3>
              <ul className="space-y-2 list-none pl-0">
                {requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-kth-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-kth-primary-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-kth-slate-100">
              <h3 className="text-sm font-bold text-kth-slate-900 uppercase tracking-wider">Required Skills & Frameworks</h3>
              <div className="flex gap-2 flex-wrap">
                {skills.map((s: string, idx: number) => (
                  <Badge key={idx} variant="indigo" className="text-xs font-semibold">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={handleBack} className="text-xs font-semibold">
            Return to Editor
          </Button>
        </div>
      </div>
    </EmployerShell>
  );
};
