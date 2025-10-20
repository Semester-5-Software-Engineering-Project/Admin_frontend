"use client";
import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/authStore';
import { UserRole } from '@/types';

interface RoleGuardProps {
  allowed: UserRole[] | UserRole; // roles allowed to access
  redirect?: string; // fallback redirect
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * RoleGuard: Wrap protected page content and redirect if user lacks role
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowed,
  redirect = '/dashboard',
  children,
  loadingFallback = <div className="p-8 text-center text-sm text-gray-500">Checking permissions...</div>,
}) => {
  const router = useRouter();
  const { user, isAuthenticated, hasRole, hydrated } = useAuthStore();

  const allowedList = useMemo(() => 
    Array.isArray(allowed) ? allowed : [allowed],
    [allowed]
  );
  const canAccess = user && hasRole(allowedList);

  // Debug logging
  React.useEffect(() => {
    console.log('🔐 RoleGuard Debug:', {
      hydrated,
      isAuthenticated,
      user: user ? { email: user.email, role: user.role } : null,
      allowedList,
      canAccess,
    });
  }, [hydrated, isAuthenticated, user, allowedList, canAccess]);

  useEffect(() => {
    if (!hydrated) {
      console.log('⏳ Waiting for hydration...');
      return;
    }
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to /login');
      router.replace('/login');
      return;
    }
    if (isAuthenticated && user && !canAccess) {
      console.log('🚫 Access denied, redirecting to', redirect);
      router.replace(redirect);
    } else if (canAccess) {
      console.log('✅ Access granted!');
    }
  }, [hydrated, isAuthenticated, user, canAccess, router, redirect]);

  if (!hydrated) {
    console.log('🔄 Showing loading fallback - waiting for hydration');
    return loadingFallback;
  }
  if (!isAuthenticated || !user) {
    console.log('🔄 Showing loading fallback - not authenticated or no user');
    return loadingFallback;
  }
  if (!canAccess) {
    console.log('⛔ No access, returning null');
    return null;
  }

  console.log('✨ Rendering protected content');
  return <>{children}</>;
};

export default RoleGuard;
