import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  companyProfileService,
  jobService,
  applicationService,
  interviewService,
  savedCandidateService,
  notificationService,
} from '@/services';
import { Button } from '@/components/ui/Button';
import { navigateTo } from '@/utils/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  Calendar,
  Bookmark,
  TrendingUp,
  Building2,
  BookOpen,
  FileCheck2,
  Bell,
  Settings,
  Plus,
} from 'lucide-react';

export interface EmployerSidebarProps {
  currentPath?: string;
  className?: string;
  onPostJobClick?: () => void;
}

export const EmployerSidebar: React.FC<EmployerSidebarProps> = ({
  currentPath = '/employer',
  className,
  onPostJobClick,
}) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState<string>(
    (user?.user_metadata?.company_name as string) || 'Enterprise ATS'
  );

  // Dynamic live metric counters
  const [counts, setCounts] = useState<{
    jobs?: number;
    candidates?: number;
    pipeline?: number;
    interviews?: number;
    saved?: number;
    notifications?: number;
  }>({});

  const fetchCompany = useCallback(async () => {
    try {
      const res = await companyProfileService.getMyCompanyProfile();
      if (res.data?.name) {
        setCompanyName(res.data.name);
      }
    } catch (err) {
      console.debug('Could not load company in sidebar:', err);
    }
  }, []);

  const refreshCounts = useCallback(async () => {
    try {
      const [jobsRes, appsRes, interviewsRes, savedRes, unreadNotifs] = await Promise.all([
        jobService.getEmployerJobs(),
        applicationService.getCompanyApplicants({ pageSize: 100 }),
        interviewService.getEmployerInterviews(),
        savedCandidateService.getMySavedCandidates(),
        notificationService.getUnreadCount(),
      ]);

      const publishedJobs = jobsRes.data?.data?.filter((j) => j.status === 'published')?.length ?? 0;
      const allApps = appsRes.data?.data ?? [];
      const activePipelineApps = allApps.filter(
        (a) => a.stage !== 'rejected' && a.stage !== 'withdrawn' && a.stage !== 'hired'
      ).length;
      const scheduledInterviews = interviewsRes.data?.filter((i) => i.status === 'scheduled')?.length ?? 0;
      const savedCount = savedRes.data?.length ?? 0;

      setCounts({
        jobs: publishedJobs,
        candidates: allApps.length > 0 ? allApps.length : undefined,
        pipeline: activePipelineApps > 0 ? activePipelineApps : (allApps.length > 0 ? allApps.length : undefined),
        interviews: scheduledInterviews > 0 ? scheduledInterviews : undefined,
        saved: savedCount > 0 ? savedCount : undefined,
        notifications: unreadNotifs > 0 ? unreadNotifs : undefined,
      });
    } catch (err) {
      console.debug('Could not refresh sidebar metric counts:', err);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
    refreshCounts();

    const handleCompanyUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ name?: string }>;
      if (custom.detail?.name) {
        setCompanyName(custom.detail.name);
      } else {
        fetchCompany();
      }
    };

    const handleDataChanged = () => {
      refreshCounts();
    };

    window.addEventListener('kth_company_profile_updated', handleCompanyUpdated);
    window.addEventListener('kth_jobs_changed', handleDataChanged);
    window.addEventListener('kth_applications_changed', handleDataChanged);
    window.addEventListener('kth_interviews_changed', handleDataChanged);
    window.addEventListener('kth_saved_candidates_changed', handleDataChanged);
    window.addEventListener('kth_notifications_changed', handleDataChanged);

    // Periodic time-to-time sync (every 30 seconds)
    const interval = setInterval(refreshCounts, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('kth_company_profile_updated', handleCompanyUpdated);
      window.removeEventListener('kth_jobs_changed', handleDataChanged);
      window.removeEventListener('kth_applications_changed', handleDataChanged);
      window.removeEventListener('kth_interviews_changed', handleDataChanged);
      window.removeEventListener('kth_saved_candidates_changed', handleDataChanged);
      window.removeEventListener('kth_notifications_changed', handleDataChanged);
    };
  }, [fetchCompany, refreshCounts]);

  const initials =
    companyName
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'EA';

  interface NavItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeVariant?: 'primary' | 'cyan' | 'amber' | 'emerald';
  }

  const navItems: NavItem[] = [
    { path: '/employer', label: 'Overview', icon: LayoutDashboard },
    { path: '/employer/jobs', label: 'Jobs', icon: Briefcase, count: counts.jobs },
    { path: '/employer/candidates', label: 'Candidates', icon: Users, count: counts.candidates },
    { path: '/employer/pipeline', label: 'ATS Pipeline', icon: Kanban, count: counts.pipeline },
    { path: '/employer/interviews', label: 'Interviews', icon: Calendar, count: counts.interviews },
    { path: '/employer/saved-candidates', label: 'Saved Candidates', icon: Bookmark, count: counts.saved },
    { path: '/employer/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/employer/knowledge', label: 'Knowledge Hub', icon: BookOpen },
    { path: '/employer/templates', label: 'Templates & Kits', icon: FileCheck2 },
    { path: '/employer/company-profile', label: 'Company Profile', icon: Building2 },
    { path: '/employer/notifications', label: 'Notifications', icon: Bell, count: counts.notifications },
    { path: '/employer/settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigateTo(path);
  };

  return (
    <aside className={cn("w-64 h-full bg-white border-r border-kth-slate-200 flex flex-col p-4 shrink-0", className)}>
      {/* Company Identity Header */}
      <div
        onClick={() => navigateTo('/employer/company-profile')}
        className="flex items-center gap-2.5 px-3 py-3 mb-4 border-b border-kth-slate-100 cursor-pointer hover:bg-kth-slate-50/70 rounded-xl transition-colors"
        title="View Company Profile"
      >
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-kth-primary-600 to-kth-slate-900 flex items-center justify-center text-white text-xs font-extrabold shadow-sm shrink-0">
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-display font-extrabold text-sm text-kth-slate-900 truncate" title={companyName}>
            {companyName}
          </span>
          <span className="text-[10px] font-semibold text-kth-primary-600 uppercase tracking-wider">Employer ATS</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="px-1 mb-4">
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-center shadow-xs"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onPostJobClick || (() => navigateTo('/employer/jobs/new'))}
        >
          Post a Job Listing
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-150 no-underline group",
                isActive
                  ? "bg-kth-primary-50 text-kth-primary-700 font-bold shadow-2xs"
                  : "text-kth-slate-600 hover:bg-kth-slate-100 hover:text-kth-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-kth-primary-600" : "text-kth-slate-400 group-hover:text-kth-slate-600")} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={cn(
                  "px-2 py-0.5 text-[10px] rounded-full font-mono font-bold shrink-0 ml-1.5",
                  isActive ? "bg-kth-primary-600 text-white" : "bg-kth-slate-100 text-kth-slate-700 border border-kth-slate-200"
                )}>
                  {item.count}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};
