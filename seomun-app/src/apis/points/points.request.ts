import { PaginationREQ } from '@/types';

export type PointTransactionType = 'earn' | 'use' | 'expire' | 'refund';
export type PointTransactionCategory = 'signup' | 'expire' | 'invite' | 'manual' | 'order';

export type PointTransactionListREQ = PaginationREQ & {
  type?: PointTransactionType;
  category?: PointTransactionCategory;
  search?: string;
  order_number?: string;
  start_date?: string;
  end_date?: string;
};
