import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { PaymentListREQ } from '../api/payment.request';
import { PaymentSortField } from '../enums';
import type { PaymentListSearch } from '../schemas';

export type NormalizedPaymentListParams = PaymentListREQ & Required<Pick<PaymentListREQ, 'page' | 'per_page'>>;

export function buildPaymentListParams(search: PaymentListSearch): NormalizedPaymentListParams {
  return {
    ...search,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.ASC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

const PAYMENT_SORT_FIELD_VALUES = new Set<string>(Object.values(PaymentSortField));

export function isPaymentSortField(value: string): value is PaymentSortField {
  return PAYMENT_SORT_FIELD_VALUES.has(value);
}
