import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-xs text-slate-700 font-bold">Verifying Enterprise Session...</p>
            <p className="text-[11px] text-slate-400 font-medium">Securing profile permissions and workspace tokens</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page while preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = profile?.role;

  // If user does not have a role set, redirect to role selection
  if (profile && !userRole) {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  // If role is not allowed, redirect to their default workspace dashboard
  if (allowedRoles && userRole && !allowedRoles.includes(userRole as any)) {
    const defaultPaths: Record<string, string> = {
      candidate: '/dashboard/candidate',
      employer: '/dashboard/employer',
      admin: '/dashboard/admin',
      super_admin: '/dashboard/admin',
    };
    return <Navigate to={defaultPaths[userRole] || '/'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
