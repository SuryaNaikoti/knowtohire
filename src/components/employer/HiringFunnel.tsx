import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FunnelStageMetric } from '@/services';
import { navigateTo } from '@/utils/navigation';
import { Users, Filter, CheckCircle2, Calendar, Award, UserCheck, ArrowUpRight } from 'lucide-react';

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
      case 0: return { icon: Users, color: 'text-kth-primary-600', bg: 'bg-kth-primary-50/70 hover:bg-kth-primary-50' };
      case 1: return { icon: Filter, color: 'text-indigo-600', bg: 'bg-indigo-50/70 hover:bg-indigo-50' };
      case 2: return { icon: CheckCircle2, color: 'text-cyan-600', bg: 'bg-cyan-50/70 hover:bg-cyan-50' };
      case 3: return { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50/70 hover:bg-blue-50' };
      case 4: return { icon: Award, color: 'text-teal-600', bg: 'bg-teal-50/70 hover:bg-teal-50' };
      case 5: return { icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/70 hover:bg-emerald-50' };
      default: return { icon: Users, color: 'text-slate-600', bg: 'bg-slate-50/70 hover:bg-slate-50' };
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

  const handleStageClick = (stageName: string) => {
    switch (stageName) {
      case 'interview':
        navigateTo('/employer/interviews');
        break;
      case 'new':
        navigateTo('/employer/pipeline?stage=new');
        break;
      case 'screening':
        navigateTo('/employer/pipeline?stage=screening');
        break;
      case 'shortlisted':
        navigateTo('/employer/pipeline?stage=shortlisted');
        break;
      case 'offer':
        navigateTo('/employer/pipeline?stage=offer');
        break;
      case 'hired':
        navigateTo('/employer/pipeline?stage=hired');
        break;
      default:
        navigateTo('/employer/pipeline');
        break;
    }
  };

  return (
    <Card className="p-6 font-sans shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
        <div>
          <Badge variant="indigo" className="mb-1.5">Recruitment Pipeline Analytics</Badge>
          <h3 className="font-display font-bold text-base text-kth-slate-900">Hiring Conversion Funnel</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-kth-slate-500">
            {isLoading ? 'Calculating...' : `Overall Conversion: ${overallConversionRate}%`}
          </span>
          <button
            type="button"
            onClick={() => navigateTo('/employer/pipeline')}
            className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Full Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {displayStages.map((stage, idx) => {
            const { icon: Icon, color, bg } = getIcon(idx);
            return (
              <div
                key={idx}
                onClick={() => handleStageClick(stage.stage)}
                title={`Click to view ${stage.label} stage in pipeline`}
                className={`p-3 sm:p-4 rounded-xl border border-kth-slate-200 ${bg} flex flex-col justify-between cursor-pointer transition-all duration-150 hover:shadow-sm hover:border-kth-primary-300 hover:-translate-y-0.5 active:scale-[0.98] group`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-1">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-kth-slate-500 group-hover:text-kth-slate-900 transition-colors truncate">
                    {stage.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${color}`} />
                </div>
                <div className="font-mono text-xl sm:text-2xl font-extrabold text-kth-slate-900 group-hover:text-kth-primary-700 transition-colors my-0.5">
                  {stage.count}
                </div>
                {idx > 0 ? (
                  <div className="text-[9px] sm:text-[10px] text-kth-slate-500 font-mono mt-0.5 flex items-center justify-between truncate">
                    <span className="truncate">{stage.conversionFromPrevious}% prev</span>
                    <ArrowUpRight className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-100 text-kth-primary-600 transition-opacity" />
                  </div>
                ) : (
                  <div className="text-[9px] sm:text-[10px] text-kth-slate-400 font-mono mt-0.5 flex items-center justify-between truncate">
                    <span className="truncate">100% Top</span>
                    <ArrowUpRight className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-100 text-kth-primary-600 transition-opacity" />
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
