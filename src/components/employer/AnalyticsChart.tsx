import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ApplicantTrendPoint } from '@/services';

export interface AnalyticsChartProps {
  data?: ApplicantTrendPoint[];
  isLoading?: boolean;
  totalCount?: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data = [],
  isLoading = false,
  totalCount = 0,
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 5);

  return (
    <Card className="p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Badge variant="indigo" className="mb-1">Applicant Volume Trend</Badge>
          <h3 className="font-display font-bold text-base text-kth-slate-900">Candidate Inflow Dynamics</h3>
        </div>
        <span className="font-mono text-xs font-bold text-kth-accent-emerald">
          {isLoading ? '...' : `Total: ${totalCount} Applicants`}
        </span>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="h-3 bg-kth-slate-200 rounded w-6" />
              <div className="w-full max-w-[48px] bg-kth-slate-200 rounded-t-md h-24" />
              <div className="h-3 bg-kth-slate-200 rounded w-10" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center bg-kth-slate-50 rounded-xl border border-dashed border-kth-slate-200 text-xs text-kth-slate-400">
          <span>No application trend points recorded for this period.</span>
        </div>
      ) : (
        /* SVG Bar Chart */
        <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 bg-kth-slate-50 rounded-xl border border-kth-slate-200">
          {data.map((item, idx) => {
            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="font-mono text-xs font-bold text-kth-primary-700">{item.count}</span>
                <div
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-kth-primary-600 to-kth-accent-cyan rounded-t-md transition-all duration-300 shadow-xs"
                />
                <span className="text-[11px] font-semibold text-kth-slate-600 truncate max-w-[70px] text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
