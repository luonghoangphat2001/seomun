import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { CashReceiptIssueStatus } from '../enums';

export interface CashReceiptSearchFilters {
  issue_statuses: CashReceiptStatus[];
}

// A transaction record; the cash-receipt screen keys on `cash_receipt_status`.
export interface CashReceipt {
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
  metadata: unknown;
  tax_invoice_status: string | null;
  tax_invoice_issued_at: string | null;
  cash_receipt_status: CashReceiptIssueStatus;
  cash_receipt_issued_at: string | null;
  receipt_notes: string | null;
  created_at: string;
  updated_at: string;
  order: OderCashReceipt;
}

export interface OderCashReceipt {
  id: number;
  user_id: number;
  worker_id: number | null;
  product_id: number;
  order_number: string;
  order_external_number: string | null;
  product_name: string;
  company_name: string | null;
  contact_name: string | null;
  contact_phone: string;
  contact_phone2: string | null;
  contact_tel: string | null;
  contact_email: string | null;
  contact_postcode: string | null;
  contact_address: string | null;
  contact_address_detail: string | null;
  shipping_fee: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string | null;
  shipping_postcode: string | null;
  shipping_address: string | null;
  shipping_address_detail: string | null;
  shipping_branch_name: string | null;
  shipping_time: string | null;
  shipping_method: string;
  shipping_fee_type: string;
  sender_name: string | null;
  sender_phone: string | null;
  sender_zipcode: string | null;
  sender_address: string | null;
  sender_address2: string | null;
  currency: string;
  point_used: number;
  point_discount: number;
  total_amount: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal_amount: string;
  discount_amount: string;
  tax_amount: string;
  design_mode_code: string;
  design_mode_name: string | null;
  selected_options: string | null;
  estimated_production_days: number | null;
  requested_delivery_date: string | null;
  storage_date: string | null;
  placed_at: string;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: OrderUser;
}

export interface OrderUser {
  id: number;
  customer_id: number | null;
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

export interface CashReceiptStatus {
  value: CashReceiptIssueStatus;
  label: string;
}

export interface CashReceiptExportHistory {
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

export interface CashReceiptBulkGenerateSkipped {
  order_id: number;
  reason: string;
}

export type CashReceiptSearchFiltersRESP = BaseResponse<{ filters: CashReceiptSearchFilters }>;
export type CashReceiptListRESP = PaginationResponse<{ items: CashReceipt[] }>;
export type CashReceiptActionRESP = BaseResponse<{ transaction: CashReceipt }>;
export type CashReceiptBulkActionRESP = BaseResponse<{ updated_count: number }>;
export type CashReceiptBulkGenerateRESP = BaseResponse<{
  created_count: number;
  skipped_count: number;
  created: unknown[];
  skipped: CashReceiptBulkGenerateSkipped[];
}>;
export type CashReceiptExportRESP = BaseResponse<{ history: CashReceiptExportHistory }>;
