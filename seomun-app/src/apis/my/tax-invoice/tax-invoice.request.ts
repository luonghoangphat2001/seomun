import { PaginationREQ } from '@/types';

export type TaxInvoiceListREQ = PaginationREQ & {
  start_date?: string;
  end_date?: string;
  months?: 6;
  years?: 1 | 2 | 3;
};

export type TaxInvoiceExportExcelREQ = {
  start_date?: string;
  end_date?: string;
};
