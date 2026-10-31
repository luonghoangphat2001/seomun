import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type {
  AdministratorBulkDeleteREQ,
  AdministratorBulkPermissionsREQ,
  AdministratorBulkStatusREQ,
  AdministratorCreateREQ,
  AdministratorExportREQ,
  AdministratorListREQ,
  AdministratorUpdatePasswordREQ,
  AdministratorUpdateREQ,
} from './administrator.request';
import type {
  AdministratorBulkRESP,
  AdministratorDeleteRESP,
  AdministratorDetailRESP,
  AdministratorExportRESP,
  AdministratorListRESP,
  AdministratorUpdatePasswordRESP,
} from './administrator.response';

export function getAdministratorListAPI(params?: AdministratorListREQ): Promise<AdministratorListRESP> {
  return api.get<AdministratorListRESP>(ENDPOINTS.ADMINISTRATORS.LIST, { params });
}

export function getAdministratorDetailAPI(administratorId: string): Promise<AdministratorDetailRESP> {
  return api.get<AdministratorDetailRESP>(ENDPOINTS.ADMINISTRATORS.DETAIL(administratorId));
}

export function createAdministratorAPI(data: AdministratorCreateREQ): Promise<AdministratorDetailRESP> {
  return api.post<AdministratorDetailRESP>(ENDPOINTS.ADMINISTRATORS.CREATE, data);
}

export function updateAdministratorAPI(administratorId: string, data: AdministratorUpdateREQ): Promise<AdministratorDetailRESP> {
  return api.patch<AdministratorDetailRESP>(ENDPOINTS.ADMINISTRATORS.UPDATE(administratorId), data);
}

export function updateAdministratorPasswordAPI(
  administratorId: string,
  data: AdministratorUpdatePasswordREQ,
): Promise<AdministratorUpdatePasswordRESP> {
  return api.put<AdministratorUpdatePasswordRESP>(ENDPOINTS.ADMINISTRATORS.UPDATE_PASSWORD(administratorId), data);
}

export function deleteAdministratorAPI(administratorId: number): Promise<AdministratorDeleteRESP> {
  return api.delete<AdministratorDeleteRESP>(ENDPOINTS.ADMINISTRATORS.DELETE(administratorId));
}

export function bulkUpdateAdministratorStatusAPI(data: AdministratorBulkStatusREQ): Promise<AdministratorBulkRESP> {
  return api.patch<AdministratorBulkRESP>(ENDPOINTS.ADMINISTRATORS.BULK_STATUS, data);
}

export function bulkUpdateAdministratorPermissionsAPI(data: AdministratorBulkPermissionsREQ): Promise<AdministratorBulkRESP> {
  return api.patch<AdministratorBulkRESP>(ENDPOINTS.ADMINISTRATORS.BULK_PERMISSIONS, data);
}

export function bulkDeleteAdministratorsAPI(data: AdministratorBulkDeleteREQ): Promise<AdministratorBulkRESP> {
  return api.delete<AdministratorBulkRESP>(ENDPOINTS.ADMINISTRATORS.BULK_DELETE, { data });
}

export function exportAdministratorsExcelAPI(data: AdministratorExportREQ): Promise<AdministratorExportRESP> {
  return api.post<AdministratorExportRESP>(ENDPOINTS.ADMINISTRATORS.EXPORT_EXCEL, data);
}

export function checkAdministratorExportStatusAPI(historyId: number): Promise<AdministratorExportRESP> {
  return api.get<AdministratorExportRESP>(ENDPOINTS.ADMINISTRATORS.CHECK_EXPORT_STATUS(historyId));
}
