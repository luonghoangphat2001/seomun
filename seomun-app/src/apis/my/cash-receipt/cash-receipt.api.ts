import { api } from '@/config';
import { BaseResponse, PaginationResponse } from '@/types';
import { CashReceiptExportExcelREQ, CashReceiptListREQ } from './cash-receipt.request';
import { CashReceiptExportExcelRESP, CashReceiptListRESP } from './cash-receipt.response';

const ENDPOINT = {
  LIST: '/mypage/cash-receipts',
  EXPORT_EXCEL: '/mypage/cash-receipts/export-excel',
};

export const CashReceiptApi = {
  list: (params?: CashReceiptListREQ) =>
    api.get<PaginationResponse<CashReceiptListRESP>>(ENDPOINT.LIST, {
      params,
    }),
  exportExcel: (body: CashReceiptExportExcelREQ) =>
    api.post<BaseResponse<CashReceiptExportExcelRESP>>(ENDPOINT.EXPORT_EXCEL, body),
};
