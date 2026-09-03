import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { companyProfileService, notificationService } from '@/services';
import { UserMenuDropdown } from '@/components/navigation/UserMenuDropdown';
import { navigateTo } from '@/utils/navigation';

export interface EmployerHeaderProps {
  title?: string;
  onSearchClick?: () => void;
  onMobileMenuToggle?: () => void;
}

export const EmployerHeader: React.FC<EmployerHeaderProps> = ({
  title = "Employer Dashboard",
  onSearchClick,
  onMobileMenuToggle,
}) => {
  const { user, profile } = useAuth();
  const [companyName, setCompanyName] = useState<string>(
    (user?.user_metadata?.company_name as string) || 'Enterprise Portal'
  );
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await companyProfileService.getMyCompanyProfile();
        if (res.data?.name) {
          setCompanyName(res.data.name);
        }
      } catch (err) {
        console.debug('Could not load company name:', err);
      }
    };
    fetchCompany();

    const fetchUnread = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadNotifCount(count);
      } catch {
        // ignore
      }
    };
    fetchUnread();

    const handleCompanyUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ name?: string }>;
      if (custom.detail?.name) {
        setCompanyName(custom.detail.name);
      } else {
        fetchCompany();
      }
    };

    const handleNotifsChanged = () => {
      fetchUnread();
    };

    const handleProfileUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ full_name?: string }>;
      if (custom.detail?.full_name) {
        // Triggers re-render if needed
      }
    };

    window.addEventListener('kth_company_profile_updated', handleCompanyUpdated);
    window.addEventListener('kth_profile_updated', handleProfileUpdated);
    window.addEventListener('kth_notifications_changed', handleNotifsChanged);
    window.addEventListener('kth_applications_changed', handleNotifsChanged);
    window.addEventListener('kth_interviews_changed', handleNotifsChanged);

    return () => {
      window.removeEventListener('kth_company_profile_updated', handleCompanyUpdated);
      window.removeEventListener('kth_profile_updated', handleProfileUpdated);
      window.removeEventListener('kth_notifications_changed', handleNotifsChanged);
      window.removeEventListener('kth_applications_changed', handleNotifsChanged);
      window.removeEventListener('kth_interviews_changed', handleNotifsChanged);
    };
  }, [user, profile]);

  const fullName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string) ||
    'Employer Admin';

  const avatarText =
    fullName
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'EA';

  return (
    <header className="h-16 bg-white border-b border-kth-slate-200 px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 w-full min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          aria-label="Open employer navigation menu"
          className="xl:hidden p-2 rounded-lg text-kth-slate-600 hover:bg-kth-slate-100 hover:text-kth-slate-900 shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1
            className="font-display text-sm sm:text-base md:text-xl font-bold text-kth-slate-900 leading-tight truncate"
            title={title}
          >
            {title}
          </h1>
          <span className="text-[11px] text-kth-slate-500 font-medium hidden sm:inline-block truncate max-w-[200px]">
            {companyName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        {/* Global Cmd + K Search Trigger */}
        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-kth-slate-100 border border-kth-slate-200 text-xs text-kth-slate-500 hover:bg-kth-slate-200/60 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-kth-slate-400" />
          <span>Search applicants, jobs...</span>
          <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-kth-slate-200">Cmd+K</kbd>
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigateTo('/employer/notifications')}
          className="relative p-2 rounded-md text-kth-slate-600 hover:bg-kth-slate-100 transition-colors cursor-pointer"
          title={`${unreadNotifCount} unread notifications`}
          aria-label="Recruiter notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-kth-primary-600 ring-2 ring-white" />
          )}
        </button>

        {/* Interactive Employer Account Dropdown */}
        <UserMenuDropdown
          name={fullName}
          roleLabel="Talent Acquisition"
          avatarText={avatarText}
          profilePath="/employer/company-profile"
          settingsPath="/employer/settings"
          avatarBgColor="bg-kth-slate-900"
          avatarTextColor="text-white"
        />
      </div>
    </header>
  );
};
