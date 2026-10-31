import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type {
  NotificationTemplateCreateREQ,
  NotificationTemplateListREQ,
  NotificationTemplateToggleStatusREQ,
  NotificationTemplateUpdateREQ,
} from './notification-template.request';
import type {
  CopyNotificationTemplateRESP,
  CreateNotificationTemplateRESP,
  DeleteNotificationTemplateRESP,
  NotificationTemplateDetailRESP,
  NotificationTemplateListRESP,
  NotificationTemplateSearchFiltersRESP,
  ToggleNotificationTemplateStatusRESP,
  UpdateNotificationTemplateRESP,
} from './notification-template.response';

export function getNotificationTemplateListAPI(params: NotificationTemplateListREQ): Promise<NotificationTemplateListRESP> {
  return api.get(ENDPOINTS.NOTIFICATIONS.TEMPLATES_LIST, { params });
}

export function getNotificationTemplateSearchFiltersAPI(): Promise<NotificationTemplateSearchFiltersRESP> {
  return api.get(ENDPOINTS.NOTIFICATIONS.TEMPLATES_SEARCH_FILTERS);
}

export function getNotificationTemplateDetailAPI(id: number): Promise<NotificationTemplateDetailRESP> {
  return api.get(ENDPOINTS.NOTIFICATIONS.TEMPLATE_DETAIL(id));
}

export function copyNotificationTemplateAPI(id: number): Promise<CopyNotificationTemplateRESP> {
  return api.post(ENDPOINTS.NOTIFICATIONS.TEMPLATE_COPY(id));
}

export function createNotificationTemplateAPI(data: NotificationTemplateCreateREQ): Promise<CreateNotificationTemplateRESP> {
  return api.post(ENDPOINTS.NOTIFICATIONS.TEMPLATES_CREATE, data);
}

export function updateNotificationTemplateAPI(id: number, data: NotificationTemplateUpdateREQ): Promise<UpdateNotificationTemplateRESP> {
  return api.put(ENDPOINTS.NOTIFICATIONS.TEMPLATE_UPDATE(id), data);
}

export function deleteNotificationTemplateAPI(id: number): Promise<DeleteNotificationTemplateRESP> {
  return api.delete(ENDPOINTS.NOTIFICATIONS.TEMPLATE_DELETE(id));
}

export function toggleNotificationTemplateStatusAPI(
  id: number,
  data: NotificationTemplateToggleStatusREQ,
): Promise<ToggleNotificationTemplateStatusRESP> {
  return api.put(ENDPOINTS.NOTIFICATIONS.TEMPLATE_TOGGLE_STATUS(id), data);
}
