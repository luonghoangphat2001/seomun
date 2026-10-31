import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { FaqListREQ } from '../api/faq.request';
import { FaqSortField } from '../enums';
import type { FaqListSearch } from '../schemas';

export type NormalizedFaqListParams = FaqListREQ & Required<Pick<FaqListREQ, 'page' | 'per_page'>>;

export function normalizeFaqTitle(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildFaqListParams(search: FaqListSearch): NormalizedFaqListParams {
  return {
    ...search,
    title: normalizeFaqTitle(search.title),
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.ASC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

const FAQ_SORT_FIELD_VALUES = new Set<string>(Object.values(FaqSortField));

export function isFaqSortField(value: string): value is FaqSortField {
  return FAQ_SORT_FIELD_VALUES.has(value);
}
