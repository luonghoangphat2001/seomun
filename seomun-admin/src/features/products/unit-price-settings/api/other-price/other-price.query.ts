import { queryOptions, useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import {
  createOtherUnitPriceAPI,
  deleteOtherUnitPriceAPI,
  getOtherUnitPriceDetailAPI,
  getOtherUnitPriceItemsAPI,
  getOtherUnitPricesAPI,
  toggleOtherUnitPriceStatusAPI,
  updateOtherUnitPriceAPI,
} from './other-price.api';
import type { OtherUnitPriceCreateREQ, OtherUnitPriceListREQ, OtherUnitPriceUpdateREQ } from './other-price.request';
import type { OtherUnitPriceActionRESP, OtherUnitPriceDetailRESP, OtherUnitPriceItemsRESP, OtherUnitPriceListRESP } from './other-price.response';

export const otherUnitPriceKeys = {
  all: ['products', 'unit-price-settings', 'other-unit-prices'] as const,
  lists: () => [...otherUnitPriceKeys.all, 'list'] as const,
  list: (params: OtherUnitPriceListREQ) => [...otherUnitPriceKeys.lists(), params] as const,
  detail: (id: number) => [...otherUnitPriceKeys.all, 'detail', id] as const,
  items: (unitPriceId: number) => [...otherUnitPriceKeys.all, 'items', unitPriceId] as const,
};

type OtherUnitPriceListQueryKey = ReturnType<typeof otherUnitPriceKeys.list>;
type OtherUnitPriceDetailQueryKey = ReturnType<typeof otherUnitPriceKeys.detail>;
type OtherUnitPriceItemsQueryKey = ReturnType<typeof otherUnitPriceKeys.items>;

export function otherUnitPriceListQueryOptions(params: OtherUnitPriceListREQ) {
  return queryOptions<OtherUnitPriceListRESP, AxiosError<IBaseError>, OtherUnitPriceListRESP, OtherUnitPriceListQueryKey>({
    queryKey: otherUnitPriceKeys.list(params),
    queryFn: () => getOtherUnitPricesAPI(params),
    staleTime: 30_000,
  });
}

export function useOtherUnitPricesQuery(
  params: OtherUnitPriceListREQ,
  options?: Omit<
    UseQueryOptions<OtherUnitPriceListRESP, AxiosError<IBaseError>, OtherUnitPriceListRESP, OtherUnitPriceListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<OtherUnitPriceListRESP, AxiosError<IBaseError>, OtherUnitPriceListRESP, OtherUnitPriceListQueryKey>({
    ...otherUnitPriceListQueryOptions(params),
    ...options,
    // placeholderData: keepPreviousData,
  });
}

export function otherUnitPriceDetailQueryOptions(id: number) {
  return queryOptions<OtherUnitPriceDetailRESP, AxiosError<IBaseError>, OtherUnitPriceDetailRESP, OtherUnitPriceDetailQueryKey>({
    queryKey: otherUnitPriceKeys.detail(id),
    queryFn: () => getOtherUnitPriceDetailAPI(id),
    staleTime: 30_000,
  });
}

export function useOtherUnitPriceDetailQuery(
  id: number | null,
  options?: Omit<
    UseQueryOptions<OtherUnitPriceDetailRESP, AxiosError<IBaseError>, OtherUnitPriceDetailRESP, OtherUnitPriceDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<OtherUnitPriceDetailRESP, AxiosError<IBaseError>, OtherUnitPriceDetailRESP, OtherUnitPriceDetailQueryKey>({
    ...otherUnitPriceDetailQueryOptions(id ?? 0),
    enabled: id !== null,
    ...options,
  });
}

export function otherUnitPriceItemsQueryOptions(unitPriceId: number) {
  return queryOptions<OtherUnitPriceItemsRESP, AxiosError<IBaseError>, OtherUnitPriceItemsRESP, OtherUnitPriceItemsQueryKey>({
    queryKey: otherUnitPriceKeys.items(unitPriceId),
    queryFn: () => getOtherUnitPriceItemsAPI(unitPriceId),
    staleTime: 30_000,
  });
}

export function useOtherUnitPriceItemsQuery(
  unitPriceId: number | null,
  options?: Omit<
    UseQueryOptions<OtherUnitPriceItemsRESP, AxiosError<IBaseError>, OtherUnitPriceItemsRESP, OtherUnitPriceItemsQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<OtherUnitPriceItemsRESP, AxiosError<IBaseError>, OtherUnitPriceItemsRESP, OtherUnitPriceItemsQueryKey>({
    ...otherUnitPriceItemsQueryOptions(unitPriceId ?? 0),
    enabled: unitPriceId !== null,
    ...options,
  });
}

export function useCreateOtherUnitPriceMutation(
  options?: UseMutationOptions<OtherUnitPriceActionRESP, AxiosError<IBaseError>, OtherUnitPriceCreateREQ>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => createOtherUnitPriceAPI(payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: otherUnitPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateOtherUnitPriceMutation(
  options?: UseMutationOptions<OtherUnitPriceActionRESP, AxiosError<IBaseError>, { id: number; payload: OtherUnitPriceUpdateREQ }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => updateOtherUnitPriceAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: otherUnitPriceKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: otherUnitPriceKeys.detail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: otherUnitPriceKeys.items(variables.id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteOtherUnitPriceMutation(options?: UseMutationOptions<void, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deleteOtherUnitPriceAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: otherUnitPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useToggleOtherUnitPriceStatusMutation(options?: UseMutationOptions<OtherUnitPriceActionRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => toggleOtherUnitPriceStatusAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: otherUnitPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
