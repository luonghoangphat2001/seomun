import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { BaseResponse } from '@/types/api';

import type { EquipmentCreateREQ, EquipmentListREQ, EquipmentLogCreateREQ, EquipmentUpdateREQ } from './equipment.request';
import type {
  EquipmentCreateRESP,
  EquipmentDetailRESP,
  EquipmentListRESP,
  EquipmentLogCreateRESP,
  EquipmentLogExportRESP,
  EquipmentLogsRESP,
  EquipmentUpdateRESP,
} from './equipment.response';

export function getEquipmentsAPI(params: EquipmentListREQ): Promise<EquipmentListRESP> {
  return api.get<EquipmentListRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.LIST, { params });
}

export function getEquipmentDetailAPI(id: string): Promise<EquipmentDetailRESP> {
  return api.get<EquipmentDetailRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.DETAIL(id));
}

export function getEquipmentLogsAPI(id: string): Promise<EquipmentLogsRESP> {
  return api.get<EquipmentLogsRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.LOGS(id));
}

export function exportEquipmentLogsExcelAPI(id: string): Promise<EquipmentLogExportRESP> {
  return api.post<EquipmentLogExportRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.EXPORT_LOGS_EXCEL(id));
}

export function checkEquipmentLogsExportStatusAPI(historyId: string | number): Promise<EquipmentLogExportRESP> {
  return api.get<EquipmentLogExportRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.CHECK_LOGS_EXPORT_STATUS(historyId));
}

export function downloadEquipmentLogsExcelAPI(historyId: string | number): Promise<Blob> {
  return api.get<Blob>(ENDPOINTS.ORDERS.EQUIPMENTS.DOWNLOAD_LOGS_EXCEL(historyId), { responseType: 'blob' });
}

export function createEquipmentAPI(payload: EquipmentCreateREQ): Promise<EquipmentCreateRESP> {
  return api.post<EquipmentCreateRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.CREATE, payload);
}

export function updateEquipmentAPI(id: string, payload: EquipmentUpdateREQ): Promise<EquipmentUpdateRESP> {
  return api.put<EquipmentUpdateRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.UPDATE(id), payload);
}

export function createEquipmentLogAPI(id: string, payload: EquipmentLogCreateREQ): Promise<EquipmentLogCreateRESP> {
  return api.post<EquipmentLogCreateRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.CREATE_LOG(id), payload);
}

export function deleteEquipmentAPI(id: string): Promise<BaseResponse<null>> {
  return api.delete<BaseResponse<null>>(ENDPOINTS.ORDERS.EQUIPMENTS.DELETE(id));
}

export function deleteEquipmentLogAPI(id: string, logId: string | number): Promise<BaseResponse<null>> {
  return api.delete<BaseResponse<null>>(ENDPOINTS.ORDERS.EQUIPMENTS.DELETE_LOG(id, logId));
}

export function updateEquipmentLogAPI(id: string, logId: string | number, payload: EquipmentLogCreateREQ): Promise<EquipmentLogCreateRESP> {
  return api.put<EquipmentLogCreateRESP>(ENDPOINTS.ORDERS.EQUIPMENTS.UPDATE_LOG(id, logId), payload);
}
