import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import type { TaxInvoiceListREQ } from '../api/tax-invoice.request';
import { TaxInvoiceSortField } from '../enums';
import type { TaxInvoiceListSearch } from '../schemas';

export type NormalizedTaxInvoiceListParams = TaxInvoiceListREQ & Required<Pick<TaxInvoiceListREQ, 'page' | 'per_page'>>;

export function buildTaxInvoiceListParams(search: TaxInvoiceListSearch): NormalizedTaxInvoiceListParams {
  const { tab: _tab, ...searchWithoutTab } = search;

  return {
    ...searchWithoutTab,
    order_code: normalizeTaxInvoiceQuery(search.order_code),
    order_number: normalizeTaxInvoiceQuery(search.order_number),
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

export function normalizeTaxInvoiceQuery(value?: string) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
}

const TAX_INVOICE_SORT_FIELD_VALUES = new Set<string>(Object.values(TaxInvoiceSortField));

export function isTaxInvoiceSortField(value: string): value is TaxInvoiceSortField {
  return TAX_INVOICE_SORT_FIELD_VALUES.has(value);
}
