import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FunnelStageMetric } from '@/services';
import { Users, Filter, CheckCircle2, Calendar, Award, UserCheck } from 'lucide-react';

export interface HiringFunnelProps {
  stages?: FunnelStageMetric[];
  isLoading?: boolean;
  overallConversionRate?: number;
}

export const HiringFunnel: React.FC<HiringFunnelProps> = ({
  stages = [],
  isLoading = false,
  overallConversionRate = 0,
}) => {
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0: return { icon: Users, color: 'text-kth-primary-600', bg: 'bg-kth-primary-50' };
      case 1: return { icon: Filter, color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 2: return { icon: CheckCircle2, color: 'text-cyan-600', bg: 'bg-cyan-50' };
      case 3: return { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 4: return { icon: Award, color: 'text-teal-600', bg: 'bg-teal-50' };
      case 5: return { icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      default: return { icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  const defaultStages: FunnelStageMetric[] = [
    { stage: 'new', label: 'Applicants', count: 0, percentageOfTotal: 100, conversionFromPrevious: 100 },
    { stage: 'screening', label: 'Screened', count: 0, percentageOfTotal: 0, conversionFromPrevious: 0 },
    { stage: 'shortlisted', label: 'Shortlisted', count: 0, percentageOfTotal: 0, conversionFromPrevious: 0 },
    { stage: 'interview', label: 'Interviews', count: 0, percentageOfTotal: 0, conversionFromPrevious: 0 },
    { stage: 'offer', label: 'Offers', count: 0, percentageOfTotal: 0, conversionFromPrevious: 0 },
    { stage: 'hired', label: 'Hired', count: 0, percentageOfTotal: 0, conversionFromPrevious: 0 },
  ];

  const displayStages = stages.length > 0 ? stages : defaultStages;

  return (
    <Card className="p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Badge variant="indigo" className="mb-1">Recruitment Pipeline Analytics</Badge>
          <h3 className="font-display font-bold text-base text-kth-slate-900">Hiring Conversion Funnel</h3>
        </div>
        <span className="text-xs font-mono font-semibold text-kth-slate-500">
          {isLoading ? 'Calculating...' : `Overall Conversion: ${overallConversionRate}%`}
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-kth-slate-200 bg-kth-slate-50 h-28 space-y-2">
              <div className="h-3 bg-kth-slate-200 rounded w-1/2" />
              <div className="h-6 bg-kth-slate-200 rounded w-1/3" />
              <div className="h-3 bg-kth-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {displayStages.map((stage, idx) => {
            const { icon: Icon, color, bg } = getIcon(idx);
            return (
              <div key={idx} className={`p-4 rounded-xl border border-kth-slate-200 ${bg} flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-kth-slate-500">{stage.label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="font-mono text-2xl font-extrabold text-kth-slate-900">{stage.count}</div>
                {idx > 0 ? (
                  <div className="text-[10px] text-kth-slate-500 font-mono mt-1">
                    {stage.conversionFromPrevious}% from prev
                  </div>
                ) : (
                  <div className="text-[10px] text-kth-slate-400 font-mono mt-1">
                    100% Top of Funnel
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
