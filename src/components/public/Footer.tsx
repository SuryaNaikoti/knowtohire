import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-kth-slate-900 text-white pt-10 sm:pt-16 pb-8 sm:pb-12 border-t border-kth-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Info Column */}
          <div className="col-span-2 md:col-span-2 pr-0 sm:pr-4">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-base font-extrabold shadow-sm">
                K
              </div>
              <span className="font-display font-extrabold text-xl text-white">KnowToHire</span>
            </div>
            <p className="text-kth-slate-400 text-xs leading-relaxed max-w-sm mb-3 sm:mb-4">
              The unified career ecosystem connecting talent with verified job opportunities, study resources, and professional document templates in India.
            </p>
            <div className="font-display font-bold text-[11px] sm:text-xs text-kth-accent-cyan uppercase tracking-wider">
              Know More. Hire Better. Grow Faster.
            </div>
          </div>

          {/* Platform Links */}
          <div className="col-span-1">
            <h4 className="font-display font-bold text-xs text-kth-slate-400 uppercase tracking-wider mb-3 sm:mb-4">Platform</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs text-kth-slate-300">
              <li><a href="/jobs" className="hover:text-white transition-colors py-0.5 inline-block">Find Jobs</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors py-0.5 inline-block">Careers</a></li>
              <li><a href="/knowledge" className="hover:text-white transition-colors py-0.5 inline-block">Knowledge Hub</a></li>
              <li><a href="/templates" className="hover:text-white transition-colors py-0.5 inline-block">Templates</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors py-0.5 inline-block">Blog</a></li>
            </ul>
          </div>

          {/* For Employers & Candidates */}
          <div className="col-span-1">
            <h4 className="font-display font-bold text-xs text-kth-slate-400 uppercase tracking-wider mb-3 sm:mb-4">For Employers</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs text-kth-slate-300">
              <li><a href="/pricing" className="hover:text-white transition-colors py-0.5 inline-block">Post a Job</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors py-0.5 inline-block">Find Talent</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors py-0.5 inline-block">ATS Plans</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors py-0.5 inline-block">Pricing</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-display font-bold text-xs text-kth-slate-400 uppercase tracking-wider mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs text-kth-slate-300 grid grid-cols-2 sm:grid-cols-1">
              <li><a href="/about" className="hover:text-white transition-colors py-0.5 inline-block">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors py-0.5 inline-block">Contact</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors py-0.5 inline-block">Privacy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors py-0.5 inline-block">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-6 sm:pt-8 border-t border-kth-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-kth-slate-500 gap-3 text-center sm:text-left">
          <div>© {new Date().getFullYear()} KnowToHire.com India. All rights reserved.</div>
          <div className="flex gap-4 sm:gap-6">
            <a href="/privacy" className="hover:text-kth-slate-300 py-1">Privacy</a>
            <a href="/terms" className="hover:text-kth-slate-300 py-1">Terms</a>
            <a href="/contact" className="hover:text-kth-slate-300 py-1">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
