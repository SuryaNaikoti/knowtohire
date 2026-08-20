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
        return { variant: 'slate', label: 'Archived' };
      case 'withdrawn':
        return { variant: 'slate', label: 'Withdrawn' };
      default:
        return { variant: 'slate', label: stage };
    }
  };

  const stageMeta = getStageMeta(application.stage);
  const job = application.job;
  const salaryText = job
    ? `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`
    : 'Competitive Salary';

  const formattedDate = new Date(application.applied_at).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      window.history.pushState({}, '', `/candidate/applications/${application.id}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <Card variant="interactive" className="p-5 flex flex-col justify-between h-full font-sans">
      <div>
        <div className="flex justify-between items-start mb-3">
          <Badge variant={stageMeta.variant} hasPulse={application.stage !== 'withdrawn' && application.stage !== 'rejected'}>
            {stageMeta.label}
          </Badge>
          <span className="text-[11px] font-medium text-kth-slate-400">
            {formattedDate}
          </span>
        </div>

        <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1 leading-snug">
          {job?.title || 'Job Opening'}
        </h3>

        <div className="flex items-center gap-3 text-xs text-kth-slate-500 mb-3">
          <span className="font-semibold text-kth-slate-700 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-kth-slate-400" />
            {job?.company?.name || 'Verified Enterprise'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-kth-slate-400" />
            {job?.location || 'India'}
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

        {application.stage === 'withdrawn' && (
          <div className="bg-kth-slate-100 p-2.5 rounded-lg border border-kth-slate-200 text-xs mb-3 text-kth-slate-600">
            You withdrew this application on {application.withdrawn_at ? new Date(application.withdrawn_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'recently'}.
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-kth-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-kth-slate-400 font-medium">
          ID: <span className="font-mono">{application.id.slice(0, 8)}</span>
        </span>
        <Button variant="secondary" size="sm" onClick={handleDetailsClick}>
          View Tracker <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
};
