import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) return;

    // Route to role-specific dashboard
    switch (user.role) {
      case 'student':
        setLocation('/student-dashboard');
        break;
      case 'parent':
        setLocation('/parent-dashboard');
        break;
      case 'teacher':
        setLocation('/teacher-dashboard');
        break;
      case 'admin':
        setLocation('/admin-dashboard');
        break;
      default:
        setLocation('/student-dashboard');
    }
  }, [user, setLocation]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </ProtectedRoute>
  );
}
