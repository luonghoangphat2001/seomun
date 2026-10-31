import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/config/endpoints';
import type { BaseResponse } from '@/types/api';
import type { ReportExportExcelRESP, ReportRESP } from './settlement-report.response';
import type { ReportExportExcelREQ, ReportListREQ } from './settlement-report.request';

export function getSettlementReportsAPI(params: ReportListREQ): Promise<ReportRESP> {
  return api.get<ReportRESP>(ENDPOINTS.PAYMENTS.REPORT_LIST, { params });
}

export function exportSettlementReportExcelAPI(params: ReportExportExcelREQ): Promise<BaseResponse<{ history: ReportExportExcelRESP }>> {
  return api.post<BaseResponse<{ history: ReportExportExcelRESP }>>(ENDPOINTS.PAYMENTS.REPORT_EXPORT, { params });
}

export function checkSettlementReportExportProgressStatusAPI(historyId: number): Promise<BaseResponse<{ history: ReportExportExcelRESP }>> {
  return api.get<BaseResponse<{ history: ReportExportExcelRESP }>>(ENDPOINTS.PAYMENTS.REPORT_CHECK_EXPORT_STATUS(historyId));
}
