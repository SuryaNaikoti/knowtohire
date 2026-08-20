import React from 'react';
import { Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  roleTitle: string;
  stepCount: number;
  currentStep: number;
  sidebar?: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  roleTitle,
  sidebar,
}) => {
  const { user, profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-kth-slate-50 flex flex-col font-sans">
      {/* Top Fixed Header */}
      <header className="bg-white border-b border-kth-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Positioning */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2.5 no-underline group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-lg font-extrabold shadow-sm group-hover:scale-105 transition-transform">
                K
              </div>
              <div>
                <span className="font-display font-extrabold text-xl text-kth-slate-900 tracking-tight leading-none block">
                  KnowToHire
                </span>
                <span className="text-[10px] font-semibold text-kth-primary-600 tracking-wide block uppercase mt-0.5">
                  Know More. Hire Better. Grow Faster.
                </span>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-kth-slate-200">
              <span className="px-2.5 py-0.5 rounded-full bg-kth-primary-50 text-kth-primary-700 border border-kth-primary-200 text-xs font-semibold">
                {roleTitle}
              </span>
            </div>
          </div>

          {/* User Account / Security Info & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-kth-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{profile?.email || user?.email || 'Authenticated User'}</span>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-kth-slate-600 hover:text-red-600 hover:bg-red-50 border border-kth-slate-200 hover:border-red-200 transition-colors"
              title="Sign Out & Resume Later"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save & Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Progress Steps Sidebar (Desktop) */}
          {sidebar && (
            <div className="hidden lg:block lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-xl border border-kth-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-kth-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-kth-primary-600" />
                  <span>Onboarding Roadmap</span>
                </div>
                {sidebar}
              </div>
            </div>
          )}

          {/* Right Active Form Container */}
          <div className={`${sidebar ? 'lg:col-span-8' : 'max-w-3xl mx-auto w-full'}`}>
            <div className="bg-white rounded-2xl border border-kth-slate-200 shadow-sm p-6 sm:p-8 md:p-10">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-6 border-t border-kth-slate-200 text-center text-xs text-kth-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} KnowToHire — India&apos;s Sustainability & ESG Career Intelligence</span>
          <div className="flex items-center gap-4 text-kth-slate-400 text-[11px]">
            <span>End-to-End SSL Encrypted</span>
            <span>•</span>
            <a href="/privacy" className="hover:text-kth-primary-600 underline">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-kth-primary-600 underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
