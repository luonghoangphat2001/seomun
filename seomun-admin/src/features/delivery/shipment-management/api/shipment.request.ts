import type { PaginationRequest, SortRequest } from '@/types/api';

import type { OrderShippingMethod } from '@/features/orders/enums';

import type { ShipmentExportExcelType, ShipmentFilterStatus, ShipmentSortField, ShipmentType } from '../../enums';

export interface ShipmentListREQ extends PaginationRequest, SortRequest<ShipmentSortField> {
  search_term?: string;
  order_number?: string;
  customer_name?: string;
  product_name?: string;
  shipping_manager_id?: number;
  shipment_status?: ShipmentFilterStatus;
  shipment_type?: ShipmentType;
  shipping_method?: OrderShippingMethod;
  shipment_date_from?: string;
  shipment_date_to?: string;
}

export interface ShipmentExportExcelREQ extends SortRequest<ShipmentSortField> {
  export_type: ShipmentExportExcelType;
  selected_ids?: number[];
  current_page?: number;
  per_page?: number;
  search_term?: string;
  order_number?: string;
  customer_name?: string;
  product_name?: string;
  shipping_manager_id?: number;
  shipment_status?: ShipmentFilterStatus;
  shipment_type?: ShipmentType;
  shipping_method?: OrderShippingMethod;
  shipment_date_from?: string;
  shipment_date_to?: string;
}

export interface ShipmentExportProgressREQ {
  historyId: number;
}

export interface ShipmentTrackingNumberREQ {
  shipment: number;
  tracking_number: string;
  carrier_name: string;
}

export type ShipmentTrackingInfoREQ = {
  invoice_number: string;
};
