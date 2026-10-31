import type { AppSelectOption } from '@/components/shared/app-select';
import { AdministratorRole, AdministratorStatus } from '../enums';

export const ADMINISTRATOR_ROLE_LABELS = {
  [AdministratorRole.SUPER_ADMIN]: 'Super Admin',
  [AdministratorRole.NORMAL_USER]: 'Normal User',
  [AdministratorRole.STORE_ADMIN]: 'Store Admin',
} satisfies Record<AdministratorRole, string>;

export const ADMINISTRATOR_STATUS_LABELS = {
  [AdministratorStatus.ACTIVE]: 'Active',
  [AdministratorStatus.INACTIVE]: 'Inactive',
} satisfies Record<AdministratorStatus, string>;

export const ADMINISTRATOR_STATUS_OPTIONS: AppSelectOption<AdministratorStatus>[] = [
  { value: AdministratorStatus.ACTIVE, label: ADMINISTRATOR_STATUS_LABELS[AdministratorStatus.ACTIVE] },
  { value: AdministratorStatus.INACTIVE, label: ADMINISTRATOR_STATUS_LABELS[AdministratorStatus.INACTIVE] },
];
