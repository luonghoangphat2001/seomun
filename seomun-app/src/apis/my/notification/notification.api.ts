import { api } from '@/config';
import { BaseResponse, PaginationResponse } from '@/types';
import { NotificationListREQ } from './notification.request';
import { NotificationListRESP, NotificationReadAllRESP, NotificationReadRESP } from './notification.response';

const ENDPOINT = {
  LIST: '/mypage/notifications',
  READ: (id: string) => `/mypage/notifications/${id}/read`,
  READ_ALL: '/mypage/notifications/read-all',
};

export const NotificationApi = {
  list: (params?: NotificationListREQ) => api.get<PaginationResponse<NotificationListRESP>>(ENDPOINT.LIST, { params }),
  markAsRead: (id: string) => api.patch<BaseResponse<NotificationReadRESP>>(ENDPOINT.READ(id), {}),
  markAllAsRead: () => api.patch<BaseResponse<NotificationReadAllRESP>>(ENDPOINT.READ_ALL, {}),
};
