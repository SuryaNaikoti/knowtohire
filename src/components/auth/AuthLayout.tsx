import React from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  badgeText,
}) => {
  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col justify-between items-center py-6 sm:py-10 px-4 relative overflow-hidden font-sans select-none">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-kth-primary-500/10 via-kth-accent-cyan/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Branding & Back Link */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 px-2 sm:px-4 mb-4 sm:mb-6">
        <a
          href="/"
          onClick={handleBackToHome}
          className="flex items-center gap-2.5 no-underline group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-base font-extrabold shadow-sm group-hover:scale-105 transition-transform">
            K
          </div>
          <span className="font-display font-extrabold text-lg sm:text-xl text-kth-slate-900 tracking-tight">
            KnowToHire
          </span>
        </a>

        <a
          href="/"
          onClick={handleBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors no-underline px-3 py-1.5 rounded-lg hover:bg-kth-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to website</span>
        </a>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-[460px] mx-auto z-10 my-auto">
        <div className="bg-white rounded-2xl border border-kth-slate-200/90 shadow-xl p-6 sm:p-9 space-y-6 animate-scale-in">
          {/* Card Header */}
          {(title || subtitle || badgeText) && (
            <div className="text-left space-y-1.5">
              {badgeText && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-kth-primary-50 text-kth-primary-700 border border-kth-primary-200 text-[11px] font-bold tracking-wide uppercase mb-1">
                  <Sparkles className="w-3 h-3 text-kth-primary-600" />
                  <span>{badgeText}</span>
                </div>
              )}
              {title && (
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-kth-slate-900 tracking-tight leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-kth-slate-500 font-normal leading-relaxed text-pretty">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Form Content */}
          <div className="pt-1">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center pt-6 z-10 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-kth-slate-500">
          <div className="flex items-center gap-1 text-kth-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span className="hidden sm:inline text-kth-slate-300">•</span>
          <span>© {new Date().getFullYear()} KnowToHire</span>
          <span className="hidden sm:inline text-kth-slate-300">•</span>
          <div className="flex items-center gap-3">
            <a href="/privacy" className="hover:text-kth-primary-600 underline">Privacy Policy</a>
            <a href="/terms" className="hover:text-kth-primary-600 underline">Terms of Service</a>
            <a href="/contact" className="hover:text-kth-primary-600 underline">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
