import React from 'react';
import { KPICard } from '@/components/data-display/KPICard';
import { FileCheck, Calendar, Bookmark, Target } from 'lucide-react';

export interface CandidateKPIGridProps {
  applicationsCount?: number;
  interviewsCount?: number;
  savedJobsCount?: number;
  profileStrength?: number;
  isLoading?: boolean;
  onApplicationsClick?: () => void;
  onInterviewsClick?: () => void;
  onSavedJobsClick?: () => void;
  onProfileClick?: () => void;
}

export const CandidateKPIGrid: React.FC<CandidateKPIGridProps> = ({
  applicationsCount = 0,
  interviewsCount = 0,
  savedJobsCount = 0,
  profileStrength = 0,
  isLoading = false,
  onApplicationsClick,
  onInterviewsClick,
  onSavedJobsClick,
  onProfileClick,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard
        label="APPLICATIONS SENT"
        value={isLoading ? '—' : applicationsCount}
        trendText={applicationsCount > 0 ? 'Active submissions' : 'Start applying'}
        isTrendPositive={applicationsCount > 0}
        icon={<FileCheck className="w-4 h-4 text-kth-primary-600" />}
        onClick={onApplicationsClick}
      />
      <KPICard
        label="INTERVIEWS SCHEDULED"
        value={isLoading ? '—' : interviewsCount}
        trendText={interviewsCount > 0 ? 'Upcoming rounds' : 'None pending'}
        isTrendPositive={interviewsCount > 0}
        icon={<Calendar className="w-4 h-4 text-kth-accent-cyan" />}
        onClick={onInterviewsClick}
      />
      <KPICard
        label="SAVED JOBS"
        value={isLoading ? '—' : savedJobsCount}
        trendText={savedJobsCount > 0 ? 'Bookmarked roles' : 'Save for later'}
        isTrendPositive={savedJobsCount > 0}
        icon={<Bookmark className="w-4 h-4 text-kth-slate-500" />}
        onClick={onSavedJobsClick}
      />
      <KPICard
        label="PROFILE STRENGTH"
        value={isLoading ? '—' : `${profileStrength}%`}
        trendText={
          profileStrength >= 100
            ? 'Profile complete'
            : profileStrength >= 90
            ? 'Almost complete'
            : profileStrength >= 70
            ? 'Good progress'
            : 'Needs attention'
        }
        isTrendPositive={profileStrength >= 70}
        icon={<Target className="w-4 h-4 text-kth-accent-emerald" />}
        onClick={onProfileClick}
      />
    </div>
  );
};
