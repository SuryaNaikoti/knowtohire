import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

export interface GuestRouteProps {
  children: React.ReactNode;
  onNavigate?: (path: string) => void;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
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
    // Only execute guest redirect when authenticated, role resolved, and account is not suspended
    if (isInitialized && !isLoading && isAuthenticated && role !== null) {
      if (status === 'suspended') {
        // Suspended users stay on the dedicated suspension notification screen
        return;
      }

      const redirectParam = new URLSearchParams(window.location.search).get('redirect');
      let destination = '/';

      if (status === 'unverified') {
        destination = '/verify-email';
      } else if (status === 'pending_onboarding') {
        destination = role === 'employer' ? '/onboarding/employer' : '/onboarding/candidate';
      } else if (status === 'active') {
        if (redirectParam && (
          (role === 'candidate' && (redirectParam.startsWith('/candidate') || redirectParam.startsWith('/jobs') || redirectParam.startsWith('/knowledge') || redirectParam.startsWith('/templates'))) ||
          (role === 'employer' && redirectParam.startsWith('/employer')) ||
          (role === 'creator' && redirectParam.startsWith('/creator')) ||
          (role === 'admin' && redirectParam.startsWith('/admin'))
        )) {
          destination = redirectParam;
        } else {
          destination = role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : role === 'creator' ? '/creator' : '/candidate';
        }
      } else {
        destination = '/verify-email';
      }

      console.log('[AUTH TRACE 02]', {
        resolvedRole: role,
        resolvedStatus: status,
        destination,
      });

      navigate(destination);
    }
  }, [isInitialized, isLoading, isAuthenticated, role, status]);

  if (isLoading || !isInitialized || (isAuthenticated && role === null)) {
    return (
      <div className="min-h-screen bg-kth-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm p-6 bg-white rounded-xl border border-kth-slate-200 shadow-sm space-y-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-kth-primary-600 to-kth-accent-cyan flex items-center justify-center text-white text-lg font-bold mx-auto shadow-sm animate-pulse">
            K
          </div>
          <Skeleton className="h-5 w-32 mx-auto" />
          <Skeleton className="h-3.5 w-48 mx-auto" />
          <p className="text-xs text-kth-slate-400 font-medium">Resolving your account...</p>
        </div>
      </div>
    );
  }

  // Suspended Account State: Show dedicated suspension notice with Sign Out action
  if (isAuthenticated && status === 'suspended') {
    return (
      <div className="min-h-screen bg-kth-slate-50 flex items-center justify-center p-6 font-sans">
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

  if (isAuthenticated && role !== null) {
    return null; // Redirecting to authorized destination
  }

  return <>{children}</>;
};
