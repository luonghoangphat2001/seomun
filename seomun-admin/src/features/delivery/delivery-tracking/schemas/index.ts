import { z } from 'zod';

import { SortOrder } from '@/enums';

import { DeliveryTrackingSortField, DeliveryTrackingStage } from '../../enums';

export const trackingListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(DeliveryTrackingSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  search_term: z.coerce.string().optional().catch(undefined),
  delivery_status: z.enum(DeliveryTrackingStage).optional().catch(undefined),
  invoice_number: z.coerce.string().optional().catch(undefined),
  order_number: z.coerce.string().optional().catch(undefined),
  customer_name: z.coerce.string().optional().catch(undefined),
  product_name: z.coerce.string().optional().catch(undefined),
  waybill_registration_date_from: z.coerce.string().optional().catch(undefined),
  waybill_registration_date_to: z.coerce.string().optional().catch(undefined),
});

export type TrackingListSearch = z.infer<typeof trackingListSearchSchema>;

export type TrackingSearchFilterValues = Pick<
  TrackingListSearch,
  | 'delivery_status'
  | 'invoice_number'
  | 'order_number'
  | 'customer_name'
  | 'product_name'
  | 'waybill_registration_date_from'
  | 'waybill_registration_date_to'
> & {
  search_term: string;
};

export const EMPTY_TRACKING_SEARCH_FILTER_VALUES: TrackingSearchFilterValues = {
  search_term: '',
  delivery_status: undefined,
  invoice_number: undefined,
  order_number: undefined,
  customer_name: undefined,
  product_name: undefined,
  waybill_registration_date_from: undefined,
  waybill_registration_date_to: undefined,
};
