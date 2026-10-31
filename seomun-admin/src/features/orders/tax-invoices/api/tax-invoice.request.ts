import type { PaginationRequest } from '@/types/api';

import type { TaxInvoiceIssueStatus } from '../enums';

export interface TaxInvoiceListREQ extends PaginationRequest {
  date_from?: string;
  date_to?: string;
  issue_status?: TaxInvoiceIssueStatus;
  order_code?: string;
  order_number?: string;
}

export interface CreateTaxInvoiceREQ {
  order_id: number;
  notes: string;
}

export interface BulkGenerateTaxInvoiceREQ {
  order_ids: number[];
  notes?: string;
}

export interface BulkStatusTaxInvoiceREQ {
  ids: number[];
  status: TaxInvoiceIssueStatus;
}
