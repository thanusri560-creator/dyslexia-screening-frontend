import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  useEffect(() => {
    if (isLoading || isRedirecting) return;

    if (!isAuthenticated) {
      setIsRedirecting(true);
      setLocation('/login');
      return;
    }

    if (requiredRole && user && !requiredRole.includes(user.role)) {
      setIsRedirecting(true);
      setLocation('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, user, requiredRole, location, setLocation, isRedirecting]);

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
