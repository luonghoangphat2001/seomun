import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { DeliveryTracking } from '../../types';
import { compareDeliveryValues, isDateWithinRange, normalizeDeliveryQuery } from '../../utils';
import { DeliveryTrackingSortField } from '../../enums';
import type { TrackingListSearch } from '../schemas';

export type NormalizedTrackingListParams = TrackingListSearch & {
  page: number;
  per_page: number;
};

export function buildTrackingListParams(search: TrackingListSearch): NormalizedTrackingListParams {
  return {
    ...search,
    search_term: search.search_term?.trim() || undefined,
    invoice_number: search.invoice_number?.trim() || undefined,
    order_number: search.order_number?.trim() || undefined,
    customer_name: search.customer_name?.trim() || undefined,
    product_name: search.product_name?.trim() || undefined,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.DESC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

export function isTrackingSortField(value: string): value is DeliveryTrackingSortField {
  return Object.values(DeliveryTrackingSortField).includes(value as DeliveryTrackingSortField);
}

export function filterTrackings(rows: DeliveryTracking[], params: NormalizedTrackingListParams) {
  const query = normalizeDeliveryQuery(params.search_term);
  const invoiceNumber = normalizeDeliveryQuery(params.invoice_number);
  const orderNumber = normalizeDeliveryQuery(params.order_number);
  const customerName = normalizeDeliveryQuery(params.customer_name);
  const productName = normalizeDeliveryQuery(params.product_name);

  return rows.filter((row) => {
    const matchesQuery = query
      ? [row.invoice_number, row.order_number, row.customer_name, row.product_name].some((value) => value.toLowerCase().includes(query))
      : true;
    const matchesInvoiceNumber = invoiceNumber ? row.invoice_number.toLowerCase().includes(invoiceNumber) : true;
    const matchesOrderNumber = orderNumber ? row.order_number.toLowerCase().includes(orderNumber) : true;
    const matchesCustomerName = customerName ? row.customer_name.toLowerCase().includes(customerName) : true;
    const matchesProductName = productName ? row.product_name.toLowerCase().includes(productName) : true;
    const matchesStatus = params.delivery_status ? row.delivery_status === params.delivery_status : true;
    const matchesDate = isDateWithinRange(row.waybill_registered_at, params.waybill_registration_date_from, params.waybill_registration_date_to);

    return matchesQuery && matchesInvoiceNumber && matchesOrderNumber && matchesCustomerName && matchesProductName && matchesStatus && matchesDate;
  });
}

export function sortTrackings(rows: DeliveryTracking[], params: NormalizedTrackingListParams) {
  const sortOrder = params.sort_order;

  if (!params.sort_by || !sortOrder) {
    return rows;
  }

  return [...rows].sort((first, second) => {
    switch (params.sort_by) {
      case DeliveryTrackingSortField.INVOICE_NUMBER:
        return compareDeliveryValues(first.invoice_number, second.invoice_number, sortOrder);
      case DeliveryTrackingSortField.WAYBILL_REGISTERED_AT:
        return compareDeliveryValues(first.waybill_registered_at, second.waybill_registered_at, sortOrder);
      case DeliveryTrackingSortField.DELIVERY_STATUS:
        return compareDeliveryValues(first.delivery_status, second.delivery_status, sortOrder);
      default:
        return 0;
    }
  });
}
