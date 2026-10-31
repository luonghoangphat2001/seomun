import type { PaginationRequest } from '@/types/api';

import type { CashReceiptIssueStatus } from '../enums';

export interface CashReceiptListREQ extends PaginationRequest {
  date_from?: string;
  date_to?: string;
  issue_status?: CashReceiptIssueStatus;
  order_code?: string;
  order_number?: string;
}

export interface CreateCashReceiptREQ {
  order_id: number;
  notes: string;
}

export interface BulkGenerateCashReceiptREQ {
  order_ids: number[];
  notes?: string;
}

export interface BulkStatusCashReceiptREQ {
  ids: number[];
  status: CashReceiptIssueStatus;
}
