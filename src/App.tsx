import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { Privacy } from './pages/public/Privacy';
import { Terms } from './pages/public/Terms';
import { ComingSoon } from './pages/public/ComingSoon';

// Authentication pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { RoleSelection } from './pages/auth/RoleSelection';
import { CandidateOnboarding } from './pages/auth/CandidateOnboarding';
import { EmployerOnboarding } from './pages/auth/EmployerOnboarding';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { AuthCallback } from './pages/auth/AuthCallback';

// Dashboard pages & guards
import { ProtectedRoute } from './components/layout/ProtectedRoute';

const JobsListing = React.lazy(() =>
  import('./pages/public/JobsListing').then((m) => ({ default: m.JobsListing }))
);
const JobDetails = React.lazy(() =>
  import('./pages/public/JobDetails').then((m) => ({ default: m.JobDetails }))
);
const ResourcesListing = React.lazy(() =>
  import('./pages/public/ResourcesListing').then((m) => ({ default: m.ResourcesListing }))
);
const ResourceDetails = React.lazy(() =>
  import('./pages/public/ResourceDetails').then((m) => ({ default: m.ResourceDetails }))
);
const TemplatesListing = React.lazy(() =>
  import('./pages/public/TemplatesListing').then((m) => ({ default: m.TemplatesListing }))
);
const TemplateDetails = React.lazy(() =>
  import('./pages/public/TemplateDetails').then((m) => ({ default: m.TemplateDetails }))
);
const Blog = React.lazy(() =>
  import('./pages/public/Blog').then((m) => ({ default: m.Blog }))
);
const Pricing = React.lazy(() =>
  import('./pages/public/Pricing').then((m) => ({ default: m.Pricing }))
);

const CandidateDashboard = React.lazy(() =>
  import('./pages/dashboard/candidate/CandidateDashboard').then((m) => ({ default: m.CandidateDashboard }))
);
const Portfolio = React.lazy(() =>
  import('./pages/dashboard/candidate/Portfolio').then((m) => ({ default: m.Portfolio }))
);
const Experience = React.lazy(() =>
  import('./pages/dashboard/candidate/Experience').then((m) => ({ default: m.Experience }))
);
const Skills = React.lazy(() =>
  import('./pages/dashboard/candidate/Skills').then((m) => ({ default: m.Skills }))
);
const CandidateJobs = React.lazy(() =>
  import('./pages/dashboard/candidate/Jobs').then((m) => ({ default: m.Jobs }))
);
const SavedJobs = React.lazy(() =>
  import('./pages/dashboard/candidate/SavedJobs').then((m) => ({ default: m.SavedJobs }))
);
const Education = React.lazy(() =>
  import('./pages/dashboard/candidate/Education').then((m) => ({ default: m.Education }))
);
const Certifications = React.lazy(() =>
  import('./pages/dashboard/candidate/Certifications').then((m) => ({ default: m.Certifications }))
);
const Projects = React.lazy(() =>
  import('./pages/dashboard/candidate/Projects').then((m) => ({ default: m.Projects }))
);
const Alerts = React.lazy(() =>
  import('./pages/dashboard/candidate/Alerts').then((m) => ({ default: m.Alerts }))
);
const Notifications = React.lazy(() =>
  import('./pages/dashboard/candidate/Notifications').then((m) => ({ default: m.Notifications }))
);

const EmployerDashboard = React.lazy(() =>
  import('./pages/dashboard/employer/EmployerDashboard').then((m) => ({ default: m.EmployerDashboard }))
);
const CompanyProfile = React.lazy(() =>
  import('./pages/dashboard/employer/CompanyProfile').then((m) => ({ default: m.CompanyProfile }))
);
const Locations = React.lazy(() =>
  import('./pages/dashboard/employer/Locations').then((m) => ({ default: m.Locations }))
);
const Team = React.lazy(() =>
  import('./pages/dashboard/employer/Team').then((m) => ({ default: m.Team }))
);
const EmployerJobs = React.lazy(() =>
  import('./pages/dashboard/employer/Jobs').then((m) => ({ default: m.Jobs }))
);
const CreateJob = React.lazy(() =>
  import('./pages/dashboard/employer/CreateJob').then((m) => ({ default: m.CreateJob }))
);

const AdminDashboard = React.lazy(() =>
  import('./pages/dashboard/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const Moderation = React.lazy(() =>
  import('./pages/dashboard/admin/Moderation').then((m) => ({ default: m.Moderation }))
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="coming-soon" element={<ComingSoon />} />
            <Route path="jobs" element={<JobsListing />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="resources" element={<ResourcesListing />} />
            <Route path="resources/:id" element={<ResourceDetails />} />
            <Route path="templates" element={<TemplatesListing />} />
            <Route path="templates/:id" element={<TemplateDetails />} />
            <Route path="blog" element={<Blog />} />
            <Route path="pricing" element={<Pricing />} />
            
            {/* Auth Screens */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="role-selection" element={<RoleSelection />} />
            <Route path="onboarding/candidate" element={<CandidateOnboarding />} />
            <Route path="onboarding/employer" element={<EmployerOnboarding />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="auth/callback" element={<AuthCallback />} />
          </Route>

          {/* Protected Dashboard Shell Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="candidate" replace />} />
            
            {/* Candidate Dashboard Sub-routes */}
            <Route path="candidate">
              <Route
                index
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="portfolio"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="experience"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Experience />
                  </ProtectedRoute>
                }
              />
              <Route
                path="skills"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Skills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="jobs"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="saved"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <SavedJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="education"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Education />
                  </ProtectedRoute>
                }
              />
              <Route
                path="certifications"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Certifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="alerts"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Alerts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="notifications"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="employer">
              <Route
                index
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="company"
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <CompanyProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="locations"
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <Locations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="team"
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <Team />
                  </ProtectedRoute>
                }
              />
              <Route
                path="jobs"
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <EmployerJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="jobs/create"
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <CreateJob />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="admin">
              <Route
                index
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="moderation"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <Moderation />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
