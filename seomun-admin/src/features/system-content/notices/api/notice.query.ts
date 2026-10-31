import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { type AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { NoticeListParams, NoticePayload } from './notice.request';
import type { Notice, NoticeFilterFields, NoticeListRESP } from './notice.response';
import { getNoticesAPI, getNoticeByIdAPI, createNoticeAPI, updateNoticeAPI, deleteNoticeAPI, getNoticeSearchFiltersAPI } from './notice.api';

export const noticeKeys = {
  all: ['notices'] as const,
  list: (params: NoticeListParams) => [...noticeKeys.all, 'list', params] as const,
  detail: (id: string) => [...noticeKeys.all, 'detail', id] as const,
  filters: () => [...noticeKeys.all, 'filters'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useNoticesQuery = (
  params: NoticeListParams,
  options?: Omit<UseQueryOptions<NoticeListRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<NoticeListRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: noticeKeys.list(params),
    queryFn: () => getNoticesAPI(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const noticeDetailQueryOptions = (id: string) => ({
  queryKey: noticeKeys.detail(id),
  queryFn: () => getNoticeByIdAPI(id),
  staleTime: 30_000,
});

export const useNoticeDetailQuery = (id: string, options?: Omit<UseQueryOptions<Notice | null, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Notice | null, AxiosError<IBaseError>>({
    ...noticeDetailQueryOptions(id),
    ...options,
  });
};

export const useNoticesFilterQuery = (options?: Omit<UseQueryOptions<NoticeFilterFields, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<NoticeFilterFields, AxiosError<IBaseError>>({
    ...options,
    queryKey: noticeKeys.filters(),
    queryFn: () => getNoticeSearchFiltersAPI(),
    staleTime: 5 * 60_000,
  });
};

export const useCreateNoticeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Notice, AxiosError<IBaseError>, NoticePayload>({
    mutationFn: (payload) => createNoticeAPI(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
};

export const useUpdateNoticeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Notice, AxiosError<IBaseError>, { id: string; payload: NoticePayload }>({
    mutationFn: ({ id, payload }) => updateNoticeAPI(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
};

export const useDeleteNoticeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<IBaseError>, string>({
    mutationFn: (id) => deleteNoticeAPI(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noticeKeys.all });
    },
  });
};
