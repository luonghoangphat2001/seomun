import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';
import type { OrderListREQ } from '../api/order.request';
import type { OrderListSearch } from '../schemas';

export type NormalizedOrderListParams = OrderListREQ & Required<Pick<OrderListREQ, 'page' | 'per_page'>>;

export function normalizeOrderQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildOrderListParams(search: OrderListSearch): NormalizedOrderListParams {
  const { selected_order_number: _selected, ...listSearch } = search;

  return {
    ...listSearch,
    search_term: normalizeOrderQuery(search.search_term),
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.DESC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
