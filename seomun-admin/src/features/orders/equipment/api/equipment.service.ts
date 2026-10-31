import {
  checkEquipmentLogsExportStatusAPI,
  createEquipmentAPI,
  createEquipmentLogAPI,
  deleteEquipmentAPI,
  deleteEquipmentLogAPI,
  downloadEquipmentLogsExcelAPI,
  exportEquipmentLogsExcelAPI,
  getEquipmentDetailAPI,
  getEquipmentLogsAPI,
  getEquipmentsAPI,
  updateEquipmentAPI,
  updateEquipmentLogAPI,
} from './equipment.api';
import type { EquipmentCreateREQ, EquipmentListREQ, EquipmentLogCreateREQ, EquipmentUpdateREQ } from './equipment.request';
import type {
  EquipmentCreateRESP,
  EquipmentListRESP,
  EquipmentLogExportHistory,
  EquipmentLogRESP,
  EquipmentRESP,
  EquipmentUpdateRESP,
} from './equipment.response';

export async function getEquipmentList(params: EquipmentListREQ): Promise<EquipmentListRESP> {
  return getEquipmentsAPI(params);
}

export async function getEquipmentDetail(id: string): Promise<EquipmentRESP | null> {
  const response = await getEquipmentDetailAPI(id);
  return response.data.equipment ?? null;
}

export async function getEquipmentLogs(id: string): Promise<EquipmentLogRESP[]> {
  const response = await getEquipmentLogsAPI(id);
  return response.data.logs ?? [];
}

export async function createEquipmentLog(id: string, payload: EquipmentLogCreateREQ): Promise<EquipmentLogRESP> {
  const response = await createEquipmentLogAPI(id, payload);
  return response.data.log;
}

export async function exportEquipmentLogsExcel(id: string): Promise<EquipmentLogExportHistory> {
  const response = await exportEquipmentLogsExcelAPI(id);
  return response.data.history;
}

export async function checkEquipmentLogsExportStatus(historyId: string | number): Promise<EquipmentLogExportHistory> {
  const response = await checkEquipmentLogsExportStatusAPI(historyId);
  return response.data.history;
}

export async function downloadEquipmentLogsExcel(historyId: string | number): Promise<Blob> {
  return downloadEquipmentLogsExcelAPI(historyId);
}

export async function createEquipment(payload: EquipmentCreateREQ): Promise<EquipmentCreateRESP> {
  return createEquipmentAPI(payload);
}

export async function updateEquipment(id: string, payload: EquipmentUpdateREQ): Promise<EquipmentUpdateRESP> {
  return updateEquipmentAPI(id, payload);
}

export async function deleteEquipment(id: string): Promise<void> {
  await deleteEquipmentAPI(id);
}

export async function deleteEquipmentLog(id: string, logId: string | number): Promise<void> {
  await deleteEquipmentLogAPI(id, logId);
}

export async function updateEquipmentLog(id: string, logId: string | number, payload: EquipmentLogCreateREQ): Promise<EquipmentLogRESP> {
  const response = await updateEquipmentLogAPI(id, logId, payload);
  return response.data.log;
}
