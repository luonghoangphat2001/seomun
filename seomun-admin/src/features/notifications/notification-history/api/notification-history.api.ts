import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { NotificationHistoryListREQ } from './notification-history.request';
import type {
  NotificationHistoryListWireRESP,
  NotificationHistoryResendRESP,
  NotificationHistorySearchFiltersRESP,
} from './notification-history.response';

export function getNotificationHistoryListAPI(params: NotificationHistoryListREQ): Promise<NotificationHistoryListWireRESP> {
  return api.get(ENDPOINTS.NOTIFICATIONS.HISTORY_LIST, { params });
}

export function getNotificationHistorySearchFiltersAPI(): Promise<NotificationHistorySearchFiltersRESP> {
  return api.get(ENDPOINTS.NOTIFICATIONS.HISTORY_SEARCH_FILTERS);
}

export function resendNotificationHistoryAPI(notificationHistoryId: number): Promise<NotificationHistoryResendRESP> {
  return api.post(ENDPOINTS.NOTIFICATIONS.HISTORY_RESEND(notificationHistoryId));
}
