import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { type AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import { createGuideAPI, deleteGuideAPI, getGuideByIdAPI, getGuidesAPI, getGuideSearchFiltersAPI, updateGuideAPI } from './guide.api';
import type { GuideListParams, GuidePayload } from './guide.request';
import type { Guide, GuideFilterFields, GuideListRESP } from './guide.response';

export const guideKeys = {
  all: ['guides'] as const,
  list: (params: GuideListParams) => [...guideKeys.all, 'list', params] as const,
  detail: (id: string) => [...guideKeys.all, 'detail', id] as const,
  filters: () => [...guideKeys.all, 'filters'] as const,
};

export const guideDetailQueryOptions = (id: string) => ({
  queryKey: guideKeys.detail(id),
  queryFn: () => getGuideByIdAPI(id),
  staleTime: 30_000,
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useGuidesQuery = (
  params: GuideListParams,
  options?: Omit<UseQueryOptions<GuideListRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GuideListRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: guideKeys.list(params),
    queryFn: () => getGuidesAPI(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useGuideDetailQuery = (id: string, options?: Omit<UseQueryOptions<Guide, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Guide, AxiosError<IBaseError>>({
    ...guideDetailQueryOptions(id),
    ...options,
  });
};

export const useGuidesFilterQuery = (options?: Omit<UseQueryOptions<GuideFilterFields, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<GuideFilterFields, AxiosError<IBaseError>>({
    ...options,
    queryKey: guideKeys.filters(),
    queryFn: () => getGuideSearchFiltersAPI(),
    staleTime: 5 * 60_000,
  });
};

export const useCreateGuideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Guide, AxiosError<IBaseError>, GuidePayload>({
    mutationFn: (payload) => createGuideAPI(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: guideKeys.all });
    },
  });
};

export const useUpdateGuideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Guide, AxiosError<IBaseError>, { id: string; payload: GuidePayload }>({
    mutationFn: ({ id, payload }) => updateGuideAPI(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: guideKeys.all });
    },
  });
};

export const useDeleteGuideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<IBaseError>, string>({
    mutationFn: (id) => deleteGuideAPI(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: guideKeys.all });
    },
  });
};
