import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { NotificationHistoryListREQ } from '../api/notification-history.request';
import { NotificationHistorySortField } from '../enums';
import type { NotificationHistoryListSearch } from '../schemas';

export type NormalizedNotificationHistoryListParams = NotificationHistoryListREQ & Required<Pick<NotificationHistoryListREQ, 'page' | 'per_page'>>;

export function normalizeNotificationHistoryKeyword(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildNotificationHistoryListParams(search: NotificationHistoryListSearch): NormalizedNotificationHistoryListParams {
  return {
    ...search,
    template_number: normalizeNotificationHistoryKeyword(search.template_number),
    notification_type: search.notification_type,
    recipient_name: normalizeNotificationHistoryKeyword(search.recipient_name),
    sending_result: search.sending_result,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.ASC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

const NOTIFICATION_HISTORY_SORT_FIELD_VALUES = new Set<string>(Object.values(NotificationHistorySortField));

export function isNotificationHistorySortField(value: string): value is NotificationHistorySortField {
  return NOTIFICATION_HISTORY_SORT_FIELD_VALUES.has(value);
}
