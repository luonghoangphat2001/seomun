import type { PaginationRequest } from '@/types/api';

export interface CustomerPaymentHistoryREQ extends PaginationRequest {
  customer_id: number;
}
