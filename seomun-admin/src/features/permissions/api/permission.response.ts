import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { PermissionAction, PermissionMenuKey, PermissionUsageStatus } from '../enums';

/** An admin account: registrant of a permission, or one of its assigned users. */
export type PermissionUserRESP = {
  id: number;
  /** Login ID, shown as "Name (ID)". */
  username: string;
  name: string;
};

export type PermissionMenuPermissionRESP = {
  menu: string | number;
  actions: PermissionAction[];
};

export type UsageStatus = {
  value: PermissionUsageStatus;
  label: string;
};

export type PermissionRESP = {
  id: number;
  no?: number;
  name: string;
  description: string;
  usage_status: UsageStatus;
  menu_permissions: PermissionMenuPermissionRESP[];
  /** Admins currently assigned this permission (`admin_permissions.admin_permission_id`).
   *  ponytail: optional until BE ships it in GET /admin/permissions; the list shows "-" meanwhile. */
  users?: PermissionUserRESP[];
  registrant: PermissionUserRESP | null;
  created_at: string;
  updated_at: string;
};

export type MyMenuPermissionsRESP = BaseResponse<{
  user_id: number;
  name: string;
  email: string;
  permissions: PermissionMenuPermissionRESP[];
}>;

export type PermissionMenuItemRESP = {
  id: number;
  key: PermissionMenuKey;
  name: string;
  show_in_navigation?: boolean;
};

export type PermissionMenuGroupRESP = {
  id: number;
  key: PermissionMenuKey;
  name: string;
  sort_order?: number;
  menus: PermissionMenuItemRESP[];
};

export type PermissionMenuSettingsRESP = BaseResponse<{
  permission?: Pick<PermissionRESP, 'id' | 'name'> & Partial<Pick<PermissionRESP, 'menu_permissions'>>;
  groups?: PermissionMenuGroupRESP[];
  menu_structure?: PermissionMenuGroupRESP[];
}>;

export type PermissionDetailRESP = BaseResponse<{
  permission: PermissionRESP;
}>;

export type PermissionMenuSettingsUpdateRESP = PermissionDetailRESP;

export type PermissionDeleteRESP = BaseResponse<Record<string, never>>;

export type PermissionListRESP = PaginationResponse<{
  permissions: PermissionRESP[];
}>;
