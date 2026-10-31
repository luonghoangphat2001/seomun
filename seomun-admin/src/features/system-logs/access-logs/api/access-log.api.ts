import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { AccessLogExportREQ, AccessLogListRequest } from './access-log.request';
import type { AccessLogExportRESP, AccessLogListRESP, AccessLogSearchFilterRESP } from './access-log.response';

export function getAccessLogsAPI(params: AccessLogListRequest): Promise<AccessLogListRESP> {
  return api.get(ENDPOINTS.SYSTEM_LOGS.ACCESS_LIST, { params });
}
export function getAccessLogSearchFilterAPI(): Promise<AccessLogSearchFilterRESP> {
  return api.get(ENDPOINTS.SYSTEM_LOGS.ACCESS_SEARCH_FILTERS);
}

export function exportAccessLogsExcelAPI(payload: AccessLogExportREQ): Promise<AccessLogExportRESP> {
  return api.post(ENDPOINTS.SYSTEM_LOGS.ACCESS_EXPORT_EXCEL, payload);
}

export function checkAccessLogExportStatusAPI(historyId: string | number): Promise<AccessLogExportRESP> {
  return api.get(ENDPOINTS.SYSTEM_LOGS.ACCESS_CHECK_EXPORT_STATUS(historyId));
}
