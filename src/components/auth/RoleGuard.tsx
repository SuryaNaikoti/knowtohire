import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ShieldX, ArrowRight } from 'lucide-react';

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  onNavigate?: (path: string) => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  onNavigate,
}) => {
  const { role, status, isAuthenticated, isLoading } = useAuth();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const getAuthorizedPortalPath = (userRole: UserRole | null): string => {
    if (userRole === 'candidate') {
      return status === 'pending_onboarding' ? '/onboarding/candidate' : '/candidate';
    }
    if (userRole === 'employer') {
      return status === 'pending_onboarding' ? '/onboarding/employer' : '/employer';
    }
    if (userRole === 'creator') return '/creator';
    if (userRole === 'admin') return '/admin';
    return '/';
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && role && !allowedRoles.includes(role)) {
      console.warn(`[RoleGuard] Access denied for role "${role}". Required: ${allowedRoles.join(', ')}`);
    }
  }, [isLoading, isAuthenticated, role, allowedRoles]);

  if (isLoading) {
    return null; // ProtectedRoute wrapper handles loading UI
  }

  if (isAuthenticated && role && !allowedRoles.includes(role)) {
    const defaultPortal = getAuthorizedPortalPath(role);

    return (
      <div className="min-h-screen bg-kth-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl border border-kth-slate-200 shadow-md space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-kth-semantic-error flex items-center justify-center mx-auto">
            <ShieldX className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-kth-slate-900 mb-1">
              Unauthorized Portal Access
            </h2>
            <p className="text-xs text-kth-slate-500">
              Your account is registered as <strong className="capitalize text-kth-slate-800">{role}</strong>. You do not have permission to view this section.
            </p>
          </div>

          <Alert variant="warning" title="Access Restricted">
            You were attempting to access a portal restricted to <strong className="capitalize">{allowedRoles.join(', ')}</strong> users.
          </Alert>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate(defaultPortal)}
            >
              Return to Your Authorized Portal ({role})
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
