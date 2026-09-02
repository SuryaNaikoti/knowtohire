import React from 'react';
import { KPICard } from '@/components/data-display/KPICard';
import { RecruitmentOverview } from '@/services';
import { navigateTo } from '@/utils/navigation';
import { Briefcase, Users, Calendar, CheckCircle2 } from 'lucide-react';

export interface HiringKPIGridProps {
  overview?: RecruitmentOverview | null;
  isLoading?: boolean;
}

export const HiringKPIGrid: React.FC<HiringKPIGridProps> = ({
  overview,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
      <KPICard
        label="ACTIVE JOBS"
        value={isLoading ? '...' : overview?.activeJobs ?? 0}
        trendText="Live Requisitions"
        icon={<Briefcase className="w-4 h-4 text-kth-primary-600" />}
        onClick={() => navigateTo('/employer/jobs')}
        className="transition-all hover:border-kth-primary-300"
      />
      <KPICard
        label="TOTAL APPLICANTS"
        value={isLoading ? '...' : overview?.totalApplicants ?? 0}
        trendText="All Active Openings"
        icon={<Users className="w-4 h-4 text-kth-slate-600" />}
        onClick={() => navigateTo('/employer/pipeline')}
        className="transition-all hover:border-kth-slate-400"
      />
      <KPICard
        label="INTERVIEWS SCHEDULED"
        value={isLoading ? '...' : overview?.interviewsScheduled ?? 0}
        trendText={`${overview?.interviewsTotal ?? 0} total rounds`}
        icon={<Calendar className="w-4 h-4 text-kth-accent-cyan" />}
        onClick={() => navigateTo('/employer/interviews')}
        className="transition-all hover:border-cyan-300"
      />
      <KPICard
        label="CANDIDATES SHORTLISTED"
        value={isLoading ? '...' : overview?.shortlistedCount ?? 0}
        trendText={
          overview?.totalApplicants
            ? `${Math.round(((overview.shortlistedCount || 0) / overview.totalApplicants) * 100)}% qualified`
            : '0% qualified'
        }
        icon={<CheckCircle2 className="w-4 h-4 text-kth-accent-emerald" />}
        onClick={() => navigateTo('/employer/pipeline?stage=shortlisted')}
        className="transition-all hover:border-emerald-300"
      />
    </div>
  );
};
