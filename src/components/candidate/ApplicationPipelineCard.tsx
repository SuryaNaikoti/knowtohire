import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BarChart2 } from 'lucide-react';
import { JobApplication, ApplicationStage } from '@/services';

export interface ApplicationPipelineCardProps {
  applications: JobApplication[];
  onViewAll?: () => void;
}

interface StageConfig {
  label: string;
  barColor: string;
  labelColor: string;
}

const STAGE_CONFIG: Record<ApplicationStage, StageConfig> = {
  new:          { label: 'Applied',     barColor: 'bg-kth-slate-300',        labelColor: 'text-kth-slate-600' },
  screening:    { label: 'Screening',   barColor: 'bg-kth-accent-cyan',      labelColor: 'text-kth-slate-700' },
  shortlisted:  { label: 'Shortlisted', barColor: 'bg-kth-primary-400',      labelColor: 'text-kth-primary-700' },
  interview:    { label: 'Interview',   barColor: 'bg-kth-primary-600',      labelColor: 'text-kth-primary-800' },
  offer:        { label: 'Offer',       barColor: 'bg-kth-accent-emerald',   labelColor: 'text-kth-accent-emerald' },
  hired:        { label: 'Hired',       barColor: 'bg-kth-accent-emerald',   labelColor: 'text-kth-accent-emerald' },
  rejected:     { label: 'Rejected',    barColor: 'bg-kth-semantic-error/60', labelColor: 'text-kth-slate-400' },
  withdrawn:    { label: 'Withdrawn',   barColor: 'bg-kth-slate-200',        labelColor: 'text-kth-slate-400' },
};

// Ordered stages shown in the pipeline view (active stages first)
const PIPELINE_STAGES: ApplicationStage[] = [
  'interview', 'shortlisted', 'screening', 'new', 'offer', 'hired',
];
const SECONDARY_STAGES: ApplicationStage[] = ['rejected', 'withdrawn'];

export const ApplicationPipelineCard: React.FC<ApplicationPipelineCardProps> = ({
  applications,
  onViewAll,
}) => {
  const total = applications.length;

  const stageCounts = applications.reduce<Partial<Record<ApplicationStage, number>>>(
    (acc, app) => {
      acc[app.stage] = (acc[app.stage] || 0) + 1;
      return acc;
    },
    {}
  );

  const activeCount = PIPELINE_STAGES.filter(s => !['rejected', 'withdrawn'].includes(s))
    .reduce((sum, s) => sum + (stageCounts[s] || 0), 0);

  // Only show stages that have at least 1 application
  const visiblePrimary = PIPELINE_STAGES.filter(s => (stageCounts[s] || 0) > 0);
  const visibleSecondary = SECONDARY_STAGES.filter(s => (stageCounts[s] || 0) > 0);

  return (
    <Card className="p-5 border-l-4 border-l-kth-accent-emerald space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-kth-accent-emerald" />
          <span className="text-[10px] font-bold text-kth-slate-500 uppercase tracking-wider">
            Your Pipeline
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-kth-slate-500">
          {total} total
        </span>
      </div>

      {/* Stage breakdown */}
      <div className="space-y-2">
        {visiblePrimary.map(stage => {
          const count = stageCounts[stage] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const config = STAGE_CONFIG[stage];
          return (
            <div key={stage} className="flex items-center gap-2.5">
              <span className={`text-[11px] font-semibold w-20 shrink-0 ${config.labelColor}`}>
                {config.label}
              </span>
              <div className="flex-1 h-1.5 bg-kth-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.barColor} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-kth-slate-700 w-4 text-right">
                {count}
              </span>
            </div>
          );
        })}

        {/* Secondary / closed stages — show as subtle footnote */}
        {visibleSecondary.length > 0 && (
          <div className="pt-1 border-t border-kth-slate-100">
            {visibleSecondary.map(stage => {
              const count = stageCounts[stage] || 0;
              const config = STAGE_CONFIG[stage];
              return (
                <div key={stage} className="flex items-center justify-between py-0.5">
                  <span className={`text-[10px] font-medium ${config.labelColor}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] font-mono text-kth-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary line */}
      {activeCount > 0 && (
        <p className="text-[11px] text-kth-slate-500 leading-snug">
          <span className="font-bold text-kth-slate-800">{activeCount}</span> application
          {activeCount !== 1 ? 's' : ''} currently in progress
        </p>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={onViewAll}
      >
        View All Applications <ArrowRight className="w-3 h-3" />
      </Button>
    </Card>
  );
};
