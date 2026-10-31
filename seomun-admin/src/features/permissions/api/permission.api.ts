import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { PermissionCopyREQ, PermissionCreateREQ, PermissionListREQ, PermissionMenuSettingsREQ, PermissionUpdateREQ } from './permission.request';
import type {
  MyMenuPermissionsRESP,
  PermissionDeleteRESP,
  PermissionDetailRESP,
  PermissionListRESP,
  PermissionMenuSettingsRESP,
  PermissionMenuSettingsUpdateRESP,
} from './permission.response';

export function getMyMenuPermissionsAPI(): Promise<MyMenuPermissionsRESP> {
  return api.get<MyMenuPermissionsRESP>(ENDPOINTS.PERMISSIONS.ME);
}

export function getPermissionsAPI(params: PermissionListREQ): Promise<PermissionListRESP> {
  return api.get<PermissionListRESP>(ENDPOINTS.PERMISSIONS.LIST, { params });
}

export function getPermissionAPI(permissionId: number): Promise<PermissionDetailRESP> {
  return api.get<PermissionDetailRESP>(ENDPOINTS.PERMISSIONS.DETAIL(permissionId));
}

export function createPermissionAPI(data: PermissionCreateREQ): Promise<PermissionDetailRESP> {
  return api.post<PermissionDetailRESP>(ENDPOINTS.PERMISSIONS.CREATE, data);
}

export function updatePermissionAPI(permissionId: number, data: PermissionUpdateREQ): Promise<PermissionDetailRESP> {
  return api.put<PermissionDetailRESP>(ENDPOINTS.PERMISSIONS.UPDATE(permissionId), data);
}

export function deletePermissionAPI(permissionId: number): Promise<PermissionDeleteRESP> {
  return api.delete<PermissionDeleteRESP>(ENDPOINTS.PERMISSIONS.DELETE(permissionId));
}

export function copyPermissionAPI(permissionId: number, data: PermissionCopyREQ): Promise<PermissionDetailRESP> {
  return api.post<PermissionDetailRESP>(ENDPOINTS.PERMISSIONS.COPY(permissionId), data);
}

export function getPermissionMenuSettingsAPI(permissionId: number): Promise<PermissionMenuSettingsRESP> {
  return api.get<PermissionMenuSettingsRESP>(ENDPOINTS.PERMISSIONS.MENU_STRUCTURE(permissionId));
}

export function updatePermissionMenuSettingsAPI(permissionId: number, data: PermissionMenuSettingsREQ): Promise<PermissionMenuSettingsUpdateRESP> {
  return api.put<PermissionMenuSettingsUpdateRESP>(ENDPOINTS.PERMISSIONS.SETTINGS(permissionId), data);
}
