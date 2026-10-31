import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { NotificationHistoryListSearch } from '../schemas';
import { buildNotificationHistoryListParams } from '../utils/notification-history-list-params';
import type { NotificationHistoryListREQ } from './notification-history.request';
import type {
  NotificationHistoryListRESP,
  NotificationHistoryResendRESP,
  NotificationHistorySearchFiltersRESP,
} from './notification-history.response';
import { getNotificationHistoryList, getNotificationHistorySearchFilters, resendNotificationHistory } from './notification-history.service';

export const notificationHistoryKeys = {
  all: ['notifications', 'history'] as const,
  lists: () => [...notificationHistoryKeys.all, 'list'] as const,
  list: (params: NotificationHistoryListREQ) => [...notificationHistoryKeys.lists(), params] as const,
  filters: () => [...notificationHistoryKeys.all, 'search-filters'] as const,
};

type NotificationHistoryListQueryKey = ReturnType<typeof notificationHistoryKeys.list>;
type NotificationHistoryFiltersQueryKey = ReturnType<typeof notificationHistoryKeys.filters>;

export function notificationHistoryListQueryOptions(params: NotificationHistoryListREQ) {
  return queryOptions<NotificationHistoryListRESP, AxiosError<IBaseError>, NotificationHistoryListRESP, NotificationHistoryListQueryKey>({
    queryKey: notificationHistoryKeys.list(params),
    queryFn: () => getNotificationHistoryList(params),
    staleTime: 30_000,
  });
}

export function notificationHistoryListQueryOptionsBySearch(search: NotificationHistoryListSearch) {
  return notificationHistoryListQueryOptions(buildNotificationHistoryListParams(search));
}

export function notificationHistorySearchFiltersQueryOptions() {
  return queryOptions<
    NotificationHistorySearchFiltersRESP,
    AxiosError<IBaseError>,
    NotificationHistorySearchFiltersRESP,
    NotificationHistoryFiltersQueryKey
  >({
    queryKey: notificationHistoryKeys.filters(),
    queryFn: getNotificationHistorySearchFilters,
    staleTime: 300_000,
  });
}

export function useNotificationHistoryQuery(
  params: NotificationHistoryListREQ,
  options?: Omit<
    UseQueryOptions<NotificationHistoryListRESP, AxiosError<IBaseError>, NotificationHistoryListRESP, NotificationHistoryListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<NotificationHistoryListRESP, AxiosError<IBaseError>, NotificationHistoryListRESP, NotificationHistoryListQueryKey>({
    ...notificationHistoryListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useNotificationHistorySearchFiltersQuery(
  options?: Omit<
    UseQueryOptions<
      NotificationHistorySearchFiltersRESP,
      AxiosError<IBaseError>,
      NotificationHistorySearchFiltersRESP,
      NotificationHistoryFiltersQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<
    NotificationHistorySearchFiltersRESP,
    AxiosError<IBaseError>,
    NotificationHistorySearchFiltersRESP,
    NotificationHistoryFiltersQueryKey
  >({
    ...notificationHistorySearchFiltersQueryOptions(),
    ...options,
  });
}

export function useResendNotificationHistoryMutation(options?: UseMutationOptions<NotificationHistoryResendRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: resendNotificationHistory,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: notificationHistoryKeys.lists(),
      });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
