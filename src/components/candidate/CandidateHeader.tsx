import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserMenuDropdown } from '@/components/navigation/UserMenuDropdown';

export interface CandidateHeaderProps {
  title?: string;
  onSearchClick?: () => void;
  onMobileMenuToggle?: () => void;
}

export const CandidateHeader: React.FC<CandidateHeaderProps> = ({
  title = 'Candidate Dashboard',
  onSearchClick,
  onMobileMenuToggle,
}) => {
  const { profile } = useAuth();

  const fullName = profile?.full_name || 'Candidate';
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const avatarText = getInitials(fullName);

  return (
    <header className="h-16 bg-white border-b border-kth-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="xl:hidden p-2 rounded-md text-kth-slate-600 hover:bg-kth-slate-100">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display text-lg md:text-xl font-bold text-kth-slate-900 leading-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Palette Trigger */}
        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-kth-slate-100 border border-kth-slate-200 text-xs text-kth-slate-500 hover:bg-kth-slate-200/60 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-kth-slate-400" />
          <span>Search jobs, e-books...</span>
          <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-kth-slate-200">Cmd+K</kbd>
        </button>

        {/* Notifications Icon with Unread Indicator */}
        <a href="/candidate/notifications" className="relative p-2 rounded-md text-kth-slate-600 hover:bg-kth-slate-100 no-underline">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-kth-primary-600 ring-2 ring-white" />
        </a>

        {/* Interactive Candidate Account Dropdown */}
        <UserMenuDropdown
          name={fullName}
          roleLabel="Candidate"
          avatarText={avatarText}
          profilePath="/candidate/profile"
          settingsPath="/candidate/settings"
          avatarBgColor="bg-kth-primary-100"
          avatarTextColor="text-kth-primary-700"
        />
      </div>
    </header>
  );
};
