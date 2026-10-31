import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { BaseResponse } from '@/types/api';

import type { BulkGenerateTaxInvoiceREQ, BulkStatusTaxInvoiceREQ, CreateTaxInvoiceREQ, TaxInvoiceListREQ } from './tax-invoice.request';
import type {
  TaxInvoiceActionRESP,
  TaxInvoiceBulkActionRESP,
  TaxInvoiceBulkGenerateRESP,
  TaxInvoiceExportRESP,
  TaxInvoiceListRESP,
  TaxInvoiceSearchFiltersRESP,
} from './tax-invoice.response';

export function getTaxInvoiceSearchFiltersAPI(): Promise<TaxInvoiceSearchFiltersRESP> {
  return api.get<TaxInvoiceSearchFiltersRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.SEARCH_FILTERS);
}

export function getTaxInvoicesAPI(params: TaxInvoiceListREQ): Promise<TaxInvoiceListRESP> {
  return api.get<TaxInvoiceListRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.LIST, { params });
}

export function createTaxInvoiceAPI(payload: CreateTaxInvoiceREQ): Promise<TaxInvoiceActionRESP> {
  return api.post<TaxInvoiceActionRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.CREATE, payload);
}

export function exportTaxInvoicesExcelAPI(params: TaxInvoiceListREQ): Promise<TaxInvoiceExportRESP> {
  return api.post<TaxInvoiceExportRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.EXPORT_EXCEL, params);
}

export function checkTaxInvoiceExportStatusAPI(historyId: string | number): Promise<TaxInvoiceExportRESP> {
  return api.get<TaxInvoiceExportRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.CHECK_EXPORT_STATUS(historyId));
}

export function downloadTaxInvoiceExcelAPI(historyId: string | number): Promise<BaseResponse<string>> {
  return api.get<BaseResponse<string>>(ENDPOINTS.ORDERS.TAX_INVOICES.EXPORT_EXCEL_DOWNLOAD(historyId));
}

export function issueTaxInvoiceAPI(id: string): Promise<TaxInvoiceActionRESP> {
  return api.patch<TaxInvoiceActionRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.ISSUE(id), {});
}

export function setTaxInvoicePendingAPI(id: string): Promise<TaxInvoiceActionRESP> {
  return api.patch<TaxInvoiceActionRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.PENDING(id), {});
}

export function deleteTaxInvoiceAPI(id: string): Promise<TaxInvoiceActionRESP> {
  return api.delete<TaxInvoiceActionRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.DELETE(id));
}

export function bulkGenerateTaxInvoicesAPI(payload: BulkGenerateTaxInvoiceREQ): Promise<TaxInvoiceBulkGenerateRESP> {
  return api.post<TaxInvoiceBulkGenerateRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.BULK_GENERATE, payload);
}

export function bulkStatusTaxInvoicesAPI(payload: BulkStatusTaxInvoiceREQ): Promise<TaxInvoiceBulkActionRESP> {
  return api.patch<TaxInvoiceBulkActionRESP>(ENDPOINTS.ORDERS.TAX_INVOICES.BULK_STATUS, payload);
}
