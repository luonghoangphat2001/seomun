import type { PaginationRequest, SortRequest } from '@/types/api';

import type { DeliveryTrackingExportExcelType, DeliveryTrackingSortField, DeliveryTrackingStage } from '../../enums';

export interface DeliveryTrackingListREQ extends PaginationRequest, SortRequest<DeliveryTrackingSortField> {
  search_term?: string;
  delivery_status?: DeliveryTrackingStage;
  invoice_number?: string;
  order_number?: string;
  customer_name?: string;
  product_name?: string;
  waybill_registration_date_from?: string;
  waybill_registration_date_to?: string;
}

export interface DeliveryTrackingExportREQ extends SortRequest<DeliveryTrackingSortField> {
  export_type: DeliveryTrackingExportExcelType;
  selected_ids?: number[];
  current_page?: number;
  per_page?: number;
  search_term?: string;
  invoice_number?: string;
  order_number?: string;
  customer_name?: string;
  product_name?: string;
  delivery_status?: string;
  waybill_registration_date_from?: string;
  waybill_registration_date_to?: string;
  locale?: 'en' | 'ko';
}
