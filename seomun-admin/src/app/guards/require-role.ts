import { redirect } from '@tanstack/react-router';

import { routePaths } from '@/app/router/route-paths';
import type { UserRole } from '@/lib/auth';
import { hasRequiredRole } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';

export function requireRole(allowedRoles: readonly UserRole[]) {
  return () => {
    const { isAuthenticated, user } = useAuthStore.getState();

    if (!isAuthenticated || !user) {
      throw redirect({ to: routePaths.login });
    }

    const currentRole = user.role as UserRole;

    if (!hasRequiredRole(currentRole, allowedRoles)) {
      throw redirect({ to: routePaths.unauthorized });
    }
  };
}
