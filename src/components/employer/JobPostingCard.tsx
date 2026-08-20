import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Job, JobStatus } from '@/services';
import { formatINR } from '@/design-system/tokens';
import { MapPin, ArrowRight, Play, Trash2 } from 'lucide-react';

export interface JobPostingCardProps {
  job: Job;
  onViewApplicants?: () => void;
  onEdit?: () => void;
  onPublish?: () => void;
  onPause?: () => void;
  onCloseJob?: () => void;
  onReopen?: () => void;
  onDeleteDraft?: () => void;
  isActionLoading?: boolean;
}

export const JobPostingCard: React.FC<JobPostingCardProps> = ({
  job,
  onViewApplicants,
  onEdit,
  onPublish,
  onPause,
  onCloseJob,
  onReopen,
  onDeleteDraft,
  isActionLoading = false,
}) => {
  const getStatusMeta = (status: JobStatus): { variant: 'emerald' | 'slate' | 'amber' | 'rose'; label: string } => {
    switch (status) {
      case 'published':
        return { variant: 'emerald', label: 'Published' };
      case 'draft':
        return { variant: 'slate', label: 'Draft' };
      case 'paused':
        return { variant: 'amber', label: 'Paused' };
      case 'closed':
        return { variant: 'rose', label: 'Closed' };
      default:
        return { variant: 'slate', label: status };
    }
  };

  const statusMeta = getStatusMeta(job.status);
  const salaryText = `${formatINR(job.min_salary_inr)} - ${formatINR(job.max_salary_inr, true)}`;

  const formattedDate = new Date(job.published_at || job.created_at).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card variant="interactive" className="p-5 flex flex-col justify-between h-full font-sans">
      <div>
        <div className="flex justify-between items-start mb-3">
          <Badge variant={statusMeta.variant} hasPulse={job.status === 'published'}>
            {statusMeta.label}
          </Badge>
          <span className="text-[10px] font-mono text-kth-slate-400">
            {job.published_at ? `Published ${formattedDate}` : `Created ${formattedDate}`}
          </span>
        </div>

        <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1 leading-snug">
          {job.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-kth-slate-500 mb-3">
          <span className="font-semibold text-kth-slate-700">{job.department}</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-kth-slate-400" /> {job.location}
            {job.is_remote && ' (Remote)'}
          </span>
        </div>

        <div className="font-mono text-xs font-semibold text-kth-primary-600 mb-4">
          {salaryText}
        </div>

        {/* Lifecycle Status Specific Guidance */}
        {job.status === 'draft' && (
          <div className="bg-kth-slate-100 p-2.5 rounded-lg border border-kth-slate-200 text-[11px] text-kth-slate-600 mb-4">
            Draft only. This opening is invisible to candidates and public search.
          </div>
        )}

        {job.status === 'paused' && (
          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-800 mb-4">
            Temporarily paused. New applications are currently suspended.
          </div>
        )}

        {job.status === 'closed' && (
          <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-[11px] text-rose-800 mb-4">
            Requisition closed. Position is archived.
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-kth-slate-100 space-y-2.5">
        {/* Action Controls based on Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {job.status === 'draft' && (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit || (() => window.location.href = `/employer/jobs/${job.id}/edit`)}
                >
                  Edit
                </Button>
                {onDeleteDraft && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={onDeleteDraft}
                    disabled={isActionLoading}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onPublish}
                disabled={isActionLoading}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Publish Job
              </Button>
            </>
          )}

          {job.status === 'published' && (
            <>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit || (() => window.location.href = `/employer/jobs/${job.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPause}
                  disabled={isActionLoading}
                  className="text-amber-700 hover:bg-amber-50"
                >
                  Pause
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCloseJob}
                  disabled={isActionLoading}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Close
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onViewApplicants || (() => window.location.href = `/employer/jobs/${job.id}/applicants`)}
              >
                Applicants <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          )}

          {job.status === 'paused' && (
            <>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit || (() => window.location.href = `/employer/jobs/${job.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCloseJob}
                  disabled={isActionLoading}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Close
                </Button>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onReopen || onPublish}
                disabled={isActionLoading}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Resume
              </Button>
            </>
          )}

          {job.status === 'closed' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewApplicants || (() => window.location.href = `/employer/jobs/${job.id}/applicants`)}
              >
                View Applicants
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReopen}
                disabled={isActionLoading}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Reopen
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
