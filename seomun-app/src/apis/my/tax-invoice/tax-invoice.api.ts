import { api } from '@/config';
import { BaseResponse, PaginationResponse } from '@/types';
import { TaxInvoiceExportExcelREQ, TaxInvoiceListREQ } from './tax-invoice.request';
import { TaxInvoiceExportExcelRESP, TaxInvoiceListRESP } from './tax-invoice.response';

const ENDPOINT = {
  LIST: '/mypage/tax-invoices',
  EXPORT_EXCEL: '/mypage/tax-invoices/export-excel',
};

export const TaxInvoiceApi = {
  list: (params?: TaxInvoiceListREQ) =>
    api.get<PaginationResponse<TaxInvoiceListRESP>>(ENDPOINT.LIST, {
      params,
    }),
  exportExcel: (body: TaxInvoiceExportExcelREQ) => api.post<BaseResponse<TaxInvoiceExportExcelRESP>>(ENDPOINT.EXPORT_EXCEL, body),
};
