import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  IndianRupee,
  LogOut,
  Menu,
  Sparkles,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { UserMenuDropdown } from '@/components/navigation/UserMenuDropdown';
import { CommandPalette } from '@/components/ui/CommandPalette';

export interface CreatorShellProps {
  title?: string;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  children: React.ReactNode;
}

export const CreatorShell: React.FC<CreatorShellProps> = ({
  title = 'Creator Studio & Monetization',
  currentPath = '/creator',
  onNavigate,
  children,
}) => {
  const { logout, profile, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const navItems = [
    { path: '/creator', label: 'Dashboard & Earnings', icon: LayoutDashboard },
    { path: '/knowledge', label: 'Knowledge Hub E-Books', icon: BookOpen },
    { path: '/templates', label: 'Template Marketplace', icon: FileCheck2 },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string) ||
    'Creator Partner';
  const displayEmail = profile?.email || user?.email || 'creator@knowtohire.com';

  const avatarText =
    displayName
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CP';

  return (
    <div className="min-h-screen bg-kth-slate-50 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden xl:flex w-64 flex-col bg-white border-r border-kth-slate-200 p-4 shrink-0">
          {/* Brand Identity Header */}
          <div
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 px-3 py-3 mb-4 border-b border-kth-slate-100 cursor-pointer hover:bg-kth-slate-50/70 rounded-xl transition-colors"
            title="KnowToHire Home"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-base font-extrabold shadow-sm shrink-0">
              K
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-extrabold text-sm text-kth-slate-900 tracking-tight leading-none">
                KnowToHire
              </span>
              <span className="text-[10px] font-semibold text-kth-primary-600 uppercase tracking-wider mt-1">
                Creator Studio
              </span>
            </div>
          </div>

          {/* Creator Persona Snippet */}
          <div className="px-3.5 py-3 mb-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-kth-primary-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {avatarText}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-kth-slate-900 truncate">{displayName}</p>
                <p className="text-[10px] text-kth-slate-500 truncate">{displayEmail}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded mt-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Certified Creator
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer',
                    isActive
                      ? 'bg-kth-primary-50 text-kth-primary-700 font-bold border border-kth-primary-100 shadow-2xs'
                      : 'text-kth-slate-600 hover:text-kth-slate-900 hover:bg-kth-slate-100/80'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-kth-primary-600' : 'text-kth-slate-400')} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="pt-3 border-t border-kth-slate-200 space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 rounded-lg hover:bg-kth-slate-100/80 transition-colors"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-kth-slate-400" />
            </button>
          </div>
        </aside>

        {/* ── Main Content Stream ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header Bar */}
          <header className="h-16 bg-white border-b border-kth-slate-200 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 w-full min-w-0 shadow-2xs">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="xl:hidden p-2 rounded-lg text-kth-slate-600 hover:bg-kth-slate-100 hover:text-kth-slate-900 shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-display text-sm sm:text-base md:text-xl font-bold text-kth-slate-900 leading-tight truncate">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Search Palette Trigger */}
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-kth-slate-100 border border-kth-slate-200 text-xs text-kth-slate-500 hover:bg-kth-slate-200/60 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-kth-slate-400" />
                <span>Search assets...</span>
                <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-kth-slate-200">Cmd+K</kbd>
              </button>

              {/* Earnings Hub Indicator */}
              <button
                type="button"
                onClick={() => handleNavClick('/creator')}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monetization Active</span>
              </button>

              {/* User Menu Dropdown */}
              <UserMenuDropdown
                name={displayName}
                roleLabel="Certified Creator"
                avatarText={avatarText}
                profilePath="/creator"
                settingsPath="/creator"
                avatarBgColor="bg-kth-primary-100"
                avatarTextColor="text-kth-primary-700"
              />
            </div>
          </header>

          {/* Main Body Canvas */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ───────────────────────────────────────── */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Creator Studio Menu"
      >
        <div className="space-y-4 font-sans text-left">
          <div className="p-3 bg-kth-slate-50 rounded-xl border border-kth-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kth-primary-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm">
              {avatarText}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-kth-slate-900 truncate">{displayName}</p>
              <p className="text-[11px] text-kth-slate-500 truncate">{displayEmail}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded mt-0.5">
                Certified Creator
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left',
                    isActive
                      ? 'bg-kth-primary-50 text-kth-primary-700 font-bold border border-kth-primary-100'
                      : 'text-kth-slate-700 hover:bg-kth-slate-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-kth-slate-200">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Global Cmd + K Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
};
