import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserMenuDropdown } from '@/components/navigation/UserMenuDropdown';

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
        console.debug('Could not load company name:', err);
      }
    };
    fetchCompany();
  }, [user]);

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
    <header className="h-16 bg-white border-b border-kth-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="xl:hidden p-2 rounded-md text-kth-slate-600 hover:bg-kth-slate-100">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-lg md:text-xl font-bold text-kth-slate-900 leading-tight">
            {title}
          </h1>
          <span className="text-[11px] text-kth-slate-500 font-medium hidden sm:inline-block">
            {companyName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
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
        <a href="/employer/notifications" className="relative p-2 rounded-md text-kth-slate-600 hover:bg-kth-slate-100 no-underline">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-kth-primary-600 ring-2 ring-white" />
        </a>

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
