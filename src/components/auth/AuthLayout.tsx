import React from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
  brandFeatures?: Array<{
    title: string;
    description?: string;
    icon?: React.ReactNode;
  }>;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  brandTitle = "Know More. Hire Better. Grow Faster.",
  brandSubtitle = "A unified platform connecting talent with real opportunities, verified resources, and expert guidance for a sustainable future in India.",
  brandFeatures = [
    {
      title: "Verified Opportunities",
      description: "From trusted employers",
    },
    {
      title: "Expert Resources",
      description: "For every career stage",
    },
    {
      title: "Sustainable Careers",
      description: "That create real impact",
    },
  ],
}) => {
  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-900">
      {/* Mobile Top Navigation Bar (Visible only on mobile / small screens < lg) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0B1020] border-b border-white/10 z-20 sticky top-0">
        <a
          href="/"
          onClick={handleBackToHome}
          className="flex items-center gap-2.5 no-underline group"
          aria-label="KnowToHire Home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5145F5] to-[#2D8CFF] flex items-center justify-center text-white text-base font-black shadow-sm">
            K
          </div>
          <span className="font-display font-black text-lg text-white tracking-tight">
            KnowToHire
          </span>
        </a>

        <a
          href="/"
          onClick={handleBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors no-underline px-2.5 py-1.5 rounded-md hover:bg-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </a>
      </div>

      {/* Main Split-Screen Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-screen w-full">
        {/* Left Side: Brand Panel (Desktop) */}
        <aside
          className="hidden lg:flex lg:w-[46%] xl:w-[48%] bg-[#0B1020] text-white flex-col justify-between p-10 xl:p-14 relative overflow-hidden shrink-0 border-r border-slate-800/60"
          aria-label="Brand Overview"
        >
          {/* Subtle Ambient Background Lighting / Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#5145F5]/25 via-[#2D8CFF]/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-t from-[#2D8CFF]/20 via-[#5145F5]/10 to-transparent rounded-full blur-3xl pointer-events-none -ml-36 -mb-36" />

          {/* Top: Logo & Back Link */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <a
              href="/"
              onClick={handleBackToHome}
              className="flex items-center gap-3 no-underline group"
              aria-label="KnowToHire Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5145F5] to-[#2D8CFF] flex items-center justify-center text-white text-lg font-black shadow-md group-hover:scale-105 transition-transform duration-200">
                K
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight">
                KnowToHire
              </span>
            </a>

            <a
              href="/"
              onClick={handleBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors no-underline px-3 py-1.5 rounded-lg hover:bg-white/5 border border-white/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to website</span>
            </a>
          </div>

          {/* Center: Brand Copy & Feature Highlights */}
          <div className="relative z-10 my-auto py-8 max-w-md xl:max-w-lg space-y-7">
            <div className="space-y-3">
              <h1 className="font-display text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                {brandTitle}
              </h1>
              <p className="text-sm xl:text-base text-slate-300 font-normal leading-relaxed">
                {brandSubtitle}
              </p>
            </div>

            {/* Feature Highlights */}
            {brandFeatures && brandFeatures.length > 0 && (
              <div className="space-y-4 pt-3">
                {brandFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#2D8CFF] shrink-0 mt-0.5 group-hover:bg-[#5145F5]/20 group-hover:border-[#5145F5]/40 transition-colors">
                      {feat.icon || <CheckCircle2 className="w-4 h-4 text-[#2D8CFF]" />}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-white tracking-tight">
                        {feat.title}
                      </h4>
                      {feat.description && (
                        <p className="text-xs text-slate-400 leading-relaxed font-normal">
                          {feat.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subtle Career-Themed Visual Treatment */}
            <div className="pt-4 opacity-90">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5145F5] to-[#2D8CFF] flex items-center justify-center text-white shrink-0 shadow-inner">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Direct & Verified Access</div>
                  <div className="text-[11px] text-slate-400">Trusted career opportunities, clean ATS pipelines, and zero spam.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Left Footer Info */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit SSL Encrypted Platform</span>
            </div>
            <span>© {new Date().getFullYear()} KnowToHire</span>
          </div>
        </aside>

        {/* Right Side: Form Panel */}
        <main
          className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16 bg-[#FAFBFC] overflow-y-auto"
          aria-label="Authentication Form"
        >
          {/* Top spacer on desktop */}
          <div className="hidden lg:block w-full" />

          {/* Center Form Container */}
          <div className="w-full max-w-[440px] mx-auto my-auto py-6 sm:py-8">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm sm:shadow-md p-6 sm:p-9">
              {children}
            </div>
          </div>

          {/* Bottom Right Legal Links */}
          <div className="w-full max-w-[440px] mx-auto pt-6 text-center text-xs text-slate-500">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <span className="text-slate-300">•</span>
              <a href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              <span className="text-slate-300">•</span>
              <a href="/contact" className="hover:text-slate-900 transition-colors">Need help? Contact support</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
