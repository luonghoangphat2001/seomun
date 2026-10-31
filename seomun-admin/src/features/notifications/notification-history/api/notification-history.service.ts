import { getNotificationHistoryListAPI, getNotificationHistorySearchFiltersAPI, resendNotificationHistoryAPI } from './notification-history.api';
import type { NotificationHistoryListREQ } from './notification-history.request';
import type {
  NotificationHistoryListRESP,
  NotificationHistoryListWireRESP,
  NotificationHistoryResendRESP,
  NotificationHistorySearchFiltersRESP,
} from './notification-history.response';

function unwrapNotificationHistoryListResponse(response: NotificationHistoryListWireRESP): NotificationHistoryListRESP {
  return {
    success: response.success,
    message: response.message,
    data: response.data.histories,
    pagination: response.data.pagination,
  };
}

export async function getNotificationHistoryList(params: NotificationHistoryListREQ): Promise<NotificationHistoryListRESP> {
  const response = await getNotificationHistoryListAPI(params);
  return unwrapNotificationHistoryListResponse(response);
}

export async function getNotificationHistorySearchFilters(): Promise<NotificationHistorySearchFiltersRESP> {
  return getNotificationHistorySearchFiltersAPI();
}

export async function resendNotificationHistory(notificationHistoryId: number): Promise<NotificationHistoryResendRESP> {
  return resendNotificationHistoryAPI(notificationHistoryId);
}
