import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { NoticeListParams, NoticeExposureLocation } from '../api';
import { NoticeSortField } from '../enums';
import type { NoticeListSearch } from '../schemas';

export type NormalizedNoticeListParams = NoticeListParams & Required<Pick<NoticeListParams, 'page' | 'per_page'>>;

export function buildNoticeListParams(search: NoticeListSearch): NormalizedNoticeListParams {
  return {
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
    sort_by: search.sort_by as NoticeSortField | undefined,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.ASC) : undefined,
    search_term: search.search_term,
    author_id: search.author_id,
    type: search.type,
    exposure_status: search.exposure_status,
    exposure_location: search.exposure_location as NoticeExposureLocation | undefined,
  };
}

const NOTICE_SORT_FIELD_VALUES = new Set<string>(Object.values(NoticeSortField));

export function isNoticeSortField(value: string): value is NoticeSortField {
  return NOTICE_SORT_FIELD_VALUES.has(value);
}
