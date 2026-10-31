import { BaseResponse, ErrorRESP, PaginationResponse } from '@/types';
import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { NotificationApi } from './notification.api';
import { NotificationListREQ } from './notification.request';
import { NotificationListRESP, NotificationReadAllRESP, NotificationReadRESP } from './notification.response';
import { transformNotificationRESPToItem } from './notification.service';

export const NOTIFICATION_QUERY_KEYS = {
  LIST: 'NOTIFICATION_LIST',
};

export const useNotificationListQuery = (
  params?: NotificationListREQ,
  options?: Omit<
    UseQueryOptions<PaginationResponse<NotificationListRESP>, AxiosError<ErrorRESP>>,
    'queryKey' | 'queryFn' | 'select'
  >,
) =>
  useQuery({
    queryKey: [NOTIFICATION_QUERY_KEYS.LIST, params],
    queryFn: () => NotificationApi.list(params),
    select: (resp) => ({
      list: resp.data.notifications.map(transformNotificationRESPToItem),
      unreadCount: resp.data.unread_count,
      pagination: resp.pagination,
    }),
    ...options,
  });

export const useNotificationReadMutation = (
  options?: UseMutationOptions<BaseResponse<NotificationReadRESP>, AxiosError<ErrorRESP>, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEYS.LIST] });
    },
    ...options,
  });
};

export const useNotificationReadAllMutation = (
  options?: UseMutationOptions<BaseResponse<NotificationReadAllRESP>, AxiosError<ErrorRESP>, void>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEYS.LIST] });
    },
    ...options,
  });
};
