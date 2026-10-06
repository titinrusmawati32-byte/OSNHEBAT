import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { Award, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Loading splash screen while Firebase determines auth state
export const AuthLoadingSplash: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 animate-pulse mb-4">
        <Award className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
        OLYMPIAD CBT
      </h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
        Memeriksa sesi pengguna...
      </p>
    </div>
  );
};

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingSplash />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <AuthLoadingSplash />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Redirect unauthorized user to their role-appropriate dashboard
    return <Navigate to={`/${profile.role}`} replace />;
  }

  return <>{children}</>;
};
