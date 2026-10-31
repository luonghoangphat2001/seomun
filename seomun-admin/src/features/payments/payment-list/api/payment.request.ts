import type { PaginationRequest, SortRequest } from '@/types/api';
import type { PaymentExportExcelType, PaymentMethod, PaymentPeriod, PaymentSortField, PaymentStatus } from '../enums';

export interface PaymentListREQ extends PaginationRequest, SortRequest<PaymentSortField> {
  search_term?: string;
  order_date_from?: string;
  order_date_to?: string;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
}

export interface PaymentExportExcelREQ extends SortRequest<PaymentSortField> {
  export_type: PaymentExportExcelType;
  selected_ids?: string[];
  current_page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
  search_term?: string;
  order_date_from?: string;
  order_date_to?: string;
  status?: PaymentStatus;
}

export interface ExportProgressREQ {
  historyId: number;
}

export interface PaymentRefundREQ {
  reason: string;
  amount?: number | null;
}

export interface PaymentStatisticREQ {
  customer_ids?: number[];
  period?: PaymentPeriod;
}
