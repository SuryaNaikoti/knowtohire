import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/public/Footer';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { useAuth } from '@/context/AuthContext';

// Import Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';

// Import Onboarding Pages
import { CandidateOnboardingPage } from '@/pages/onboarding/CandidateOnboardingPage';
import { EmployerOnboardingPage } from '@/pages/onboarding/EmployerOnboardingPage';

// Import Public Pages
import { HomePage } from '@/pages/public/HomePage';
import { JobsPage } from '@/pages/public/JobsPage';
import { JobDetailsPage } from '@/pages/public/JobDetailsPage';
import { CareersPage } from '@/pages/public/CareersPage';
import { KnowledgePage } from '@/pages/public/KnowledgePage';
import { ResourceDetailsPage } from '@/pages/public/ResourceDetailsPage';
import { TemplatesPage } from '@/pages/public/TemplatesPage';
import { TemplateDetailsPage } from '@/pages/public/TemplateDetailsPage';
import { BlogPage } from '@/pages/public/BlogPage';
import { BlogDetailsPage } from '@/pages/public/BlogDetailsPage';
import { PricingPage } from '@/pages/public/PricingPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { PrivacyPage } from '@/pages/public/PrivacyPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Import Candidate Pages
import { CandidateDashboardPage } from '@/pages/candidate/CandidateDashboardPage';
import { CandidateProfilePage } from '@/pages/candidate/CandidateProfilePage';
import { CandidateEditProfilePage } from '@/pages/candidate/CandidateEditProfilePage';
import { CandidateResumePage } from '@/pages/candidate/CandidateResumePage';
import { CandidateJobsPage } from '@/pages/candidate/CandidateJobsPage';
import { CandidateJobDetailsPage } from '@/pages/candidate/CandidateJobDetailsPage';
import { CandidateSavedJobsPage } from '@/pages/candidate/CandidateSavedJobsPage';
import { CandidateApplicationsPage } from '@/pages/candidate/CandidateApplicationsPage';
import { CandidateApplicationDetailsPage } from '@/pages/candidate/CandidateApplicationDetailsPage';
import { CandidateInterviewsPage } from '@/pages/candidate/CandidateInterviewsPage';
import { CandidateCareerInsightsPage } from '@/pages/candidate/CandidateCareerInsightsPage';
import { CandidateRequestsPage } from '@/pages/candidate/CandidateRequestsPage';
import { CandidateNotificationsPage } from '@/pages/candidate/CandidateNotificationsPage';
import { CandidateSettingsPage } from '@/pages/candidate/CandidateSettingsPage';

// Import Employer Pages
import { EmployerDashboardPage } from '@/pages/employer/EmployerDashboardPage';
import { EmployerJobsPage } from '@/pages/employer/EmployerJobsPage';
import { EmployerCreateJobPage } from '@/pages/employer/EmployerCreateJobPage';
import { EmployerJobDetailsPage } from '@/pages/employer/EmployerJobDetailsPage';
import { EmployerEditJobPage } from '@/pages/employer/EmployerEditJobPage';
import { EmployerJobApplicantsPage } from '@/pages/employer/EmployerJobApplicantsPage';
import { EmployerCandidatesPage } from '@/pages/employer/EmployerCandidatesPage';
import { EmployerCandidateDetailsPage } from '@/pages/employer/EmployerCandidateDetailsPage';
import { EmployerCandidateComparePage } from '@/pages/employer/EmployerCandidateComparePage';
import { EmployerPipelinePage } from '@/pages/employer/EmployerPipelinePage';
import { EmployerInterviewsPage } from '@/pages/employer/EmployerInterviewsPage';
import { EmployerSavedCandidatesPage } from '@/pages/employer/EmployerSavedCandidatesPage';
import { EmployerAnalyticsPage } from '@/pages/employer/EmployerAnalyticsPage';
import { EmployerCompanyProfilePage } from '@/pages/employer/EmployerCompanyProfilePage';
import { EmployerNotificationsPage } from '@/pages/employer/EmployerNotificationsPage';
import { EmployerSettingsPage } from '@/pages/employer/EmployerSettingsPage';

