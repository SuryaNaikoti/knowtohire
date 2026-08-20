import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Briefcase, BookOpen, FileText, Users, ShieldAlert, Settings, LogOut } from 'lucide-react';

export interface SidebarProps {
  portalType: 'candidate' | 'employer' | 'admin';
  activeItem?: string;
  onItemSelect?: (id: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portalType = 'candidate',
  activeItem = 'dashboard',
  onItemSelect,
  className,
}) => {
  const candidateNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'My Applications', icon: Briefcase, count: 14 },
    { id: 'saved', label: 'Saved Jobs', icon: Briefcase, count: 8 },
    { id: 'insights', label: 'Career Insights', icon: BookOpen },
    { id: 'templates', label: 'Resume Builder', icon: FileText },
  ];

  const employerNav = [
    { id: 'dashboard', label: 'ATS Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'Active Listings', icon: Briefcase, count: 12 },
    { id: 'applicants', label: 'Candidate Pipeline', icon: Users, count: 42 },
    { id: 'company', label: 'Employer Profile', icon: Briefcase },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Governance Health', icon: LayoutDashboard },
    { id: 'users', label: 'User Operations', icon: Users, count: 148 },
    { id: 'moderation', label: 'Content Audit', icon: ShieldAlert, count: 5 },
    { id: 'financials', label: 'Revenue & GMV', icon: FileText },
  ];

  const items = portalType === 'candidate' ? candidateNav : portalType === 'employer' ? employerNav : adminNav;

  return (
    <aside className={cn("w-64 h-full bg-white border-r border-kth-slate-200 flex flex-col justify-between p-4", className)}>
      <div>
        <div className="px-3 py-2 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-kth-slate-400">
            {portalType} Portal
          </span>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onItemSelect?.(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-colors duration-150 select-none",
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
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-kth-slate-100 space-y-1">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-kth-slate-600 hover:bg-kth-slate-100 rounded-md">
          <Settings className="w-4 h-4 text-kth-slate-400" />
          <span>Account Settings</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-kth-semantic-error hover:bg-red-50 rounded-md">
          <LogOut className="w-4 h-4 text-kth-semantic-error" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
