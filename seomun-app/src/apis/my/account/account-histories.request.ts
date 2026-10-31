import { PaginationREQ } from '@/types';

export type MyAccountHistoryListREQ = PaginationREQ & {
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'completed' | 'failed';
};
