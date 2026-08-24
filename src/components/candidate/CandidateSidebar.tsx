import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { savedJobService } from '@/services';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Bookmark,
  FileCheck,
  Calendar,
  Sparkles,
  HelpCircle,
  Bell,
  Settings,
} from 'lucide-react';

function useSidebarCounts() {
  const [counts, setCounts] = useState({
    applications: 0,
    savedJobs: 0,
    interviews: 0,
    notifications: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      let userId: string | null = null;
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        userId = authData.user.id;
      } else if (typeof window !== 'undefined' && window.localStorage) {
        const storedDemo = window.localStorage.getItem('kth_demo_auth_session');
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo);
            if (parsed?.role === 'candidate' && parsed?.id) userId = parsed.id;
          } catch {
            // ignore
          }
        }
      }

      if (!userId) userId = '00000000-0000-0000-0000-000000000001';

      const [appsResult, savedResult, interviewResult, notifResult] = await Promise.all([
        supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', userId),
        savedJobService.getMySavedJobs(),
        supabase
          .from('interviews')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', userId)
          .eq('status', 'scheduled'),
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false),
      ]);

      if (!cancelled) {
        setCounts({
          applications: appsResult.count ?? 0,
          savedJobs: savedResult.data ? savedResult.data.length : 0,
          interviews: interviewResult.count ?? 0,
          notifications: notifResult.count ?? 0,
        });
      }
    };

    fetchCounts();

    const handleSavedChanged = () => {
      fetchCounts();
    };
    window.addEventListener('kth_saved_jobs_changed', handleSavedChanged);

    return () => {
      cancelled = true;
      window.removeEventListener('kth_saved_jobs_changed', handleSavedChanged);
    };
  }, []);

  return counts;
}

export interface CandidateSidebarProps {
  currentPath?: string;
  className?: string;
}

export const CandidateSidebar: React.FC<CandidateSidebarProps> = ({
  currentPath = '/candidate',
  className,
}) => {
  const liveCounts = useSidebarCounts();

  const navItems = [
    { path: '/candidate', label: 'Overview', icon: LayoutDashboard },
    { path: '/candidate/profile', label: 'My Profile', icon: User },
    { path: '/candidate/resume', label: 'Resume & ATS', icon: FileText },
    { path: '/candidate/jobs', label: 'Find Jobs', icon: Briefcase },
    {
      path: '/candidate/saved-jobs',
      label: 'Saved Jobs',
      icon: Bookmark,
      count: liveCounts.savedJobs > 0 ? liveCounts.savedJobs : undefined,
    },
    {
      path: '/candidate/applications',
      label: 'Applications',
      icon: FileCheck,
      count: liveCounts.applications > 0 ? liveCounts.applications : undefined,
    },
    {
      path: '/candidate/interviews',
      label: 'Interviews',
      icon: Calendar,
      count: liveCounts.interviews > 0 ? liveCounts.interviews : undefined,
    },
    { path: '/candidate/career-insights', label: 'Career Insights', icon: Sparkles },
    { path: '/candidate/requests', label: 'Content Requests', icon: HelpCircle },
    {
      path: '/candidate/notifications',
      label: 'Notifications',
      icon: Bell,
      count: liveCounts.notifications > 0 ? liveCounts.notifications : undefined,
    },
    { path: '/candidate/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'w-64 h-full bg-white border-r border-kth-slate-200 flex flex-col p-4 shrink-0',
        className
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-3 mb-6 border-b border-kth-slate-100">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-base font-extrabold shadow-sm">
          K
        </div>
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-base text-kth-slate-900 leading-none">
            KnowToHire
          </span>
          <span className="text-[10px] font-semibold text-kth-primary-600 uppercase tracking-wider mt-0.5">
            Candidate Portal
          </span>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-150 no-underline',
                isActive
                  ? 'bg-kth-primary-50 text-kth-primary-700 font-bold'
                  : 'text-kth-slate-600 hover:bg-kth-slate-100 hover:text-kth-slate-900'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isActive ? 'text-kth-primary-600' : 'text-kth-slate-400'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] rounded-full font-mono font-bold',
                    isActive
                      ? 'bg-kth-primary-600 text-white'
                      : 'bg-kth-primary-100 text-kth-primary-700'
                  )}
                >
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
