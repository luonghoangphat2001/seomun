import { queryOptions, useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import {
  createPaperPriceAPI,
  deletePaperPriceAPI,
  getPaperPriceDetailAPI,
  getPaperPriceSearchFiltersAPI,
  getPaperPricesAPI,
  updatePaperPriceAPI,
} from './paper-price.api';
import type { PaperPriceCreateREQ, PaperPriceListREQ, PaperPriceUpdateREQ } from './paper-price.request';
import type { PaperPriceActionRESP, PaperPriceDetailRESP, PaperPriceListRESP, PaperPriceSearchFiltersRESP } from './paper-price.response';

export const paperPriceKeys = {
  all: ['products', 'unit-price-settings', 'paper-prices'] as const,
  lists: () => [...paperPriceKeys.all, 'list'] as const,
  list: (params: PaperPriceListREQ) => [...paperPriceKeys.lists(), params] as const,
  filters: () => [...paperPriceKeys.all, 'search-filters'] as const,
  detail: (id: number) => [...paperPriceKeys.all, 'detail', id] as const,
};

type PaperPriceListQueryKey = ReturnType<typeof paperPriceKeys.list>;
type PaperPriceFiltersQueryKey = ReturnType<typeof paperPriceKeys.filters>;
type PaperPriceDetailQueryKey = ReturnType<typeof paperPriceKeys.detail>;

export function paperPriceListQueryOptions(params: PaperPriceListREQ) {
  return queryOptions<PaperPriceListRESP, AxiosError<IBaseError>, PaperPriceListRESP, PaperPriceListQueryKey>({
    queryKey: paperPriceKeys.list(params),
    queryFn: () => getPaperPricesAPI(params),
    staleTime: 30_000,
  });
}

export function usePaperPricesQuery(
  params: PaperPriceListREQ,
  options?: Omit<UseQueryOptions<PaperPriceListRESP, AxiosError<IBaseError>, PaperPriceListRESP, PaperPriceListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PaperPriceListRESP, AxiosError<IBaseError>, PaperPriceListRESP, PaperPriceListQueryKey>({
    ...paperPriceListQueryOptions(params),
    ...options,
    // placeholderData: keepPreviousData,
  });
}

export function paperPriceSearchFiltersQueryOptions() {
  return queryOptions<PaperPriceSearchFiltersRESP, AxiosError<IBaseError>, PaperPriceSearchFiltersRESP, PaperPriceFiltersQueryKey>({
    queryKey: paperPriceKeys.filters(),
    queryFn: getPaperPriceSearchFiltersAPI,
    staleTime: 300_000,
  });
}

export function usePaperPriceSearchFiltersQuery(
  options?: Omit<
    UseQueryOptions<PaperPriceSearchFiltersRESP, AxiosError<IBaseError>, PaperPriceSearchFiltersRESP, PaperPriceFiltersQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PaperPriceSearchFiltersRESP, AxiosError<IBaseError>, PaperPriceSearchFiltersRESP, PaperPriceFiltersQueryKey>({
    ...paperPriceSearchFiltersQueryOptions(),
    ...options,
  });
}

export function paperPriceDetailQueryOptions(id: number) {
  return queryOptions<PaperPriceDetailRESP, AxiosError<IBaseError>, PaperPriceDetailRESP, PaperPriceDetailQueryKey>({
    queryKey: paperPriceKeys.detail(id),
    queryFn: () => getPaperPriceDetailAPI(id),
    staleTime: 30_000,
  });
}

export function usePaperPriceDetailQuery(
  id: number | null,
  options?: Omit<
    UseQueryOptions<PaperPriceDetailRESP, AxiosError<IBaseError>, PaperPriceDetailRESP, PaperPriceDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PaperPriceDetailRESP, AxiosError<IBaseError>, PaperPriceDetailRESP, PaperPriceDetailQueryKey>({
    ...paperPriceDetailQueryOptions(id ?? 0),
    enabled: id !== null,
    ...options,
  });
}

export function useCreatePaperPriceMutation(options?: UseMutationOptions<PaperPriceActionRESP, AxiosError<IBaseError>, PaperPriceCreateREQ>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => createPaperPriceAPI(payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: paperPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdatePaperPriceMutation(
  options?: UseMutationOptions<PaperPriceActionRESP, AxiosError<IBaseError>, { id: number; payload: PaperPriceUpdateREQ }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => updatePaperPriceAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: paperPriceKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: paperPriceKeys.detail(variables.id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeletePaperPriceMutation(options?: UseMutationOptions<void, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deletePaperPriceAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: paperPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
