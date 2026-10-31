import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { TaxInvoiceIssueStatus } from '../enums';

export interface TaxInvoiceSearchFilters {
  issue_statuses: TaxInvoiceStatus[];
}

export interface TaxInvoice {
  id: number;
  order_id: number;
  transaction_id: string;
  pg_transaction_id: string | null;
  pg_name: string | null;
  payment_method: string;
  status: string;
  amount: string;
  currency: string;
  card_name: string | null;
  card_number: string | null;
  virtual_account_number: string | null;
  virtual_account_bank: string | null;
  bank_account_holder: string | null;
  refund_reason: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  tax_invoice_status: TaxInvoiceIssueStatus;
  tax_invoice_issued_at: string | null;
  cash_receipt_status: string | null;
  cash_receipt_issued_at: string | null;
  receipt_notes: string | null;
  created_at: string;
  updated_at: string;
  order: OderTaxInvoice;
}

export interface OderTaxInvoice {
  id: number;
  order_number: string;
  order_external_number: string | null;
  product_name: string;
  company_name: string | null;
  contact_name: string | null;
  total_amount: string;
  status: string;
  payment_method: string;
  user: OrderUser;
}

export interface OrderUser {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  customer: UserCustomer | null;
}

export interface UserCustomer {
  id: number;
  company_name: string;
}

export interface TaxInvoiceStatus {
  value: TaxInvoiceIssueStatus;
  label: string;
}

export interface TaxInvoiceExportHistory {
  id: number;
  user_id: number;
  module: string;
  file_name: string;
  file_path: string;
  status: string;
  filters: unknown;
  created_at: string;
  updated_at: string;
}

export interface TaxInvoiceBulkGenerateSkipped {
  order_id: number;
  reason: string;
}

export type TaxInvoiceSearchFiltersRESP = BaseResponse<{ filters: TaxInvoiceSearchFilters }>;
export type TaxInvoiceListRESP = PaginationResponse<{ items: TaxInvoice[] }>;
export type TaxInvoiceActionRESP = BaseResponse<{ transaction: TaxInvoice }>;
export type TaxInvoiceBulkActionRESP = BaseResponse<{ updated_count: number }>;
export type TaxInvoiceBulkGenerateRESP = BaseResponse<{
  created_count: number;
  skipped_count: number;
  created: TaxInvoice[];
  skipped: TaxInvoiceBulkGenerateSkipped[];
}>;
export type TaxInvoiceExportRESP = BaseResponse<{ history: TaxInvoiceExportHistory }>;
