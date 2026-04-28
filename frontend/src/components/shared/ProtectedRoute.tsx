'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return; // Wait for localStorage to be read

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'ADMIN') {
      router.replace('/dashboard'); // Fallback or unauthorized page
    }
  }, [user, token, allowedRoles, router, hasHydrated]);

  // Prevent rendering anything while redirecting or hydrating
  if (!hasHydrated || !token || !user) {
    return null; 
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
