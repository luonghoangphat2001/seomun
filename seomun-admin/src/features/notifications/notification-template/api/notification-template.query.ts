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

import type { NotificationTemplateListSearch } from '../schemas';
import { buildNotificationTemplateListParams } from '../utils/notification-template-list-params';
import {
  copyNotificationTemplateAPI,
  createNotificationTemplateAPI,
  deleteNotificationTemplateAPI,
  getNotificationTemplateDetailAPI,
  getNotificationTemplateListAPI,
  getNotificationTemplateSearchFiltersAPI,
  toggleNotificationTemplateStatusAPI,
  updateNotificationTemplateAPI,
} from './notification-template.api';
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

export const notificationTemplateKeys = {
  all: ['notifications', 'templates'] as const,
  lists: () => [...notificationTemplateKeys.all, 'list'] as const,
  list: (params: NotificationTemplateListREQ) => [...notificationTemplateKeys.lists(), params] as const,
  filters: () => [...notificationTemplateKeys.all, 'search-filters'] as const,
  details: () => [...notificationTemplateKeys.all, 'detail'] as const,
  detail: (notificationTemplateId: number) => [...notificationTemplateKeys.details(), notificationTemplateId] as const,
};

type NotificationTemplateListQueryKey = ReturnType<typeof notificationTemplateKeys.list>;
type NotificationTemplateFiltersQueryKey = ReturnType<typeof notificationTemplateKeys.filters>;
type NotificationTemplateDetailQueryKey = ReturnType<typeof notificationTemplateKeys.detail>;

export function notificationTemplateListQueryOptions(params: NotificationTemplateListREQ) {
  return queryOptions<NotificationTemplateListRESP, AxiosError<IBaseError>, NotificationTemplateListRESP, NotificationTemplateListQueryKey>({
    queryKey: notificationTemplateKeys.list(params),
    queryFn: () => getNotificationTemplateListAPI(params),
    staleTime: 30_000,
  });
}

export function notificationTemplateListQueryOptionsBySearch(search: NotificationTemplateListSearch) {
  return notificationTemplateListQueryOptions(buildNotificationTemplateListParams(search));
}

export function notificationTemplateSearchFiltersQueryOptions() {
  return queryOptions<
    NotificationTemplateSearchFiltersRESP,
    AxiosError<IBaseError>,
    NotificationTemplateSearchFiltersRESP,
    NotificationTemplateFiltersQueryKey
  >({
    queryKey: notificationTemplateKeys.filters(),
    queryFn: getNotificationTemplateSearchFiltersAPI,
    staleTime: 300_000,
  });
}

export function notificationTemplateDetailQueryOptions(notificationTemplateId: number) {
  return queryOptions<NotificationTemplateDetailRESP, AxiosError<IBaseError>, NotificationTemplateDetailRESP, NotificationTemplateDetailQueryKey>({
    queryKey: notificationTemplateKeys.detail(notificationTemplateId),
    queryFn: () => getNotificationTemplateDetailAPI(notificationTemplateId),
    staleTime: 30_000,
  });
}

export function useNotificationTemplatesQuery(
  params: NotificationTemplateListREQ,
  options?: Omit<
    UseQueryOptions<NotificationTemplateListRESP, AxiosError<IBaseError>, NotificationTemplateListRESP, NotificationTemplateListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<NotificationTemplateListRESP, AxiosError<IBaseError>, NotificationTemplateListRESP, NotificationTemplateListQueryKey>({
    ...notificationTemplateListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useNotificationTemplateSearchFiltersQuery(
  options?: Omit<
    UseQueryOptions<
      NotificationTemplateSearchFiltersRESP,
      AxiosError<IBaseError>,
      NotificationTemplateSearchFiltersRESP,
      NotificationTemplateFiltersQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<
    NotificationTemplateSearchFiltersRESP,
    AxiosError<IBaseError>,
    NotificationTemplateSearchFiltersRESP,
    NotificationTemplateFiltersQueryKey
  >({
    ...notificationTemplateSearchFiltersQueryOptions(),
    ...options,
  });
}

export function useNotificationTemplateDetailQuery(
  notificationTemplateId: number,
  options?: Omit<
    UseQueryOptions<NotificationTemplateDetailRESP, AxiosError<IBaseError>, NotificationTemplateDetailRESP, NotificationTemplateDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<NotificationTemplateDetailRESP, AxiosError<IBaseError>, NotificationTemplateDetailRESP, NotificationTemplateDetailQueryKey>({
    ...notificationTemplateDetailQueryOptions(notificationTemplateId),
    ...options,
  });
}

export function useCreateNotificationTemplateMutation(
  options?: UseMutationOptions<CreateNotificationTemplateRESP, AxiosError<IBaseError>, NotificationTemplateCreateREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createNotificationTemplateAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.filters() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateNotificationTemplateMutation(
  notificationTemplateId: number,
  options?: UseMutationOptions<UpdateNotificationTemplateRESP, AxiosError<IBaseError>, NotificationTemplateUpdateREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (payload: NotificationTemplateUpdateREQ) => updateNotificationTemplateAPI(notificationTemplateId, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.detail(notificationTemplateId) });
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.filters() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteNotificationTemplateMutation(options?: UseMutationOptions<DeleteNotificationTemplateRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteNotificationTemplateAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.filters() });
      await queryClient.removeQueries({ queryKey: notificationTemplateKeys.detail(variables) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useToggleNotificationTemplateStatusMutation(
  options?: UseMutationOptions<
    ToggleNotificationTemplateStatusRESP,
    AxiosError<IBaseError>,
    { notificationTemplateId: number; payload: NotificationTemplateToggleStatusREQ }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ notificationTemplateId, payload }) => toggleNotificationTemplateStatusAPI(notificationTemplateId, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.detail(variables.notificationTemplateId) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCopyNotificationTemplateMutation(options?: UseMutationOptions<CopyNotificationTemplateRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: copyNotificationTemplateAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.filters() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
