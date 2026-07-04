import React from 'react';
import { Navigate } from 'react-router-dom';
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

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-550 font-bold text-center">Loading your secure dashboard session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = profile?.role;

  // If user does not have a role yet, redirect to role selection
  if (profile && !userRole) {
    return <Navigate to="/role-selection" replace />;
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
