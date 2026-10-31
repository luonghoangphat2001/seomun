import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import { compareDeliveryValues } from '../../utils';
import { ShipmentSortField } from '../../enums';
import type { Shipment } from '../../types';
import type { ShipmentListSearch } from '../schemas';

export type NormalizedShipmentListParams = ShipmentListSearch & {
  page: number;
  per_page: number;
};

export function buildShipmentListParams(search: ShipmentListSearch): NormalizedShipmentListParams {
  return {
    ...search,
    search_term: search.search_term?.trim() || undefined,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.DESC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

export function isShipmentSortField(value: string): value is ShipmentSortField {
  return Object.values(ShipmentSortField).includes(value as ShipmentSortField);
}

export function sortShipments(rows: Shipment[], params: NormalizedShipmentListParams) {
  const sortOrder = params.sort_order;

  if (!params.sort_by || !sortOrder) {
    return rows;
  }

  return [...rows].sort((first, second) => {
    switch (params.sort_by) {
      case ShipmentSortField.SHIPMENT_DATE:
        return compareDeliveryValues(first.shipped_at, second.shipped_at, sortOrder);
      case ShipmentSortField.ORDER_NUMBER:
        return compareDeliveryValues(first.order_number, second.order_number, sortOrder);
      default:
        return 0;
    }
  });
}
