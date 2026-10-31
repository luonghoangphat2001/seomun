import type { BulkGenerateTaxInvoiceREQ, BulkStatusTaxInvoiceREQ, CreateTaxInvoiceREQ, TaxInvoiceListREQ } from './tax-invoice.request';
import type {
  TaxInvoiceActionRESP,
  TaxInvoiceBulkActionRESP,
  TaxInvoiceBulkGenerateRESP,
  TaxInvoiceListRESP,
  TaxInvoiceSearchFiltersRESP,
} from './tax-invoice.response';
import {
  bulkGenerateTaxInvoicesAPI,
  bulkStatusTaxInvoicesAPI,
  checkTaxInvoiceExportStatusAPI,
  createTaxInvoiceAPI,
  deleteTaxInvoiceAPI,
  downloadTaxInvoiceExcelAPI,
  exportTaxInvoicesExcelAPI,
  getTaxInvoiceSearchFiltersAPI,
  getTaxInvoicesAPI,
  issueTaxInvoiceAPI,
  setTaxInvoicePendingAPI,
} from './tax-invoice.api';

export function getTaxInvoiceSearchFilters(): Promise<TaxInvoiceSearchFiltersRESP> {
  return getTaxInvoiceSearchFiltersAPI();
}

export function getTaxInvoiceList(params: TaxInvoiceListREQ): Promise<TaxInvoiceListRESP> {
  return getTaxInvoicesAPI(params);
}

export function createTaxInvoice(payload: CreateTaxInvoiceREQ): Promise<TaxInvoiceActionRESP> {
  return createTaxInvoiceAPI(payload);
}

export function exportTaxInvoicesExcel(params: TaxInvoiceListREQ) {
  return exportTaxInvoicesExcelAPI(params);
}

export function checkTaxInvoiceExportStatus(historyId: string | number) {
  return checkTaxInvoiceExportStatusAPI(historyId);
}

export function downloadTaxInvoiceExcel(historyId: string | number) {
  return downloadTaxInvoiceExcelAPI(historyId);
}

export function issueTaxInvoice(id: string): Promise<TaxInvoiceActionRESP> {
  return issueTaxInvoiceAPI(id);
}

export function setTaxInvoicePending(id: string): Promise<TaxInvoiceActionRESP> {
  return setTaxInvoicePendingAPI(id);
}

export function deleteTaxInvoice(id: string): Promise<TaxInvoiceActionRESP> {
  return deleteTaxInvoiceAPI(id);
}

export function bulkGenerateTaxInvoices(payload: BulkGenerateTaxInvoiceREQ): Promise<TaxInvoiceBulkGenerateRESP> {
  return bulkGenerateTaxInvoicesAPI(payload);
}

export function bulkStatusTaxInvoices(payload: BulkStatusTaxInvoiceREQ): Promise<TaxInvoiceBulkActionRESP> {
  return bulkStatusTaxInvoicesAPI(payload);
}