// Import Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminEmployersPage } from '@/pages/admin/AdminEmployersPage';
import { AdminJobsPage } from '@/pages/admin/AdminJobsPage';
import { AdminApplicationsPage } from '@/pages/admin/AdminApplicationsPage';
import { AdminResourcesPage } from '@/pages/admin/AdminResourcesPage';
import { AdminTemplatesPage } from '@/pages/admin/AdminTemplatesPage';
import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage';
import { AdminFulfillRequestPage } from '@/pages/admin/AdminFulfillRequestPage';
import { AdminBlogPage } from '@/pages/admin/AdminBlogPage';
import { AdminTaxonomyPage } from '@/pages/admin/AdminTaxonomyPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { isAuthenticated, role, status } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute = currentPath.startsWith('/admin');
  const isCandidateRoute = currentPath.startsWith('/candidate');
  const isEmployerRoute = currentPath.startsWith('/employer');
  const isOnboardingRoute = currentPath.startsWith('/onboarding');
  const isAuthRoute =
    currentPath === '/login' ||
    currentPath === '/register' ||
    currentPath === '/forgot-password' ||
    currentPath === '/reset-password' ||
    currentPath.startsWith('/verify-email') ||
    currentPath.startsWith('/auth/callback');

  // Route Resolver
  const renderRouteContent = () => {
    const path = currentPath;

    // Admin Routes (Guarded: ProtectedRoute + RoleGuard allowedRoles=['admin'])
    if (isAdminRoute) {
      let adminComponent: React.ReactNode = <AdminDashboardPage />;

      if (path === '/admin' || path === '/admin/') adminComponent = <AdminDashboardPage />;
      else if (path === '/admin/users') adminComponent = <AdminUsersPage />;
      else if (path === '/admin/employers') adminComponent = <AdminEmployersPage />;
      else if (path === '/admin/jobs') adminComponent = <AdminJobsPage />;
      else if (path === '/admin/applications') adminComponent = <AdminApplicationsPage />;
      else if (path === '/admin/resources') adminComponent = <AdminResourcesPage />;
      else if (path === '/admin/templates') adminComponent = <AdminTemplatesPage />;
      else if (path.startsWith('/admin/requests/') && path !== '/admin/requests') {
        const reqId = path.replace('/admin/requests/', '').replace('/fulfill', '');
        adminComponent = <AdminFulfillRequestPage requestId={reqId} onNavigate={navigateTo} />;
      }
      else if (path === '/admin/requests') adminComponent = <AdminRequestsPage onNavigate={navigateTo} />;
      else if (path === '/admin/blog') adminComponent = <AdminBlogPage />;
      else if (path === '/admin/taxonomy') adminComponent = <AdminTaxonomyPage />;
      else if (path === '/admin/settings') adminComponent = <AdminSettingsPage />;

      return (
        <ProtectedRoute currentPath={currentPath} onNavigate={navigateTo}>
          <RoleGuard allowedRoles={['admin']} onNavigate={navigateTo}>
            {adminComponent}
          </RoleGuard>
        </ProtectedRoute>
      );
    }

    // Onboarding Routes (Guarded: ProtectedRoute + RoleGuard)
    if (path === '/onboarding' || path === '/onboarding/') {
      return (
        <ProtectedRoute currentPath={currentPath} onNavigate={navigateTo}>
          <div />
        </ProtectedRoute>
      );
    }

    if (path === '/onboarding/candidate' || path.startsWith('/onboarding/candidate/')) {
      return (
        <ProtectedRoute currentPath={currentPath} onNavigate={navigateTo}>
          <RoleGuard allowedRoles={['candidate']} onNavigate={navigateTo}>
            <CandidateOnboardingPage onNavigate={navigateTo} />
          </RoleGuard>
        </ProtectedRoute>
      );
    }

    if (path === '/onboarding/employer' || path.startsWith('/onboarding/employer/')) {
      return (
        <ProtectedRoute currentPath={currentPath} onNavigate={navigateTo}>
          <RoleGuard allowedRoles={['employer']} onNavigate={navigateTo}>
            <EmployerOnboardingPage onNavigate={navigateTo} />
          </RoleGuard>
        </ProtectedRoute>
      );
    }

    // Employer Routes (Guarded: Auth + Role=employer)
    if (isEmployerRoute) {
      let pageComponent: React.ReactNode = <EmployerDashboardPage />;

      if (path === '/employer' || path === '/employer/') pageComponent = <EmployerDashboardPage />;
      else if (path === '/employer/jobs') pageComponent = <EmployerJobsPage />;
      else if (path === '/employer/jobs/new') pageComponent = <EmployerCreateJobPage />;
      else if (path.endsWith('/edit') && path.startsWith('/employer/jobs/')) {
        const jobId = path.replace('/employer/jobs/', '').replace('/edit', '');
        pageComponent = <EmployerEditJobPage jobId={jobId} />;
      }
      else if (path.endsWith('/applicants') && path.startsWith('/employer/jobs/')) {
        const jobId = path.replace('/employer/jobs/', '').replace('/applicants', '');
        pageComponent = <EmployerJobApplicantsPage jobId={jobId} />;
      }
      else if (path.startsWith('/employer/jobs/')) {
        const jobId = path.replace('/employer/jobs/', '');
        pageComponent = <EmployerJobDetailsPage jobId={jobId} />;
      }
      else if (path === '/employer/candidates') pageComponent = <EmployerCandidatesPage />;
      else if (path === '/employer/candidates/compare') pageComponent = <EmployerCandidateComparePage />;
      else if (path.startsWith('/employer/candidates/')) {
        const candidateId = path.replace('/employer/candidates/', '');
        pageComponent = <EmployerCandidateDetailsPage candidateId={candidateId} />;
      }
      else if (path.startsWith('/employer/applications/')) {
        const applicationId = path.replace('/employer/applications/', '');
        pageComponent = <EmployerCandidateDetailsPage applicationId={applicationId} />;
      }
      else if (path === '/employer/pipeline') pageComponent = <EmployerPipelinePage />;
      else if (path === '/employer/interviews') pageComponent = <EmployerInterviewsPage />;
      else if (path === '/employer/saved-candidates') pageComponent = <EmployerSavedCandidatesPage />;
      else if (path === '/employer/analytics') pageComponent = <EmployerAnalyticsPage />;
      else if (path === '/employer/company-profile') pageComponent = <EmployerCompanyProfilePage />;
      else if (path === '/employer/notifications') pageComponent = <EmployerNotificationsPage />;
      else if (path === '/employer/settings') pageComponent = <EmployerSettingsPage />;

      return (
        <ProtectedRoute currentPath={currentPath} onNavigate={navigateTo}>
          <RoleGuard allowedRoles={['employer']} onNavigate={navigateTo}>
            {pageComponent}
          </RoleGuard>
        </ProtectedRoute>
      );
    }

    // Candidate Routes (Guarded: Auth + Role=candidate)
    if (isCandidateRoute) {
      let pageComponent: React.ReactNode = <CandidateDashboardPage />;

      if (path === '/candidate' || path === '/candidate/') pageComponent = <CandidateDashboardPage />;
      else if (path === '/candidate/profile/edit') pageComponent = <CandidateEditProfilePage onNavigate={navigateTo} />;
      else if (path === '/candidate/profile') pageComponent = <CandidateProfilePage onNavigate={navigateTo} />;
      else if (path === '/candidate/resume') pageComponent = <CandidateResumePage />;
      else if (path === '/candidate/jobs') pageComponent = <CandidateJobsPage />;
      else if (path.startsWith('/candidate/jobs/')) {
        const jobId = path.replace('/candidate/jobs/', '');
        pageComponent = <CandidateJobDetailsPage jobId={jobId} />;
      }
      else if (path === '/candidate/saved-jobs' || path === '/candidate/saved') pageComponent = <CandidateSavedJobsPage />;
      else if (path === '/candidate/applications') pageComponent = <CandidateApplicationsPage />;
      else if (path.startsWith('/candidate/applications/')) {
        const appId = path.replace('/candidate/applications/', '');
        pageComponent = <CandidateApplicationDetailsPage appId={appId} />;
      }
      else if (path === '/candidate/interviews') pageComponent = <CandidateInterviewsPage />;
      else if (path === '/candidate/career-insights' || path === '/candidate/insights') pageComponent = <CandidateCareerInsightsPage />;
      else if (path === '/candidate/requests') pageComponent = <CandidateRequestsPage />;
      else if (path === '/candidate/notifications') pageComponent = <CandidateNotificationsPage />;
      else if (path === '/candidate/settings') pageComponent = <CandidateSettingsPage />;

      return (
        <ProtectedRoute currentPath={currentPath} onNavigate={navigateTo}>
          <RoleGuard allowedRoles={['candidate']} onNavigate={navigateTo}>
            {pageComponent}
          </RoleGuard>
        </ProtectedRoute>
      );
    }

    // Auth Pages (Guest-Guarded where appropriate)
    if (path === '/login') {
      return (
        <GuestRoute onNavigate={navigateTo}>
          <LoginPage onNavigate={navigateTo} />
        </GuestRoute>
      );
    }
    if (path === '/register' || path.startsWith('/register?')) {
      return (
        <GuestRoute onNavigate={navigateTo}>
          <RegisterPage onNavigate={navigateTo} />
        </GuestRoute>
      );
    }
    if (path === '/forgot-password') {
      return (
        <GuestRoute onNavigate={navigateTo}>
          <ForgotPasswordPage onNavigate={navigateTo} />
        </GuestRoute>
      );
    }
    if (path === '/reset-password' || path.startsWith('/reset-password?')) {
      return (
        <ResetPasswordPage onNavigate={navigateTo} />
      );
    }
    if (path === '/verify-email' || path.startsWith('/verify-email')) {
      return (
        <VerifyEmailPage onNavigate={navigateTo} />
      );
    }
    if (path === '/auth/callback' || path.startsWith('/auth/callback')) {
      return (
        <AuthCallbackPage onNavigate={navigateTo} />
      );
    }

    // Public Routes
    if (path === '/' || path === '') return <HomePage />;
    if (path === '/jobs') return <JobsPage />;
    if (path.startsWith('/jobs/')) {
      const jobId = path.replace('/jobs/', '');
      return <JobDetailsPage jobId={jobId} />;
    }
    if (path === '/careers') return <CareersPage />;
    if (path === '/knowledge') return <KnowledgePage />;
    if (path.startsWith('/knowledge/')) {
      const resourceId = path.replace('/knowledge/', '');
      return <ResourceDetailsPage resourceId={resourceId} />;
    }
    if (path === '/templates') return <TemplatesPage />;
    if (path.startsWith('/templates/')) {
      const templateId = path.replace('/templates/', '');
      return <TemplateDetailsPage templateId={templateId} />;
    }
    if (path === '/blog') return <BlogPage />;
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      return <BlogDetailsPage slug={slug} />;
    }
    if (path === '/pricing') return <PricingPage />;
    if (path === '/about') return <AboutPage />;
    if (path === '/contact') return <ContactPage />;
    if (path === '/privacy') return <PrivacyPage />;
    if (path === '/terms') return <TermsPage />;

    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen bg-kth-slate-50 flex flex-col font-sans">
      {/* Conditionally Render Shell based on route type */}
      {isAdminRoute || isEmployerRoute || isCandidateRoute || isOnboardingRoute || isAuthRoute ? (
        <div className="flex-1 flex flex-col">
          {renderRouteContent()}
        </div>
      ) : (
        <>
          <Navbar
            onNavigate={navigateTo}
            onSearchClick={() => setIsCommandOpen(true)}
            onPostJobClick={() => {
              if (!isAuthenticated) {
                navigateTo('/register?role=employer');
              } else {
                navigateTo('/employer/jobs/new');
              }
            }}
            onSignInClick={() => {
              if (!isAuthenticated) {
                navigateTo('/login');
              } else if (status === 'pending_onboarding') {
                navigateTo(role === 'employer' ? '/onboarding/employer' : '/onboarding/candidate');
              } else {
                navigateTo(role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : '/candidate');
              }
            }}
          />
          <div className="flex-1">
            {renderRouteContent()}
          </div>
          <Footer />
        </>
      )}

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
}

export default App;
