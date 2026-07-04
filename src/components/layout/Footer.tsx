import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const jobSeekerLinks = [
    { label: 'Browse Jobs', path: '/jobs' },
    { label: 'Create Profile', path: '/coming-soon?feature=CreateProfile' },
    { label: 'Job Alerts', path: '/coming-soon?feature=JobAlerts' },
    { label: 'Career Resources', path: '/resources' }
  ];

  const employerLinks = [
    { label: 'Post a Job', path: '/coming-soon?feature=PostJob' },
    { label: 'Browse Candidates', path: '/coming-soon?feature=Candidates' },
    { label: 'Employer Dashboard', path: '/coming-soon?feature=EmployerDashboard' },
    { label: 'Pricing Plans', path: '/pricing' }
  ];

  const studyHubLinks = [
    { label: 'E-Books', path: '/resources' },
    { label: 'Notes', path: '/resources' },
    { label: 'Guides', path: '/resources' },
    { label: 'Downloads', path: '/resources' }
  ];

  const templatesLinks = [
    { label: 'Resume Templates', path: '/templates' },
    { label: 'ESG Templates', path: '/templates' },
    { label: 'Compliance Templates', path: '/templates' },
    { label: 'PPT Templates', path: '/templates' }
  ];

  const companyLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' }
  ];

  return (
    <footer className="bg-white text-slate-600 border-t border-slate-100 border-solid mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-100 border-solid">
          
          {/* Logo Section */}
          <div className="lg:col-span-3 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 shrink-0">
              <span className="text-[28px] font-black font-heading text-primary flex items-center gap-2">
                <span className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shadow-sm shadow-primary/20">K</span>
                Know<span className="text-slate-900 font-extrabold">To</span><span className="text-secondary font-black">Hire</span>
              </span>
            </Link>
            <p className="text-[15px] leading-relaxed text-slate-500 font-normal max-w-sm">
              Empowering environmental professionals with opportunities, knowledge, and resources for a sustainable future.
            </p>
            {/* Social Icons Mockup */}
            <div className="flex space-x-3 pt-2">
              {['twitter', 'linkedin', 'facebook', 'instagram', 'youtube'].map((social) => (
                <span
                  key={social}
                  className="w-6.5 h-6.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label={`Visit our ${social} page`}
                >
                  <span className="text-[9px] uppercase font-extrabold tracking-tight truncate max-w-[20px]">{social[0]}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="space-y-3">
              <h4 className="text-[18px] font-semibold text-slate-800 font-heading">For Job Seekers</h4>
              <ul className="space-y-2">
                {jobSeekerLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-[16px] font-medium text-slate-500 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[18px] font-semibold text-slate-800 font-heading">For Employers</h4>
              <ul className="space-y-2">
                {employerLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-[16px] font-medium text-slate-500 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[18px] font-semibold text-slate-800 font-heading">Study Hub</h4>
              <ul className="space-y-2">
                {studyHubLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-[16px] font-medium text-slate-500 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[18px] font-semibold text-slate-800 font-heading">Templates</h4>
              <ul className="space-y-2">
                {templatesLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-[16px] font-medium text-slate-500 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[18px] font-semibold text-slate-800 font-heading">Company</h4>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-[16px] font-medium text-slate-500 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter subscription */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[18px] font-semibold text-slate-800 font-heading">Subscribe to Our Newsletter</h4>
            <p className="text-[15px] leading-normal text-slate-500 font-normal">
              Get the latest updates on jobs, resources and industry insights.
            </p>
            {subscribed ? (
              <div className="bg-primary-light border border-primary/20 rounded-lg p-3 text-center">
                <p className="text-xs font-bold text-primary">✓ Subscribed successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-slate-200 text-slate-800 placeholder-slate-450 focus:border-primary text-xs flex-1"
                />
                <Button type="submit" variant="primary" size="sm" className="bg-primary hover:bg-primary-hover text-white text-xs px-4 rounded-lg">
                  Subscribe
                </Button>
              </form>
            )}
          </div>

        </div>

        {/* Lower Footer section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[15px] text-slate-455 font-semibold text-center md:text-left">
            &copy; {currentYear} KnowToHire. All rights reserved.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-bold tracking-wider text-slate-500 select-none">
            <span className="flex items-center gap-1.5">
              <span className="text-primary">✓</span> Secure Platform
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-primary">🔒</span> Privacy Protected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-primary">👥</span> Trusted by Professionals
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
