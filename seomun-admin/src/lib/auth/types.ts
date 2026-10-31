// export type UserRole = 'employee' | 'manager' | 'administrator' | 'super-manager';

// export type UserRole = 'employee' | 'manager' | 'administrator' | 'super_admin';
export const USER_ROLE = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMINISTRATOR: 'administrator',
  SUPER_ADMIN: 'super_admin',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
