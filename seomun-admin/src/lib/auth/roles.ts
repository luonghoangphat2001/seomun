// import type { UserRole } from '@/lib/auth/types';

// export const ALL_STAFF_ROLES = ['employee', 'manager', 'administrator', 'super-manager'] as const satisfies readonly UserRole[];
// export const ADMIN_ROLES = ['administrator', 'super-manager'] as const satisfies readonly UserRole[];
// export const SUPER_MANAGER_ROLES = ['super-manager'] as const satisfies readonly UserRole[];
import { USER_ROLE, type UserRole } from '@/lib/auth/types';

export const ALL_STAFF_ROLES = [
  USER_ROLE.EMPLOYEE,
  USER_ROLE.MANAGER,
  USER_ROLE.ADMINISTRATOR,
  USER_ROLE.SUPER_ADMIN,
] as const satisfies readonly UserRole[];
export const ADMIN_ROLES = [USER_ROLE.ADMINISTRATOR] as const satisfies readonly UserRole[];
export const SUPER_MANAGER_ROLES = [USER_ROLE.SUPER_ADMIN] as const satisfies readonly UserRole[];
export const ADMIN_AND_SUPER_MANAGER_ROLES = [USER_ROLE.ADMINISTRATOR, USER_ROLE.SUPER_ADMIN] as const satisfies readonly UserRole[];
