import { PaginationREQ } from '@/types';

export type CashReceiptListREQ = PaginationREQ & {
  start_date?: string;
  end_date?: string;
  months?: 6;
  years?: 1 | 2 | 3;
};

export type CashReceiptExportExcelREQ = {
  start_date?: string;
  end_date?: string;
};
