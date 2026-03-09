import React from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import type { AppRole } from '@/types/company';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: AppRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { canAccess, loading } = useCompany();

  if (loading) {
    return null;
  }

  if (!canAccess(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireRoleProps {
  children: React.ReactNode;
  role: AppRole;
  fallback?: React.ReactNode;
}

export function RequireRole({ children, role, fallback = null }: RequireRoleProps) {
  return (
    <RoleGuard roles={[role]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function RequireAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RequireRole role="admin" fallback={fallback}>{children}</RequireRole>;
}

export function RequireGestor({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard roles={['admin', 'gestor']} fallback={fallback}>{children}</RoleGuard>;
}

export function RequireOperacional({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard roles={['admin', 'gestor', 'operacional']} fallback={fallback}>{children}</RoleGuard>;
}
