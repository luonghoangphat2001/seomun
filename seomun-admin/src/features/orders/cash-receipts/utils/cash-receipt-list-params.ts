import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import type { CashReceiptListREQ } from '../api/cash-receipt.request';
import { CashReceiptSortField } from '../enums';
import type { CashReceiptListSearch } from '../schemas';

export type NormalizedCashReceiptListParams = CashReceiptListREQ & Required<Pick<CashReceiptListREQ, 'page' | 'per_page'>>;

export function buildCashReceiptListParams(search: CashReceiptListSearch): NormalizedCashReceiptListParams {
  const { tab: _tab, ...searchWithoutTab } = search;

  return {
    ...searchWithoutTab,
    order_code: normalizeCashReceiptQuery(search.order_code),
    order_number: normalizeCashReceiptQuery(search.order_number),
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

export function normalizeCashReceiptQuery(value?: string) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
}

const CASH_RECEIPT_SORT_FIELD_VALUES = new Set<string>(Object.values(CashReceiptSortField));

export function isCashReceiptSortField(value: string): value is CashReceiptSortField {
  return CASH_RECEIPT_SORT_FIELD_VALUES.has(value);
}
