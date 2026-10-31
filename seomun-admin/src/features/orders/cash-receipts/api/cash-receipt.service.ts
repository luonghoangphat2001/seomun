import type { BulkGenerateCashReceiptREQ, BulkStatusCashReceiptREQ, CreateCashReceiptREQ, CashReceiptListREQ } from './cash-receipt.request';
import type {
  CashReceiptActionRESP,
  CashReceiptBulkActionRESP,
  CashReceiptBulkGenerateRESP,
  CashReceiptListRESP,
  CashReceiptSearchFiltersRESP,
} from './cash-receipt.response';
import {
  bulkGenerateCashReceiptsAPI,
  bulkStatusCashReceiptsAPI,
  checkCashReceiptExportStatusAPI,
  createCashReceiptAPI,
  deleteCashReceiptAPI,
  downloadCashReceiptExcelAPI,
  exportCashReceiptsExcelAPI,
  getCashReceiptSearchFiltersAPI,
  getCashReceiptsAPI,
  issueCashReceiptAPI,
  setCashReceiptPendingAPI,
} from './cash-receipt.api';

export function getCashReceiptSearchFilters(): Promise<CashReceiptSearchFiltersRESP> {
  return getCashReceiptSearchFiltersAPI();
}

export function getCashReceiptList(params: CashReceiptListREQ): Promise<CashReceiptListRESP> {
  return getCashReceiptsAPI(params);
}

export function createCashReceipt(payload: CreateCashReceiptREQ): Promise<CashReceiptActionRESP> {
  return createCashReceiptAPI(payload);
}

export function exportCashReceiptsExcel(params: CashReceiptListREQ) {
  return exportCashReceiptsExcelAPI(params);
}

export function checkCashReceiptExportStatus(historyId: string | number) {
  return checkCashReceiptExportStatusAPI(historyId);
}

export function downloadCashReceiptExcel(historyId: string | number) {
  return downloadCashReceiptExcelAPI(historyId);
}

export function issueCashReceipt(id: string): Promise<CashReceiptActionRESP> {
  return issueCashReceiptAPI(id);
}

export function setCashReceiptPending(id: string): Promise<CashReceiptActionRESP> {
  return setCashReceiptPendingAPI(id);
}

export function deleteCashReceipt(id: string): Promise<CashReceiptActionRESP> {
  return deleteCashReceiptAPI(id);
}

export function bulkGenerateCashReceipts(payload: BulkGenerateCashReceiptREQ): Promise<CashReceiptBulkGenerateRESP> {
  return bulkGenerateCashReceiptsAPI(payload);
}

export function bulkStatusCashReceipts(payload: BulkStatusCashReceiptREQ): Promise<CashReceiptBulkActionRESP> {
  return bulkStatusCashReceiptsAPI(payload);
}
