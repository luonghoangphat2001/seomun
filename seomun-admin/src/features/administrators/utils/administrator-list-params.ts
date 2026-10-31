import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { AdministratorListREQ } from '../api/administrator.request';
import { AdministratorSortField } from '../enums';
import type { AdministratorListSearch } from '../schemas';

export type NormalizedAdministratorListParams = AdministratorListREQ & Required<Pick<AdministratorListREQ, 'page' | 'per_page'>>;

export function normalizeAdministratorQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildAdministratorListParams(search: AdministratorListSearch): NormalizedAdministratorListParams {
  return {
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
    sort_by: search.sort_by,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.ASC) : undefined,
    search_term: normalizeAdministratorQuery(search.search_term),
  };
}
const ADMINISTRATOR_SORT_FIELD_VALUES = new Set<string>(Object.values(AdministratorSortField));

export function isAdministratorSortField(value: string): value is AdministratorSortField {
  return ADMINISTRATOR_SORT_FIELD_VALUES.has(value);
}
