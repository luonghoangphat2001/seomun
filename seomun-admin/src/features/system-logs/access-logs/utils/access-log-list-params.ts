import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import { SortOrder } from '@/enums';
import type { AccessLogListRequest } from '../api';
import { AccessLogSortField } from '../enums';
import type { AccessLogListSearch } from '../schemas';

export type NormalizedAccessLogListParams = AccessLogListRequest & Required<Pick<AccessLogListRequest, 'page' | 'per_page'>>;

export function normalizeAccessLogQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildAccessLogListParams(search: AccessLogListSearch): NormalizedAccessLogListParams {
  return {
    search_term: normalizeAccessLogQuery(search.search_term),
    event_type: search.event_type,
    access_date_from: search.access_date_from,
    access_date_to: search.access_date_to,
    sort_by: search.sort_by,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.DESC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

const ACCESS_LOG_SORT_FIELD_VALUES = new Set<string>(Object.values(AccessLogSortField));

export function isAccessLogSortField(value: string): value is AccessLogSortField {
  return ACCESS_LOG_SORT_FIELD_VALUES.has(value);
}
