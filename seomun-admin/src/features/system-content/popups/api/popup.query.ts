import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { type AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { PopupListParams, PopupPayload } from './popup.request';
import type { Popup, PopupFilterFields, PopupListRESP } from './popup.response';
import { createPopupAPI, deletePopupAPI, getPopupByIdAPI, getPopupsAPI, getPopupSearchFiltersAPI, updatePopupAPI } from './popup.api';

export const popupKeys = {
  all: ['popups'] as const,
  list: (params: PopupListParams) => [...popupKeys.all, 'list', params] as const,
  detail: (id: string) => [...popupKeys.all, 'detail', id] as const,
  filters: () => [...popupKeys.all, 'filters'] as const,
};

export const popupDetailQueryOptions = (id: string) => ({
  queryKey: popupKeys.detail(id),
  queryFn: () => getPopupByIdAPI(id),
  staleTime: 30_000,
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const usePopupsQuery = (
  params: PopupListParams,
  options?: Omit<UseQueryOptions<PopupListRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<PopupListRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: popupKeys.list(params),
    queryFn: () => getPopupsAPI(params),
    // placeholderData: keepPreviousData,
    // staleTime: 30_000,
  });
};

export const usePopupDetailQuery = (id: string, options?: Omit<UseQueryOptions<Popup, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Popup, AxiosError<IBaseError>>({
    ...popupDetailQueryOptions(id),
    ...options,
  });
};

export const usePopupsFilterQuery = (options?: Omit<UseQueryOptions<PopupFilterFields, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<PopupFilterFields, AxiosError<IBaseError>>({
    ...options,
    queryKey: popupKeys.filters(),
    queryFn: () => getPopupSearchFiltersAPI(),
    staleTime: 5 * 60_000,
  });
};

export const useCreatePopupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Popup, AxiosError<IBaseError>, PopupPayload>({
    mutationFn: (payload) => createPopupAPI(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: popupKeys.all });
    },
  });
};

export const useUpdatePopupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Popup, AxiosError<IBaseError>, { id: string; payload: PopupPayload }>({
    mutationFn: ({ id, payload }) => updatePopupAPI(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: popupKeys.all });
    },
  });
};

export const useDeletePopupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<IBaseError>, string>({
    mutationFn: (id) => deletePopupAPI(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: popupKeys.all });
    },
  });
};
