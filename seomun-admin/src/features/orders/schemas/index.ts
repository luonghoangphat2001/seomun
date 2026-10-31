import { SortOrder } from '@/enums';
import { z } from 'zod';
import { OrderShippingMethod, OrderSortField, OrderStatus, OrderStatusGroup } from '../enums';

export const orderListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z
    .enum([OrderSortField.PLACED_AT, OrderSortField.ORDERER_NUMBER, OrderSortField.PAYMENT_AMOUNT, OrderSortField.STATUS])
    .optional()
    .catch(undefined),
  sort_order: z.enum([SortOrder.ASC, SortOrder.DESC]).optional().catch(undefined),
  search_term: z.coerce.string().optional().catch(undefined),
  status: z.enum(OrderStatus).optional().catch(undefined),
  status_group: z.enum(OrderStatusGroup).optional().catch(undefined),
  shipping_method: z.enum(OrderShippingMethod).optional().catch(undefined),
  order_date_from: z.string().optional().catch(undefined),
  order_date_to: z.string().optional().catch(undefined),
  selected_order_number: z.coerce.string().optional().catch(undefined),
});

export type OrderListSearch = z.infer<typeof orderListSearchSchema>;

export type OrderSearchFilterValues = {
  search_term: string;
  status?: OrderStatus;
  status_group?: OrderStatusGroup;
  shipping_method?: OrderShippingMethod;
  order_date_from?: string;
  order_date_to?: string;
};

export const EMPTY_ORDER_SEARCH_FILTER_VALUES: OrderSearchFilterValues = {
  search_term: '',
  status: undefined,
  order_date_from: undefined,
  order_date_to: undefined,
};
