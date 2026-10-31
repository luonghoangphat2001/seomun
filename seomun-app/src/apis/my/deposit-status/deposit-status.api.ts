import { api } from '@/config';
import { BaseResponse } from '@/types';
import { DepositStatusExportExcelREQ, DepositStatusListREQ } from './deposit-status.request';
import { DepositStatusExportExcelRESP, DepositStatusListRESP } from './deposit-status.response';

const ENDPOINT = {
  LIST: '/mypage/deposit-status',
  EXPORT_EXCEL: '/mypage/deposit-status/export-excel',
};

export const DepositStatusApi = {
  list: (params?: DepositStatusListREQ) => api.get<DepositStatusListRESP>(ENDPOINT.LIST, { params }),
  exportExcel: (body: DepositStatusExportExcelREQ) =>
    api.post<BaseResponse<DepositStatusExportExcelRESP>>(ENDPOINT.EXPORT_EXCEL, body),
};
