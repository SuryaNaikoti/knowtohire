import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/* ── Reusable Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid-auth" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid-auth)" />
    </svg>
  </div>
);

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex-1 min-h-[calc(100vh-76px)] bg-slate-50 flex items-center justify-center py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(0,56,141,0.04),transparent_50%)] pointer-events-none" />
      <DotGrid className="text-slate-400 opacity-20" />

      <div className="max-w-md w-full relative z-10 space-y-8 bg-white/70 backdrop-blur-md border border-slate-200 p-8 md:p-10 rounded-[32px] shadow-premium hover:shadow-elevated transition-shadow duration-300">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900 leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
