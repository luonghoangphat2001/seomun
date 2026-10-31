import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { BaseResponse } from '@/types/api';

import type { BulkGenerateCashReceiptREQ, BulkStatusCashReceiptREQ, CreateCashReceiptREQ, CashReceiptListREQ } from './cash-receipt.request';
import type {
  CashReceiptActionRESP,
  CashReceiptBulkActionRESP,
  CashReceiptBulkGenerateRESP,
  CashReceiptExportRESP,
  CashReceiptListRESP,
  CashReceiptSearchFiltersRESP,
} from './cash-receipt.response';

// GET /admin/cash-receipts/search-filters — 검색 필터 옵션 조회
export function getCashReceiptSearchFiltersAPI(): Promise<CashReceiptSearchFiltersRESP> {
  return api.get<CashReceiptSearchFiltersRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.SEARCH_FILTERS);
}

// GET /admin/cash-receipts — 목록 조회
export function getCashReceiptsAPI(params: CashReceiptListREQ): Promise<CashReceiptListRESP> {
  return api.get<CashReceiptListRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.LIST, { params });
}

// POST /admin/cash-receipts — 데이터 생성
export function createCashReceiptAPI(payload: CreateCashReceiptREQ): Promise<CashReceiptActionRESP> {
  return api.post<CashReceiptActionRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.CREATE, payload);
}

// POST /admin/cash-receipts/export-excel — Excel 내보내기 (request reuses list filter)
export function exportCashReceiptsExcelAPI(params: CashReceiptListREQ): Promise<CashReceiptExportRESP> {
  return api.post<CashReceiptExportRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.EXPORT_EXCEL, params);
}

// GET /admin/cash-receipts/export-excel/{historyId}/check-progress-status — 진행 상태 확인
export function checkCashReceiptExportStatusAPI(historyId: string | number): Promise<CashReceiptExportRESP> {
  return api.get<CashReceiptExportRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.CHECK_EXPORT_STATUS(historyId));
}

// GET /admin/cash-receipts/export-excel/{historyId}/download — Excel 파일 다운로드 (returns the file URL)
export function downloadCashReceiptExcelAPI(historyId: string | number): Promise<BaseResponse<string>> {
  return api.get<BaseResponse<string>>(ENDPOINTS.ORDERS.CASH_RECEIPTS.EXPORT_EXCEL_DOWNLOAD(historyId));
}

// PATCH /admin/cash-receipts/{id}/issue — 발행
export function issueCashReceiptAPI(id: string): Promise<CashReceiptActionRESP> {
  return api.patch<CashReceiptActionRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.ISSUE(id), {});
}

// PATCH /admin/cash-receipts/{id}/pending — 발행 대기 처리
export function setCashReceiptPendingAPI(id: string): Promise<CashReceiptActionRESP> {
  return api.patch<CashReceiptActionRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.PENDING(id), {});
}

// DELETE /admin/cash-receipts/{id} — 삭제 (soft delete → deleted)
export function deleteCashReceiptAPI(id: string): Promise<CashReceiptActionRESP> {
  return api.delete<CashReceiptActionRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.DELETE(id));
}

// POST /admin/cash-receipts/bulk-generate — 일괄 생성
export function bulkGenerateCashReceiptsAPI(payload: BulkGenerateCashReceiptREQ): Promise<CashReceiptBulkGenerateRESP> {
  return api.post<CashReceiptBulkGenerateRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.BULK_GENERATE, payload);
}

// PATCH /admin/cash-receipts/bulk-status — 일괄 상태 변경
export function bulkStatusCashReceiptsAPI(payload: BulkStatusCashReceiptREQ): Promise<CashReceiptBulkActionRESP> {
  return api.patch<CashReceiptBulkActionRESP>(ENDPOINTS.ORDERS.CASH_RECEIPTS.BULK_STATUS, payload);
}
