import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  IndianRupee,
  LogOut,
  Menu,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';

export interface CreatorShellProps {
  title?: string;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  children: React.ReactNode;
}

export const CreatorShell: React.FC<CreatorShellProps> = ({
  title = 'Creator Monetization Studio',
  currentPath = '/creator',
  onNavigate,
  children,
}) => {
  const { logout, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/creator', label: 'Creator Dashboard', icon: LayoutDashboard },
    { path: '/knowledge', label: 'Knowledge Hub', icon: BookOpen },
    { path: '/templates', label: 'Template Marketplace', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await logout();
    if (onNavigate) {
      onNavigate('/login');
    } else {
      window.location.href = '/login';
    }
  };

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const displayName = profile?.full_name || 'Content Creator';
  const displayEmail = profile?.email || 'creator@knowtohire.com';

  return (
    <div className="min-h-screen bg-kth-slate-50 flex font-sans">
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-slate-900 text-white z-30 shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-white block">
                Know<span className="text-amber-400">To</span>Hire
              </span>
              <span className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider block">
                Creator Studio
              </span>
            </div>
          </button>
        </div>

        {/* Creator Persona Snippet */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded mt-1">
                <Sparkles className="w-2.5 h-2.5" /> Certified Creator
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer',
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-slate-950' : 'text-slate-400')} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <span>View Public Platform</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Canvas ──────────────────────────────────────────────────── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-kth-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-kth-slate-600 hover:bg-kth-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-extrabold text-lg sm:text-xl text-kth-slate-900 tracking-tight">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavClick('/creator')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
              <span>Earnings Hub</span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile Navigation Drawer ───────────────────────────────────────── */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Creator Studio Navigation"
      >
        <div className="space-y-4 font-sans text-left">
          <div className="p-3 bg-kth-slate-50 rounded-xl border border-kth-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-kth-slate-900 truncate">{displayName}</p>
              <p className="text-[11px] text-kth-slate-500 truncate">{displayEmail}</p>
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
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left',
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
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
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
