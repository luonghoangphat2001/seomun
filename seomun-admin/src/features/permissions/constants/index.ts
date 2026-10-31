import type { AppSelectOption } from '@/components/shared/app-select';

import { PermissionUsageStatus } from '../enums';

export const PERMISSION_USAGE_STATUS_OPTIONS: AppSelectOption[] = [
  { value: PermissionUsageStatus.ACTIVE, label: '' },
  { value: PermissionUsageStatus.INACTIVE, label: '' },
];

export { getNavItemMenuKey, PERMISSION_MENU_NAV_KEYS } from './menu-nav-keys';
