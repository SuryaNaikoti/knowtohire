import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  Calendar,
  Bookmark,
  TrendingUp,
  Building2,
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

  useEffect(() => {
    if (!user) return;
    const fetchCompany = async () => {
      try {
        const { data: emp } = await supabase
          .from('employer_profiles')
          .select('company_profiles(name)')
          .eq('profile_id', user.id)
          .maybeSingle();

        const fetchedName = (emp?.company_profiles as any)?.name;
        if (fetchedName) {
          setCompanyName(fetchedName);
        }
      } catch (err) {
        console.debug('Could not load company in sidebar:', err);
      }
    };
    fetchCompany();
  }, [user]);

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
  }

  const navItems: NavItem[] = [
    { path: '/employer', label: 'Overview', icon: LayoutDashboard },
    { path: '/employer/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/employer/candidates', label: 'Candidates', icon: Users },
    { path: '/employer/pipeline', label: 'ATS Pipeline', icon: Kanban },
    { path: '/employer/interviews', label: 'Interviews', icon: Calendar },
    { path: '/employer/saved-candidates', label: 'Saved Candidates', icon: Bookmark },
    { path: '/employer/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/employer/company-profile', label: 'Company Profile', icon: Building2 },
    { path: '/employer/notifications', label: 'Notifications', icon: Bell },
    { path: '/employer/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={cn("w-64 h-full bg-white border-r border-kth-slate-200 flex flex-col p-4 shrink-0", className)}>
      {/* Company Identity Header */}
      <div className="flex items-center gap-2.5 px-3 py-3 mb-4 border-b border-kth-slate-100">
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
          onClick={onPostJobClick || (() => window.location.href = '/employer/jobs/new')}
        >
          Post a Job Listing
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-150 no-underline",
                isActive
                  ? "bg-kth-primary-50 text-kth-primary-700 font-bold"
                  : "text-kth-slate-600 hover:bg-kth-slate-100 hover:text-kth-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4", isActive ? "text-kth-primary-600" : "text-kth-slate-400")} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={cn(
                  "px-2 py-0.5 text-[10px] rounded-full font-mono",
                  isActive ? "bg-kth-primary-600 text-white" : "bg-kth-slate-100 text-kth-slate-600"
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
