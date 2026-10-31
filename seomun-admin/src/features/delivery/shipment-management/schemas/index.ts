import { z } from 'zod';

import { SortOrder } from '@/enums';

import { OrderShippingMethod } from '@/features/orders/enums';

import { ShipmentFilterStatus, ShipmentSortField, ShipmentType } from '../../enums';

export const shipmentListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(ShipmentSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  search_term: z.coerce.string().optional().catch(undefined),
  order_number: z.coerce.string().optional().catch(undefined),
  customer_name: z.coerce.string().optional().catch(undefined),
  product_name: z.coerce.string().optional().catch(undefined),
  shipping_manager_id: z.coerce.number().int().optional().catch(undefined),
  shipment_status: z.enum(ShipmentFilterStatus).optional().catch(undefined),
  shipment_type: z.enum(ShipmentType).optional().catch(undefined),
  shipping_method: z.enum(OrderShippingMethod).optional().catch(undefined),
  shipment_date_from: z.coerce.string().optional().catch(undefined),
  shipment_date_to: z.coerce.string().optional().catch(undefined),
});

export type ShipmentListSearch = z.infer<typeof shipmentListSearchSchema>;

export type ShipmentSearchFilterValues = Pick<
  ShipmentListSearch,
  | 'shipment_status'
  | 'shipment_type'
  | 'shipping_method'
  | 'shipment_date_from'
  | 'shipment_date_to'
  | 'order_number'
  | 'customer_name'
  | 'product_name'
  | 'shipping_manager_id'
> & {
  search_term: string;
};

export const EMPTY_SHIPMENT_SEARCH_FILTER_VALUES: ShipmentSearchFilterValues = {
  search_term: '',
  order_number: undefined,
  customer_name: undefined,
  product_name: undefined,
  shipping_manager_id: undefined,
  shipment_status: undefined,
  shipment_type: undefined,
  shipping_method: undefined,
  shipment_date_from: undefined,
  shipment_date_to: undefined,
};
