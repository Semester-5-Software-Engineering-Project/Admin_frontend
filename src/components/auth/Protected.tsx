"use client";
import React from 'react';
import RoleGuard from './RoleGuard';
import { UserRole } from '@/types';

/**
 * Protected: restricts access to ADMIN and SUPER_ADMIN roles.
 * Usage: Wrap page content inside <Protected> ... </Protected>
 */
const Protected: React.FC<{ children: React.ReactNode; redirect?: string; roles?: UserRole[] }> = ({
  children,
  redirect = '/login',
  roles = ['ADMIN', 'SUPER_ADMIN'],
}) => {
  return (
    <RoleGuard allowed={roles} redirect={redirect}>
      {children}
    </RoleGuard>
  );
};

export default Protected;
