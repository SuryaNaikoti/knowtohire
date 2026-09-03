import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, ArrowRight, Building2 } from 'lucide-react';
import { JobApplication, ApplicationStage } from '@/services';
import { formatINR } from '@/design-system/tokens';

export interface ApplicationCardProps {
  application: JobApplication;
  onViewDetails?: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onViewDetails }) => {
  const getStageMeta = (stage: ApplicationStage): { variant: 'indigo' | 'cyan' | 'emerald' | 'slate'; label: string } => {
    switch (stage) {
      case 'new':
        return { variant: 'indigo', label: 'Applied' };
      case 'screening':
        return { variant: 'cyan', label: 'Under Review' };
      case 'shortlisted':
        return { variant: 'emerald', label: 'Shortlisted' };
      case 'interview':
        return { variant: 'indigo', label: 'Interview Round' };
      case 'offer':
        return { variant: 'emerald', label: 'Offer Extended' };
      case 'hired':
        return { variant: 'emerald', label: 'Hired' };
      case 'rejected':
        return { variant: 'slate', label: 'Not Selected' };
      case 'withdrawn':
        return { variant: 'slate', label: 'Withdrawn' };
      default:
        return { variant: 'slate', label: stage };
    }
  };

  const stageMeta = getStageMeta(application.stage);
  const job = application.job;
  const isSalaryValid = job && ((job.min_salary_inr && job.min_salary_inr > 0) || (job.max_salary_inr && job.max_salary_inr > 0));
  const salaryText = isSalaryValid
    ? `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`
    : 'Salary not disclosed';

  const formattedDate = new Date(application.applied_at).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const year = new Date(application.applied_at).getFullYear() || 2026;
  const cleanId = application.id.replace(/^(demo-app-|app-)/, '').slice(0, 5).toUpperCase();
  const applicationRef = `KTH-${year}-${cleanId}`;

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      window.history.pushState({}, '', `/candidate/applications/${application.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <Card variant="interactive" className="p-4 sm:p-5 flex flex-col justify-between h-full font-sans">
      <div>
        <div className="flex justify-between items-start mb-2.5 sm:mb-3">
          <Badge variant={stageMeta.variant} hasPulse={application.stage !== 'withdrawn' && application.stage !== 'rejected'}>
            {stageMeta.label}
          </Badge>
          <span className="text-[10px] sm:text-[11px] font-medium text-kth-slate-400">
            {formattedDate}
          </span>
        </div>

        <h3 className="font-display font-bold text-sm sm:text-base text-kth-slate-900 mb-1 leading-snug">
          {job?.title || 'Job Opening'}
        </h3>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-kth-slate-500 mb-2.5 sm:mb-3">
          <span className="font-semibold text-kth-slate-700 flex items-center gap-1 truncate max-w-[160px]">
            <Building2 className="w-3.5 h-3.5 text-kth-slate-400 shrink-0" />
            <span className="truncate">{job?.company?.name || 'Verified Enterprise'}</span>
          </span>
          <span className="flex items-center gap-1 truncate max-w-[120px]">
            <MapPin className="w-3 h-3 text-kth-slate-400 shrink-0" />
            <span className="truncate">{job?.location || 'India'}</span>
          </span>
        </div>

        <div className="font-mono text-xs font-semibold text-kth-primary-600 mb-3">
          {salaryText}
        </div>

        {application.stage === 'interview' && (
          <div className="bg-cyan-50/70 p-2.5 rounded-lg border border-cyan-200 text-xs mb-3">
            <span className="font-bold text-cyan-900 uppercase text-[10px] block mb-0.5">NEXT STEP</span>
            <span className="font-semibold text-cyan-950">Interview Scheduled</span>
          </div>
        )}

        {application.stage === 'rejected' && (
          <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200 text-xs mb-3 text-rose-800">
            <span className="font-bold text-rose-900 uppercase text-[10px] block mb-0.5">APPLICATION CONCLUDED</span>
            Application process concluded. Candidate not selected for this opening.
          </div>
        )}

        {application.stage === 'withdrawn' && (
          <div className="bg-kth-slate-100 p-2.5 rounded-lg border border-kth-slate-200 text-xs mb-3 text-kth-slate-600">
            You withdrew this application on {application.withdrawn_at ? new Date(application.withdrawn_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'recently'}.
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-kth-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-kth-slate-400 font-medium">
          App <span className="font-mono text-kth-slate-600 font-semibold">#{applicationRef}</span>
        </span>
        <Button variant="secondary" size="sm" onClick={handleDetailsClick}>
          View Tracker <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
};
