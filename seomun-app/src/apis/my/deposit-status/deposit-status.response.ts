import { PaginationRESP, PaginationResponse } from '@/types';
import { ExportExcelHistoryRESP } from '../export-excel/export-excel.response';

export type DepositStatusItemRESP = {
  id: number;
  order_number: string;
  payment_method: string;
  amount: string;
  depositor: string;
  paid_at: string;
};

export type DepositStatusListDataRESP = {
  items: DepositStatusItemRESP[];
  total: string;
};

export type DepositStatusListRESP = PaginationResponse<DepositStatusListDataRESP> & {
  pagination: PaginationRESP;
};

export type DepositStatusExportExcelRESP = {
  history: ExportExcelHistoryRESP;
};
