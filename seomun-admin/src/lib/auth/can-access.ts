import type { UserRole } from '@/lib/auth/types';

export function hasRequiredRole(userRole: UserRole, allowedRoles: readonly UserRole[]) {
  return allowedRoles.includes(userRole);
}
