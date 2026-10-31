import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type {
  ErpOptionCreateREQ,
  ErpOptionExportREQ,
  ErpOptionGroupExportREQ,
  ErpOptionGroupListREQ,
  ErpOptionListREQ,
  ErpOptionUpdateREQ,
  PaperCreateREQ,
  PaperListREQ,
  PaperUpdateREQ,
  SizeOptionCreateREQ,
  SizeOptionListREQ,
  SizeOptionUpdateREQ,
} from './option.request';
import type {
  ErpExportRESP,
  ErpOptionActionRESP,
  ErpOptionDetailRESP,
  ErpOptionGroupActionRESP,
  ErpOptionGroupDetailRESP,
  ErpOptionGroupListRESP,
  ErpOptionListRESP,
  PaperDetailRESP,
  PaperListRESP,
  SizeOptionDetailRESP,
  SizeOptionListRESP,
} from './option.response';

export function getAdminErpOptionGroupsAPI(params: ErpOptionGroupListREQ): Promise<ErpOptionGroupListRESP> {
  return api.get(ENDPOINTS.OPTIONS.ERP_OPTION_GROUPS.LIST, { params });
}

export function getAdminErpOptionGroupDetailAPI(id: number): Promise<ErpOptionGroupDetailRESP> {
  return api.get(ENDPOINTS.OPTIONS.ERP_OPTION_GROUPS.DETAIL(String(id)));
}

export function deleteErpOptionGroupAPI(id: number): Promise<ErpOptionGroupActionRESP> {
  return api.delete(ENDPOINTS.OPTIONS.ERP_OPTION_GROUPS.DELETE(String(id)));
}

export function exportErpOptionGroupsAPI(params: ErpOptionGroupExportREQ): Promise<ErpExportRESP> {
  return api.post(ENDPOINTS.OPTIONS.ERP_OPTION_GROUPS.EXPORT, params);
}

export function checkErpOptionGroupExportStatusAPI(historyId: number): Promise<ErpExportRESP> {
  return api.get(ENDPOINTS.OPTIONS.ERP_OPTION_GROUPS.CHECK_EXPORT_STATUS(historyId));
}

export function getAdminErpOptionsAPI(params: ErpOptionListREQ): Promise<ErpOptionListRESP> {
  return api.get(ENDPOINTS.OPTIONS.ERP_OPTIONS.LIST, { params });
}

export function getAdminErpOptionDetailAPI(id: number): Promise<ErpOptionDetailRESP> {
  return api.get(ENDPOINTS.OPTIONS.ERP_OPTIONS.DETAIL(String(id)));
}

export function createErpOptionAPI(payload: ErpOptionCreateREQ & { erp_option_group_id: number }): Promise<ErpOptionActionRESP> {
  return api.post(ENDPOINTS.OPTIONS.ERP_OPTIONS.CREATE, payload);
}

export function updateErpOptionAPI(id: number, payload: ErpOptionUpdateREQ): Promise<ErpOptionActionRESP> {
  return api.put(ENDPOINTS.OPTIONS.ERP_OPTIONS.UPDATE(String(id)), payload);
}

export function deleteErpOptionAPI(id: number): Promise<ErpOptionActionRESP> {
  return api.delete(ENDPOINTS.OPTIONS.ERP_OPTIONS.DELETE(String(id)));
}

export function exportErpOptionsAPI(params: ErpOptionExportREQ): Promise<ErpExportRESP> {
  return api.post(ENDPOINTS.OPTIONS.ERP_OPTIONS.EXPORT, params);
}

export function checkErpOptionExportStatusAPI(historyId: number): Promise<ErpExportRESP> {
  return api.get(ENDPOINTS.OPTIONS.ERP_OPTIONS.CHECK_EXPORT_STATUS(historyId));
}

export function getSizeOptionsAPI(params: SizeOptionListREQ): Promise<SizeOptionListRESP> {
  return api.get(ENDPOINTS.SIZE_OPTIONS.LIST, { params });
}

export function getSizeOptionDetailAPI(id: number): Promise<SizeOptionDetailRESP> {
  return api.get(ENDPOINTS.SIZE_OPTIONS.DETAIL(id));
}

export function createSizeOptionAPI(payload: SizeOptionCreateREQ): Promise<SizeOptionDetailRESP> {
  return api.post(ENDPOINTS.SIZE_OPTIONS.LIST, payload);
}

export function updateSizeOptionAPI(id: number, payload: SizeOptionUpdateREQ): Promise<SizeOptionDetailRESP> {
  return api.put(ENDPOINTS.SIZE_OPTIONS.UPDATE(id), payload);
}

export function getPapersAPI(params: PaperListREQ): Promise<PaperListRESP> {
  return api.get(ENDPOINTS.PAPER_OPTIONS.LIST, { params });
}

export function createPaperAPI(payload: PaperCreateREQ): Promise<PaperDetailRESP> {
  return api.post(ENDPOINTS.PAPER_OPTIONS.LIST, payload);
}

export function updatePaperAPI(id: number, payload: PaperUpdateREQ): Promise<PaperDetailRESP> {
  return api.put(ENDPOINTS.PAPER_OPTIONS.UPDATE(id), payload);
}

export function deletePaperAPI(id: number): Promise<PaperDetailRESP> {
  return api.delete(ENDPOINTS.PAPER_OPTIONS.DELETE(id));
}
