import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { type AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { BannerListParams, BannerPayload } from './banner.request';
import type { Banner, BannerFilterFields, BannerListRESP } from './banner.response';
import { getBannersAPI, getBannerByIdAPI, createBannerAPI, updateBannerAPI, deleteBannerAPI, getBannerSearchFiltersAPI } from './banner.api';

export const bannerKeys = {
  all: ['banners'] as const,
  list: (params: BannerListParams) => [...bannerKeys.all, 'list', params] as const,
  detail: (id: string) => [...bannerKeys.all, 'detail', id] as const,
  filters: () => [...bannerKeys.all, 'filters'] as const,
};

export const bannerDetailQueryOptions = (id: string) => ({
  queryKey: bannerKeys.detail(id),
  queryFn: () => getBannerByIdAPI(id),
  staleTime: 30_000,
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useBannersQuery = (
  params: BannerListParams,
  options?: Omit<UseQueryOptions<BannerListRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<BannerListRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: bannerKeys.list(params),
    queryFn: () => getBannersAPI(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useBannerDetailQuery = (id: string, options?: Omit<UseQueryOptions<Banner, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Banner, AxiosError<IBaseError>>({
    ...bannerDetailQueryOptions(id),
    ...options,
  });
};

export const useBannersFilterQuery = (options?: Omit<UseQueryOptions<BannerFilterFields, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<BannerFilterFields, AxiosError<IBaseError>>({
    ...options,
    queryKey: bannerKeys.filters(),
    queryFn: () => getBannerSearchFiltersAPI(),
    staleTime: 5 * 60_000,
  });
};

export const useCreateBannerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Banner, AxiosError<IBaseError>, BannerPayload>({
    mutationFn: (payload) => createBannerAPI(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    },
  });
};

export const useUpdateBannerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Banner, AxiosError<IBaseError>, { id: string; payload: BannerPayload }>({
    mutationFn: ({ id, payload }) => updateBannerAPI(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    },
  });
};

export const useDeleteBannerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<IBaseError>, string>({
    mutationFn: (id) => deleteBannerAPI(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    },
  });
};
