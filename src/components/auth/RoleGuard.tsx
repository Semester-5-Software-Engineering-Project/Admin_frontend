"use client";
import React, { useEffect } from 'react';
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

  const allowedList = (Array.isArray(allowed) ? allowed : [allowed]).map(r => r.toUpperCase() as UserRole);
  const canAccess = user && hasRole(allowedList);

  useEffect(() => {
    if (!hydrated) return; // wait for hydration before deciding
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (isAuthenticated && user && !canAccess) {
      router.replace(redirect);
    }
  }, [hydrated, isAuthenticated, user, canAccess, router, redirect]);

  if (!hydrated) return loadingFallback;
  if (!isAuthenticated || !user) return loadingFallback;
  if (!canAccess) return null; // redirect in effect

  return <>{children}</>;
};

export default RoleGuard;
