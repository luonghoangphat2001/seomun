import { PaginationREQ } from '@/types';

export type DepositStatusListREQ = PaginationREQ & {
  start_date?: string;
  end_date?: string;
  months?: 1 | 3 | 6;
  search?: string;
};

export type DepositStatusExportExcelREQ = {
  start_date?: string;
  end_date?: string;
  months?: 1 | 3 | 6;
  search?: string;
};
