import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  BookOpen,
  FileCheck,
  HelpCircle,
  Newspaper,
  ShieldAlert,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export interface AdminShellProps {
  title?: string;
  currentPath?: string;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  title = 'Platform Administration',
  currentPath = '/admin',
  children,
}) => {
  const { logout, profile, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Directory', icon: Users },
    { path: '/admin/employers', label: 'Employer Verification', icon: Building2 },
    { path: '/admin/jobs', label: 'Job Moderation', icon: Briefcase },
    { path: '/admin/resources', label: 'Knowledge Hub CMS', icon: BookOpen },
    { path: '/admin/templates', label: 'Templates Marketplace', icon: FileCheck },
    { path: '/admin/requests', label: 'Content Requests', icon: HelpCircle },
    { path: '/admin/blog', label: 'Editorial Blog CMS', icon: Newspaper },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-kth-slate-100 flex flex-col font-sans">
      {/* Top Admin Warning Bar */}
      <div className="bg-kth-slate-900 text-white px-4 py-1.5 text-xs flex justify-between items-center border-b border-kth-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold tracking-wide">KNOWTOHIRE MASTER ADMINISTRATION CONSOLE</span>
        </div>
        <div className="text-[11px] text-kth-slate-400 font-mono">
          Logged in as: <strong className="text-white">{profile?.email || user?.email}</strong>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Admin Sidebar */}
        <aside className="w-64 bg-white border-r border-kth-slate-200 hidden lg:flex flex-col p-4 shrink-0 justify-between">
          <div>
            <div className="flex items-center gap-2.5 px-3 py-3 mb-6 border-b border-kth-slate-100">
              <div className="w-8 h-8 rounded-lg bg-kth-slate-900 flex items-center justify-center text-amber-400 text-sm font-extrabold shadow-sm">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-sm text-kth-slate-900">Admin Portal</span>
                <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Superuser Access</span>
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
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors no-underline',
                      isActive
                        ? 'bg-kth-slate-900 text-white font-bold'
                        : 'text-kth-slate-600 hover:bg-kth-slate-100 hover:text-kth-slate-900'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-amber-400' : 'text-kth-slate-400')} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-kth-slate-200 space-y-2">
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-kth-slate-600 hover:text-kth-slate-900 rounded-lg hover:bg-kth-slate-100 no-underline"
            >
              Public Homepage
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="h-16 bg-white border-b border-kth-slate-200 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-kth-slate-600 hover:bg-kth-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="font-display font-extrabold text-lg text-kth-slate-900">{title}</h1>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
        </div>
      </div>
    </div>
  );
};
