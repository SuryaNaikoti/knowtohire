import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Menu, X, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { QuickAlertsNavBar } from './QuickAlertsNavBar';

export interface NavbarProps {
  onSearchClick?: () => void;
  onPostJobClick?: () => void;
  onSignInClick?: () => void;
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchClick,
  onPostJobClick,
  onSignInClick,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, role, status } = useAuth();

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleSignIn = () => {
    if (onSignInClick) {
      onSignInClick();
      return;
    }

    if (!isAuthenticated) {
      handleNav('/login');
      return;
    }

    if (status === 'pending_onboarding') {
      const onboardingPath = role === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
      handleNav(onboardingPath);
      return;
    }

    const portalPath = role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : role === 'creator' ? '/creator' : '/candidate';
    handleNav(portalPath);
  };

  const handlePostJob = () => {
    if (onPostJobClick) {
      onPostJobClick();
      return;
    }

    if (!isAuthenticated) {
      handleNav('/register?role=employer');
      return;
    }

    handleNav('/employer/jobs/new');
  };

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col bg-white/95 backdrop-blur-md border-b border-kth-slate-200 shadow-sm">
      {/* Top Header Bar */}
      <div className="w-full h-16 px-4 md:px-8 flex items-center justify-between border-b border-kth-slate-100">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className="flex items-center gap-2.5 font-display font-extrabold text-xl text-kth-slate-900 no-underline"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-base font-extrabold shadow-sm">
              K
            </div>
            <span>KnowToHire</span>
          </a>

          {/* Public Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <a
              href="/jobs"
              onClick={(e) => { e.preventDefault(); handleNav('/jobs'); }}
              className="text-sm font-semibold text-kth-slate-700 hover:text-kth-primary-600 transition-colors no-underline"
            >
              Find Jobs
            </a>
            <a
              href="/careers"
              onClick={(e) => { e.preventDefault(); handleNav('/careers'); }}
              className="text-sm font-medium text-kth-slate-600 hover:text-kth-slate-900 transition-colors no-underline"
            >
              Careers
            </a>
            <a
              href="/knowledge"
              onClick={(e) => { e.preventDefault(); handleNav('/knowledge'); }}
              className="text-sm font-medium text-kth-slate-600 hover:text-kth-slate-900 transition-colors no-underline"
            >
              Knowledge Hub
            </a>
            <a
              href="/templates"
              onClick={(e) => { e.preventDefault(); handleNav('/templates'); }}
              className="text-sm font-medium text-kth-slate-600 hover:text-kth-slate-900 transition-colors no-underline"
            >
              Templates
            </a>
            <a
              href="/blog"
              onClick={(e) => { e.preventDefault(); handleNav('/blog'); }}
              className="text-sm font-medium text-kth-slate-600 hover:text-kth-slate-900 transition-colors no-underline"
            >
              Blog
            </a>
            <a
              href="/pricing"
              onClick={(e) => { e.preventDefault(); handleNav('/pricing'); }}
              className="text-sm font-medium text-kth-slate-600 hover:text-kth-slate-900 transition-colors no-underline"
            >
              Subscribe
            </a>
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Quick Search Shortcut */}
          <button
            onClick={onSearchClick}
            aria-label="Search platform"
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-kth-slate-100 border border-kth-slate-200 text-xs text-kth-slate-500 hover:bg-kth-slate-200/60 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search platform...</span>
            <kbd className="hidden sm:inline font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-kth-slate-200">Cmd+K</kbd>
          </button>

          {/* Sign In / Dashboard CTA (Hidden on mobile < sm, available in mobile drawer) */}
          <div className="hidden sm:block">
            <Button
              variant={isAuthenticated ? "secondary" : "ghost"}
              size="sm"
              onClick={handleSignIn}
              leftIcon={isAuthenticated ? <UserIcon className="w-3.5 h-3.5 text-kth-primary-600" /> : undefined}
            >
              {isAuthenticated ? "My Dashboard" : "Sign In"}
            </Button>
          </div>

          {/* Post Job CTA (Hidden on mobile < sm, available in mobile drawer) */}
          <div className="hidden sm:block">
            <Button variant="primary" size="sm" onClick={handlePostJob}>
              + Post a Job
            </Button>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden p-2 rounded-lg text-kth-slate-700 hover:bg-kth-slate-100 active:bg-kth-slate-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Quick Category & State Navigation Bar (Bottom of Header) */}
      <QuickAlertsNavBar onNavigate={handleNav} />

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-kth-slate-200 p-4 shadow-xl flex flex-col space-y-3 z-50 animate-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
          {/* Mobile Quick Action Buttons (< sm) */}
          <div className="sm:hidden grid grid-cols-2 gap-2 pb-2 border-b border-kth-slate-100">
            <Button
              variant="primary"
              size="md"
              className="w-full font-bold text-xs"
              onClick={() => { setMobileMenuOpen(false); handlePostJob(); }}
            >
              + Post a Job
            </Button>
            <Button
              variant={isAuthenticated ? "secondary" : "outline"}
              size="md"
              className="w-full font-bold text-xs"
              onClick={() => { setMobileMenuOpen(false); handleSignIn(); }}
              leftIcon={isAuthenticated ? <UserIcon className="w-3.5 h-3.5 text-kth-primary-600" /> : undefined}
            >
              {isAuthenticated ? "My Dashboard" : "Sign In"}
            </Button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="grid grid-cols-2 gap-1 py-1">
            <a
              href="/jobs"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNav('/jobs'); }}
              className="text-xs font-bold text-kth-slate-800 hover:text-kth-primary-600 p-2 rounded-lg hover:bg-kth-slate-50 transition-colors"
            >
              Find Jobs
            </a>
            <a
              href="/careers"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNav('/careers'); }}
              className="text-xs font-bold text-kth-slate-800 hover:text-kth-primary-600 p-2 rounded-lg hover:bg-kth-slate-50 transition-colors"
            >
              Career Categories
            </a>
            <a
              href="/knowledge"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNav('/knowledge'); }}
              className="text-xs font-bold text-kth-slate-800 hover:text-kth-primary-600 p-2 rounded-lg hover:bg-kth-slate-50 transition-colors"
            >
              Knowledge Hub
            </a>
            <a
              href="/templates"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNav('/templates'); }}
              className="text-xs font-bold text-kth-slate-800 hover:text-kth-primary-600 p-2 rounded-lg hover:bg-kth-slate-50 transition-colors"
            >
              Templates Store
            </a>
            <a
              href="/blog"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNav('/blog'); }}
              className="text-xs font-bold text-kth-slate-800 hover:text-kth-primary-600 p-2 rounded-lg hover:bg-kth-slate-50 transition-colors"
            >
              Editorial Blog
            </a>
            <a
              href="/pricing"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNav('/pricing'); }}
              className="text-xs font-bold text-kth-slate-800 hover:text-kth-primary-600 p-2 rounded-lg hover:bg-kth-slate-50 transition-colors"
            >
              Subscribe
            </a>
            <a
              href="/about"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNav('/about'); }}
              className="text-xs font-bold text-kth-slate-800 hover:text-kth-primary-600 p-2 rounded-lg hover:bg-kth-slate-50 transition-colors"
            >
              About Us
            </a>
            <a
              href="/contact"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleNav('/contact'); }}
              className="text-xs font-bold text-kth-slate-800 hover:text-kth-primary-600 p-2 rounded-lg hover:bg-kth-slate-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

