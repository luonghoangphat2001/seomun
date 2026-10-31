import type { PaginationRequest } from '@/types/api';

import type { PermissionUsageStatus, PermissionAction } from '../enums';

export type PermissionListREQ = PaginationRequest & {
  search?: string;
  usage_status?: PermissionUsageStatus;
};

export type PermissionCreateREQ = {
  name: string;
  description?: string;
  usage_status: PermissionUsageStatus;
};

export type PermissionUpdateREQ = Partial<PermissionCreateREQ>;

export type PermissionCopyREQ = Omit<PermissionCreateREQ, 'description'>;

export interface PermissionMenuSettingsItemREQ {
  menu: string | number;
  actions: PermissionAction[];
}

export interface PermissionMenuSettingsREQ {
  menu_permissions: PermissionMenuSettingsItemREQ[];
}
