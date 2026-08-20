import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, LogOut } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  currentPath = window.location.pathname,
  onNavigate,
}) => {
  const { isAuthenticated, isLoading, isInitialized, role, status, logout } = useAuth();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // 1. Unauthenticated -> redirect to /login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Wait until role is genuinely resolved before applying role-dependent redirects
    if (role === null) {
      return;
    }

    // 2. Unverified Email -> redirect to /verify-email
    if (status === 'unverified') {
      if (!currentPath.startsWith('/verify-email')) {
        navigate('/verify-email');
      }
      return;
    }

    // 3. Pending Onboarding -> redirect to role-specific onboarding wizard
    if (status === 'pending_onboarding') {
      const targetOnboarding = role === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
      const wrongOnboarding = role === 'employer' ? '/onboarding/candidate' : '/onboarding/employer';

      if (
        !currentPath.startsWith('/onboarding') ||
        currentPath.startsWith(wrongOnboarding) ||
        currentPath === '/onboarding' ||
        currentPath === '/onboarding/'
      ) {
        console.log('[AUTH TRACE 02]', {
          resolvedRole: role,
          resolvedStatus: status,
          destination: targetOnboarding,
        });
        navigate(targetOnboarding);
      }
      return;
    }

    // 4. Active Account trying to access /onboarding -> redirect to authorized portal
    if (status === 'active' && currentPath.startsWith('/onboarding')) {
      const targetPortal = role === 'employer' ? '/employer' : '/candidate';
      navigate(targetPortal);
      return;
    }

    // 5. Cross-role portal protection
    if (role === 'employer' && currentPath.startsWith('/candidate')) {
      const target = status === 'active' ? '/employer' : '/onboarding/employer';
      navigate(target);
      return;
    }
    if (role === 'candidate' && currentPath.startsWith('/employer')) {
      const target = status === 'active' ? '/candidate' : '/onboarding/candidate';
      navigate(target);
      return;
    }
  }, [isInitialized, isLoading, isAuthenticated, status, role, currentPath]);

  // Loading / Initialization State (also waits if authenticated but role is still resolving)
  if (isLoading || !isInitialized || (isAuthenticated && role === null)) {
    return (
      <div className="min-h-screen bg-kth-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 bg-white p-8 rounded-xl border border-kth-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-xl font-extrabold mx-auto shadow-sm animate-pulse">
            K
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 mx-auto" />
            <Skeleton className="h-3.5 w-64 mx-auto" />
          </div>
          <p className="text-xs text-kth-slate-500 font-medium pt-2">
            Verifying KnowToHire session & role permissions...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated State
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-kth-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-xl border border-kth-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-lg text-kth-slate-900">Authentication Required</h2>
          <p className="text-xs text-kth-slate-600">You must be logged in to access this section of KnowToHire.</p>
          <div className="pt-2">
            <Button variant="primary" size="md" className="w-full" onClick={() => navigate('/login')}>
              Go to Sign In Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Suspended Account State
  if (status === 'suspended') {
    return (
      <div className="min-h-screen bg-kth-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl border border-red-200 shadow-md space-y-6">
          <Alert variant="error" title="Account Access Suspended">
            Your KnowToHire account has been suspended due to governance or compliance review. Please contact support@knowtohire.com for assistance.
          </Alert>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => logout()} leftIcon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
