import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-kth-slate-900 text-white pt-16 pb-12 border-t border-kth-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info Column */}
          <div className="col-span-2 md:col-span-2 pr-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-base font-extrabold shadow-sm">
                K
              </div>
              <span className="font-display font-extrabold text-xl text-white">KnowToHire</span>
            </div>
            <p className="text-kth-slate-400 text-xs leading-relaxed max-w-sm mb-4">
              The unified career ecosystem connecting talent with verified job opportunities, study resources, and professional document templates in India.
            </p>
            <div className="font-display font-bold text-xs text-kth-accent-cyan uppercase tracking-wider">
              Know More. Hire Better. Grow Faster.
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display font-bold text-xs text-kth-slate-400 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-kth-slate-300">
              <li><a href="/jobs" className="hover:text-white transition-colors">Find Jobs</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Career Categories</a></li>
              <li><a href="/knowledge" className="hover:text-white transition-colors">Knowledge Hub</a></li>
              <li><a href="/templates" className="hover:text-white transition-colors">Template Marketplace</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Editorial Blog</a></li>
            </ul>
          </div>

          {/* For Employers & Candidates */}
          <div>
            <h4 className="font-display font-bold text-xs text-kth-slate-400 uppercase tracking-wider mb-4">For Employers</h4>
            <ul className="space-y-2.5 text-xs text-kth-slate-300">
              <li><a href="/pricing" className="hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Find Candidates</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Enterprise ATS</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-display font-bold text-xs text-kth-slate-400 uppercase tracking-wider mb-4">Company & Legal</h4>
            <ul className="space-y-2.5 text-xs text-kth-slate-300">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-8 border-t border-kth-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-kth-slate-500 gap-4">
          <div>© {new Date().getFullYear()} KnowToHire.com India. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-kth-slate-300">Privacy</a>
            <a href="/terms" className="hover:text-kth-slate-300">Terms</a>
            <a href="/contact" className="hover:text-kth-slate-300">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
