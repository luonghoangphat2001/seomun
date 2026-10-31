import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { PaymentMethod, PaymentStatus } from '../enums';

export interface PaymentOrderRESP {
  id: number;
  order_number: string;
  order_external_number: string | null;
  payment_method: PaymentMethod;
  status: string;
  status_label_ko: string;
  status_label_en: string;
  payment_status: PaymentStatus;
  user: {
    name: string;
  };
  contact: {
    name: string;
    company_name: string | null;
    email: string | null;
    phone: string;
  };
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping_fee: number;
    total: number;
  };
  product: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentRESP {
  id: number;
  transaction_id: string;
  order: PaymentOrderRESP;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  currency: string;
  pg_name: string | null;
  pg_response: object | null;
  pg_request: object | null;
  card_name: string | null;
  card_number: string | null;
  virtual_account_number: string | null;
  virtual_account_bank: string | null;
  virtual_account_expires_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
  meta_data: object | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentSelectedOption {
  group: { id: number; code: string; name: string };
  option: { id: number; label: string; value: string; additional_price: number };
}

export interface PaymentDetailOrderRESP extends PaymentOrderRESP {
  user: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  product: {
    id: number;
    name: string;
    images: string | null;
  };
  shipping: {
    name: string | null;
    phone: string | null;
    postcode: string | null;
    address: string | null;
    address_detail: string | null;
    shipping_memo: string | null;
  };
  metadata: {
    selected_options: PaymentSelectedOption[];
    customer_note: string | null;
  } | null;
}

export interface PaymentDetailRESP extends Omit<PaymentRESP, 'order'> {
  order: PaymentDetailOrderRESP;
}

export interface PaymentExportExcelRESP {
  id: number;
  user_id: number;
  module: string;
  file_name: string;
  file_path: string | null;
  status: string;
  filters: object | null;
  created_at: string;
  updated_at: string;
}

export interface StatisticsRESP {
  start_date: string;
  end_date: string;
  sales_statistics: SaleStatistics;
  payment_status_statistics: PaymentStatusStatistics;
}

export interface PaymentReceiptRESP {
  pdf_url: string;
}

export interface SaleStatistics {
  payment_method: string;
  payment_method_label: string;
  total_count: number;
  successful_count: number;
  failed_count: number;
  successful_amount: number;
  failed_amount: number;
  total_amount: number;
  successful_percentage: number;
  failed_percentage: number;
  amount_percentage: number;
  unit: string;
}

export interface PaymentStatusStatistics {
  successful: PaymentStatusDetail;
  failed: PaymentStatusDetail;
}

export interface PaymentStatusDetail {
  count: number;
  amount: number;
  percentage_count: number;
}

export type PaymentListRESP = PaginationResponse<{ payments: PaymentRESP[] }>;
export type PaymentDetailResultRESP = BaseResponse<{ payment: PaymentDetailRESP }>;
export type PaymentRefundRESP = BaseResponse<null>;
export type PaymentExportRESP = BaseResponse<{ history: PaymentExportExcelRESP }>;

export type PaymentExportProgressResultRESP = BaseResponse<{ history: PaymentExportExcelRESP }>;
