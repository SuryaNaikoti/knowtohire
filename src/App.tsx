import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/public/Footer';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { useAuth } from '@/context/AuthContext';
import { PageLoading } from '@/components/ui/PageLoading';

// Statically keep HomePage for instant first-paint
import { HomePage } from '@/pages/public/HomePage';

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })));

// Lazy-loaded Onboarding Pages
const CandidateOnboardingPage = lazy(() => import('@/pages/onboarding/CandidateOnboardingPage').then(m => ({ default: m.CandidateOnboardingPage })));
const EmployerOnboardingPage = lazy(() => import('@/pages/onboarding/EmployerOnboardingPage').then(m => ({ default: m.EmployerOnboardingPage })));

// Lazy-loaded Public Pages
const JobsPage = lazy(() => import('@/pages/public/JobsPage').then(m => ({ default: m.JobsPage })));
const JobDetailsPage = lazy(() => import('@/pages/public/JobDetailsPage').then(m => ({ default: m.JobDetailsPage })));
const CompanyProfilePage = lazy(() => import('@/pages/public/CompanyProfilePage').then(m => ({ default: m.CompanyProfilePage })));
const CareersPage = lazy(() => import('@/pages/public/CareersPage').then(m => ({ default: m.CareersPage })));
const KnowledgePage = lazy(() => import('@/pages/public/KnowledgePage').then(m => ({ default: m.KnowledgePage })));
const ResourceDetailsPage = lazy(() => import('@/pages/public/ResourceDetailsPage').then(m => ({ default: m.ResourceDetailsPage })));
const TemplatesPage = lazy(() => import('@/pages/public/TemplatesPage').then(m => ({ default: m.TemplatesPage })));
const TemplateDetailsPage = lazy(() => import('@/pages/public/TemplateDetailsPage').then(m => ({ default: m.TemplateDetailsPage })));
const BlogPage = lazy(() => import('@/pages/public/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogDetailsPage = lazy(() => import('@/pages/public/BlogDetailsPage').then(m => ({ default: m.BlogDetailsPage })));
const PricingPage = lazy(() => import('@/pages/public/PricingPage').then(m => ({ default: m.PricingPage })));
const AboutPage = lazy(() => import('@/pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then(m => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded Candidate Pages
const CandidateDashboardPage = lazy(() => import('@/pages/candidate/CandidateDashboardPage').then(m => ({ default: m.CandidateDashboardPage })));
const CandidateProfilePage = lazy(() => import('@/pages/candidate/CandidateProfilePage').then(m => ({ default: m.CandidateProfilePage })));
const CandidateEditProfilePage = lazy(() => import('@/pages/candidate/CandidateEditProfilePage').then(m => ({ default: m.CandidateEditProfilePage })));
const CandidateResumePage = lazy(() => import('@/pages/candidate/CandidateResumePage').then(m => ({ default: m.CandidateResumePage })));
const CandidateResumePreviewPage = lazy(() => import('@/pages/candidate/CandidateResumePreviewPage').then(m => ({ default: m.CandidateResumePreviewPage })));
const CandidateJobsPage = lazy(() => import('@/pages/candidate/CandidateJobsPage').then(m => ({ default: m.CandidateJobsPage })));
const CandidateJobDetailsPage = lazy(() => import('@/pages/candidate/CandidateJobDetailsPage').then(m => ({ default: m.CandidateJobDetailsPage })));
const CandidateApplyPage = lazy(() => import('@/pages/candidate/CandidateApplyPage').then(m => ({ default: m.CandidateApplyPage })));
const CandidateSavedJobsPage = lazy(() => import('@/pages/candidate/CandidateSavedJobsPage').then(m => ({ default: m.CandidateSavedJobsPage })));
const CandidateApplicationsPage = lazy(() => import('@/pages/candidate/CandidateApplicationsPage').then(m => ({ default: m.CandidateApplicationsPage })));
const CandidateApplicationDetailsPage = lazy(() => import('@/pages/candidate/CandidateApplicationDetailsPage').then(m => ({ default: m.CandidateApplicationDetailsPage })));
const CandidateInterviewsPage = lazy(() => import('@/pages/candidate/CandidateInterviewsPage').then(m => ({ default: m.CandidateInterviewsPage })));
const CandidateInterviewDetailsPage = lazy(() => import('@/pages/candidate/CandidateInterviewDetailsPage').then(m => ({ default: m.CandidateInterviewDetailsPage })));
const CandidateCareerInsightsPage = lazy(() => import('@/pages/candidate/CandidateCareerInsightsPage').then(m => ({ default: m.CandidateCareerInsightsPage })));
const CandidateKnowledgePage = lazy(() => import('@/pages/candidate/CandidateKnowledgePage').then(m => ({ default: m.CandidateKnowledgePage })));
const CandidateTemplatesPage = lazy(() => import('@/pages/candidate/CandidateTemplatesPage').then(m => ({ default: m.CandidateTemplatesPage })));
const CandidateRequestsPage = lazy(() => import('@/pages/candidate/CandidateRequestsPage').then(m => ({ default: m.CandidateRequestsPage })));
const CandidateNewRequestPage = lazy(() => import('@/pages/candidate/CandidateNewRequestPage').then(m => ({ default: m.CandidateNewRequestPage })));
const CandidateRequestDetailsPage = lazy(() => import('@/pages/candidate/CandidateRequestDetailsPage').then(m => ({ default: m.CandidateRequestDetailsPage })));
const CandidateNotificationsPage = lazy(() => import('@/pages/candidate/CandidateNotificationsPage').then(m => ({ default: m.CandidateNotificationsPage })));
const CandidateSettingsPage = lazy(() => import('@/pages/candidate/CandidateSettingsPage').then(m => ({ default: m.CandidateSettingsPage })));

// Lazy-loaded Employer Pages
const EmployerDashboardPage = lazy(() => import('@/pages/employer/EmployerDashboardPage').then(m => ({ default: m.EmployerDashboardPage })));
const EmployerJobsPage = lazy(() => import('@/pages/employer/EmployerJobsPage').then(m => ({ default: m.EmployerJobsPage })));
const EmployerCreateJobPage = lazy(() => import('@/pages/employer/EmployerCreateJobPage').then(m => ({ default: m.EmployerCreateJobPage })));
const EmployerJobPreviewPage = lazy(() => import('@/pages/employer/EmployerJobPreviewPage').then(m => ({ default: m.EmployerJobPreviewPage })));
const EmployerJobDetailsPage = lazy(() => import('@/pages/employer/EmployerJobDetailsPage').then(m => ({ default: m.EmployerJobDetailsPage })));
const EmployerEditJobPage = lazy(() => import('@/pages/employer/EmployerEditJobPage').then(m => ({ default: m.EmployerEditJobPage })));
const EmployerJobApplicantsPage = lazy(() => import('@/pages/employer/EmployerJobApplicantsPage').then(m => ({ default: m.EmployerJobApplicantsPage })));
const EmployerCandidatesPage = lazy(() => import('@/pages/employer/EmployerCandidatesPage').then(m => ({ default: m.EmployerCandidatesPage })));
const EmployerCandidateDetailsPage = lazy(() => import('@/pages/employer/EmployerCandidateDetailsPage').then(m => ({ default: m.EmployerCandidateDetailsPage })));
const EmployerScheduleInterviewPage = lazy(() => import('@/pages/employer/EmployerScheduleInterviewPage').then(m => ({ default: m.EmployerScheduleInterviewPage })));
const EmployerCandidateComparePage = lazy(() => import('@/pages/employer/EmployerCandidateComparePage').then(m => ({ default: m.EmployerCandidateComparePage })));
const EmployerPipelinePage = lazy(() => import('@/pages/employer/EmployerPipelinePage').then(m => ({ default: m.EmployerPipelinePage })));
const EmployerInterviewsPage = lazy(() => import('@/pages/employer/EmployerInterviewsPage').then(m => ({ default: m.EmployerInterviewsPage })));
const EmployerSavedCandidatesPage = lazy(() => import('@/pages/employer/EmployerSavedCandidatesPage').then(m => ({ default: m.EmployerSavedCandidatesPage })));
const EmployerAnalyticsPage = lazy(() => import('@/pages/employer/EmployerAnalyticsPage').then(m => ({ default: m.EmployerAnalyticsPage })));
const EmployerKnowledgePage = lazy(() => import('@/pages/employer/EmployerKnowledgePage').then(m => ({ default: m.EmployerKnowledgePage })));
const EmployerTemplatesPage = lazy(() => import('@/pages/employer/EmployerTemplatesPage').then(m => ({ default: m.EmployerTemplatesPage })));
const EmployerCompanyProfilePage = lazy(() => import('@/pages/employer/EmployerCompanyProfilePage').then(m => ({ default: m.EmployerCompanyProfilePage })));
const EmployerNotificationsPage = lazy(() => import('@/pages/employer/EmployerNotificationsPage').then(m => ({ default: m.EmployerNotificationsPage })));
const EmployerSettingsPage = lazy(() => import('@/pages/employer/EmployerSettingsPage').then(m => ({ default: m.EmployerSettingsPage })));

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminCreateUserPage = lazy(() => import('@/pages/admin/AdminCreateUserPage').then(m => ({ default: m.AdminCreateUserPage })));
const AdminEmployersPage = lazy(() => import('@/pages/admin/AdminEmployersPage').then(m => ({ default: m.AdminEmployersPage })));
const AdminEmployerDossierPage = lazy(() => import('@/pages/admin/AdminEmployerDossierPage').then(m => ({ default: m.AdminEmployerDossierPage })));
const AdminJobsPage = lazy(() => import('@/pages/admin/AdminJobsPage').then(m => ({ default: m.AdminJobsPage })));
const AdminJobInspectPage = lazy(() => import('@/pages/admin/AdminJobInspectPage').then(m => ({ default: m.AdminJobInspectPage })));
const AdminApplicationsPage = lazy(() => import('@/pages/admin/AdminApplicationsPage').then(m => ({ default: m.AdminApplicationsPage })));
const AdminApplicationDetailsPage = lazy(() => import('@/pages/admin/AdminApplicationDetailsPage').then(m => ({ default: m.AdminApplicationDetailsPage })));
const AdminResourcesPage = lazy(() => import('@/pages/admin/AdminResourcesPage').then(m => ({ default: m.AdminResourcesPage })));
const AdminResourceEditPage = lazy(() => import('@/pages/admin/AdminResourceEditPage').then(m => ({ default: m.AdminResourceEditPage })));
const AdminTemplatesPage = lazy(() => import('@/pages/admin/AdminTemplatesPage').then(m => ({ default: m.AdminTemplatesPage })));
const AdminTemplateEditPage = lazy(() => import('@/pages/admin/AdminTemplateEditPage').then(m => ({ default: m.AdminTemplateEditPage })));
const AdminRequestsPage = lazy(() => import('@/pages/admin/AdminRequestsPage').then(m => ({ default: m.AdminRequestsPage })));
const AdminFulfillRequestPage = lazy(() => import('@/pages/admin/AdminFulfillRequestPage').then(m => ({ default: m.AdminFulfillRequestPage })));
const AdminBlogPage = lazy(() => import('@/pages/admin/AdminBlogPage').then(m => ({ default: m.AdminBlogPage })));
const AdminBlogEditPage = lazy(() => import('@/pages/admin/AdminBlogEditPage').then(m => ({ default: m.AdminBlogEditPage })));
const AdminTaxonomyPage = lazy(() => import('@/pages/admin/AdminTaxonomyPage').then(m => ({ default: m.AdminTaxonomyPage })));
const AdminTaxonomyNewPage = lazy(() => import('@/pages/admin/AdminTaxonomyNewPage').then(m => ({ default: m.AdminTaxonomyNewPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

// Lazy-loaded Creator Pages
const CreatorDashboardPage = lazy(() => import('@/pages/creator/CreatorDashboardPage').then(m => ({ default: m.CreatorDashboardPage })));
const ResourceMetricsPage = lazy(() => import('@/pages/creator/ResourceMetricsPage').then(m => ({ default: m.ResourceMetricsPage })));

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

  // Guarantee that every page transition and URL change scrolls instantly to the top/header
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPath]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const isAdminRoute = currentPath.startsWith('/admin');
  const isCandidateRoute = currentPath.startsWith('/candidate');
  const isEmployerRoute = currentPath.startsWith('/employer');
  const isCreatorRoute = currentPath.startsWith('/creator');
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
    // Strip query string and hash from path so routes match query-based URLs (e.g. /jobs?category=General)
    const path = currentPath.split('?')[0].split('#')[0];

    // Admin Routes (Guarded: ProtectedRoute + RoleGuard allowedRoles=['admin'])
    if (isAdminRoute) {
      let adminComponent: React.ReactNode = <AdminDashboardPage onNavigate={navigateTo} />;

      if (path === '/admin' || path === '/admin/') adminComponent = <AdminDashboardPage onNavigate={navigateTo} />;
      else if (path === '/admin/users/new' || path === '/admin/users/create') adminComponent = <AdminCreateUserPage onNavigate={navigateTo} />;
      else if (path === '/admin/users') adminComponent = <AdminUsersPage onNavigate={navigateTo} />;
      else if (path.startsWith('/admin/employers/') && path !== '/admin/employers') {
        const empId = path.replace('/admin/employers/', '');
        adminComponent = <AdminEmployerDossierPage employerId={empId} onNavigate={navigateTo} />;
      }
      else if (path === '/admin/employers') adminComponent = <AdminEmployersPage onNavigate={navigateTo} />;
      else if (path.startsWith('/admin/jobs/') && path !== '/admin/jobs') {
        const jobId = path.replace('/admin/jobs/', '');
        adminComponent = <AdminJobInspectPage jobId={jobId} onNavigate={navigateTo} />;
      }
      else if (path === '/admin/jobs') adminComponent = <AdminJobsPage onNavigate={navigateTo} />;
      else if (path.startsWith('/admin/applications/') && path !== '/admin/applications') {
        const appId = path.replace('/admin/applications/', '');
        adminComponent = <AdminApplicationDetailsPage applicationId={appId} onNavigate={navigateTo} />;
      }
      else if (path === '/admin/applications') adminComponent = <AdminApplicationsPage onNavigate={navigateTo} />;
      else if (path === '/admin/resources/new') adminComponent = <AdminResourceEditPage onNavigate={navigateTo} />;
      else if (path.startsWith('/admin/resources/') && path.endsWith('/edit')) {
        const resId = path.replace('/admin/resources/', '').replace('/edit', '');
        adminComponent = <AdminResourceEditPage resourceId={resId} onNavigate={navigateTo} />;
      }
      else if (path === '/admin/resources') adminComponent = <AdminResourcesPage onNavigate={navigateTo} />;
      else if (path === '/admin/templates/new') adminComponent = <AdminTemplateEditPage onNavigate={navigateTo} />;
      else if (path.startsWith('/admin/templates/') && path.endsWith('/edit')) {
        const tmplId = path.replace('/admin/templates/', '').replace('/edit', '');
        adminComponent = <AdminTemplateEditPage templateId={tmplId} onNavigate={navigateTo} />;
      }
      else if (path === '/admin/templates') adminComponent = <AdminTemplatesPage onNavigate={navigateTo} />;
      else if (path.startsWith('/admin/requests/') && path !== '/admin/requests') {
        const reqId = path.replace('/admin/requests/', '').replace('/fulfill', '');
        adminComponent = <AdminFulfillRequestPage requestId={reqId} onNavigate={navigateTo} />;
      }
      else if (path === '/admin/requests') adminComponent = <AdminRequestsPage onNavigate={navigateTo} />;
      else if (path === '/admin/blog/new') adminComponent = <AdminBlogEditPage onNavigate={navigateTo} />;
      else if (path.startsWith('/admin/blog/') && path.endsWith('/edit')) {
        const blogId = path.replace('/admin/blog/', '').replace('/edit', '');
        adminComponent = <AdminBlogEditPage blogId={blogId} onNavigate={navigateTo} />;
      }
      else if (path === '/admin/blog') adminComponent = <AdminBlogPage onNavigate={navigateTo} />;
      else if (path.startsWith('/admin/resources/') && path.endsWith('/metrics')) {
        const resId = path.replace('/admin/resources/', '').replace('/metrics', '');
        adminComponent = <ResourceMetricsPage itemId={resId} itemType="resource" onNavigate={navigateTo} />;
      }
      else if (path.startsWith('/admin/templates/') && path.endsWith('/metrics')) {
        const tmplId = path.replace('/admin/templates/', '').replace('/metrics', '');
        adminComponent = <ResourceMetricsPage itemId={tmplId} itemType="template" onNavigate={navigateTo} />;
      }
      else if (path === '/admin/taxonomy/new') adminComponent = <AdminTaxonomyNewPage onNavigate={navigateTo} />;
      else if (path === '/admin/taxonomy') adminComponent = <AdminTaxonomyPage />;
      else if (path === '/admin/settings') adminComponent = <AdminSettingsPage onNavigate={navigateTo} />;

      return (
        <ProtectedRoute currentPath={currentPath} onNavigate={navigateTo}>
          <RoleGuard allowedRoles={['admin']} onNavigate={navigateTo}>
            {adminComponent}
          </RoleGuard>
        </ProtectedRoute>
      );
    }

    // Creator Routes (Guarded: ProtectedRoute + RoleGuard allowedRoles=['creator', 'admin'])
    if (isCreatorRoute) {
      let creatorComponent: React.ReactNode = <CreatorDashboardPage onNavigate={navigateTo} />;

      if (path === '/creator' || path === '/creator/') {
        creatorComponent = <CreatorDashboardPage onNavigate={navigateTo} />;
      } else if (path.startsWith('/creator/resources/') && path.endsWith('/metrics')) {
        const resId = path.replace('/creator/resources/', '').replace('/metrics', '');
        creatorComponent = <ResourceMetricsPage itemId={resId} itemType="resource" onNavigate={navigateTo} />;
      } else if (path.startsWith('/creator/templates/') && path.endsWith('/metrics')) {
        const tmplId = path.replace('/creator/templates/', '').replace('/metrics', '');
        creatorComponent = <ResourceMetricsPage itemId={tmplId} itemType="template" onNavigate={navigateTo} />;
      }

      return (
        <ProtectedRoute currentPath={currentPath} onNavigate={navigateTo}>
          <RoleGuard allowedRoles={['creator', 'admin']} onNavigate={navigateTo}>
            {creatorComponent}
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
      else if (path === '/employer/jobs/new' || path === '/employer/jobs/create') pageComponent = <EmployerCreateJobPage onNavigate={navigateTo} />;
      else if (path === '/employer/jobs/preview') pageComponent = <EmployerJobPreviewPage onNavigate={navigateTo} />;
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
      else if (path.includes('/schedule') && (path.startsWith('/employer/candidates/') || path.startsWith('/employer/applications/'))) {
        const candidateId = path
          .replace('/employer/candidates/', '')
          .replace('/employer/applications/', '')
          .replace('/schedule', '')
          .split('?')[0];
        pageComponent = <EmployerScheduleInterviewPage candidateId={candidateId} onNavigate={navigateTo} />;
      }
      else if (path.startsWith('/employer/candidates/')) {
        const candidateId = path.replace('/employer/candidates/', '');
        pageComponent = <EmployerCandidateDetailsPage candidateId={candidateId} onNavigate={navigateTo} />;
      }
      else if (path.startsWith('/employer/applications/')) {
        const applicationId = path.replace('/employer/applications/', '');
        pageComponent = <EmployerCandidateDetailsPage applicationId={applicationId} onNavigate={navigateTo} />;
      }
      else if (path === '/employer/pipeline') pageComponent = <EmployerPipelinePage />;
      else if (path === '/employer/interviews') pageComponent = <EmployerInterviewsPage />;
      else if (path === '/employer/saved-candidates') pageComponent = <EmployerSavedCandidatesPage />;
      else if (path === '/employer/analytics') pageComponent = <EmployerAnalyticsPage />;
      else if (path === '/employer/knowledge') pageComponent = <EmployerKnowledgePage />;
      else if (path === '/employer/templates') pageComponent = <EmployerTemplatesPage />;
      else if (path === '/employer/company-profile') pageComponent = <EmployerCompanyProfilePage />;
      else if (path === '/employer/notifications') pageComponent = <EmployerNotificationsPage onNavigate={navigateTo} />;
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
      else if (path === '/candidate/resume/preview') pageComponent = <CandidateResumePreviewPage onNavigate={navigateTo} />;
      else if (path === '/candidate/resume') pageComponent = <CandidateResumePage onNavigate={navigateTo} />;
      else if (path === '/candidate/jobs') pageComponent = <CandidateJobsPage />;
      else if (path.startsWith('/candidate/jobs/') && path.endsWith('/apply')) {
        const jobId = path.replace('/candidate/jobs/', '').replace('/apply', '');
        pageComponent = <CandidateApplyPage jobId={jobId} onNavigate={navigateTo} />;
      }
      else if (path.startsWith('/candidate/jobs/')) {
        const jobId = path.replace('/candidate/jobs/', '');
        pageComponent = <CandidateJobDetailsPage jobId={jobId} onNavigate={navigateTo} />;
      }
      else if (path === '/candidate/saved-jobs' || path === '/candidate/saved') pageComponent = <CandidateSavedJobsPage />;
      else if (path === '/candidate/applications') pageComponent = <CandidateApplicationsPage />;
      else if (path.startsWith('/candidate/applications/')) {
        const appId = path.replace('/candidate/applications/', '');
        pageComponent = <CandidateApplicationDetailsPage appId={appId} />;
      }
      else if (path.startsWith('/candidate/interviews/') && path !== '/candidate/interviews') {
        const interviewId = path.replace('/candidate/interviews/', '');
        pageComponent = <CandidateInterviewDetailsPage interviewId={interviewId} onNavigate={navigateTo} />;
      }
      else if (path === '/candidate/interviews') pageComponent = <CandidateInterviewsPage onNavigate={navigateTo} />;
      else if (path === '/candidate/career-insights' || path === '/candidate/insights') pageComponent = <CandidateCareerInsightsPage />;
      else if (path === '/candidate/knowledge') pageComponent = <CandidateKnowledgePage />;
      else if (path === '/candidate/templates') pageComponent = <CandidateTemplatesPage />;
      else if (path === '/candidate/requests/new') pageComponent = <CandidateNewRequestPage onNavigate={navigateTo} />;
      else if (path.startsWith('/candidate/requests/') && path !== '/candidate/requests') {
        pageComponent = <CandidateRequestDetailsPage onNavigate={navigateTo} />;
      }
      else if (path === '/candidate/requests') pageComponent = <CandidateRequestsPage />;
      else if (path === '/candidate/notifications') pageComponent = <CandidateNotificationsPage onNavigate={navigateTo} />;
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
    if (path.startsWith('/jobs/') && path.endsWith('/apply')) {
      const jobId = path.replace('/jobs/', '').replace('/apply', '');
      return <CandidateApplyPage jobId={jobId} onNavigate={navigateTo} />;
    }
    if (path === '/jobs') return <JobsPage />;
    if (path.startsWith('/jobs/')) {
      const jobId = path.replace('/jobs/', '');
      return <JobDetailsPage jobId={jobId} onNavigate={navigateTo} />;
    }
    if (path.startsWith('/companies/') && path !== '/companies') {
      const compId = path.replace('/companies/', '');
      return <CompanyProfilePage companyId={compId} onNavigate={navigateTo} />;
    }
    if (path === '/companies') {
      return <CompanyProfilePage companyId="default" onNavigate={navigateTo} />;
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
    if (path === '/pricing' || path === '/subscribe') return <PricingPage />;
    if (path === '/about') return <AboutPage />;
    if (path === '/contact') return <ContactPage />;
    if (path === '/privacy') return <PrivacyPage />;
    if (path === '/terms') return <TermsPage />;

    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen bg-kth-slate-50 flex flex-col font-sans">
      {/* Conditionally Render Shell based on route type */}
      {isAdminRoute || isEmployerRoute || isCandidateRoute || isCreatorRoute || isOnboardingRoute || isAuthRoute ? (
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<PageLoading />}>
            {renderRouteContent()}
          </Suspense>
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
            <Suspense fallback={<PageLoading />}>
              {renderRouteContent()}
            </Suspense>
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
