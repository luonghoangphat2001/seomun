import { queryOptions, useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import {
  createPrintingPriceAPI,
  deletePrintingPriceAPI,
  getPrintingPriceDetailAPI,
  getPrintingPriceItemsAPI,
  getPrintingPricesAPI,
  updatePrintingPriceAPI,
} from './printing-price.api';
import type { PrintingPriceCreateREQ, PrintingPriceListREQ, PrintingPriceUpdateREQ } from './printing-price.request';
import type { PrintingPriceActionRESP, PrintingPriceDetailRESP, PrintingPriceItemsRESP, PrintingPriceListRESP } from './printing-price.response';

export const printingPriceKeys = {
  all: ['products', 'unit-price-settings', 'printing-prices'] as const,
  lists: () => [...printingPriceKeys.all, 'list'] as const,
  list: (params: PrintingPriceListREQ) => [...printingPriceKeys.lists(), params] as const,
  detail: (id: number) => [...printingPriceKeys.all, 'detail', id] as const,
  items: (id: number) => [...printingPriceKeys.all, 'items', id] as const,
};

type PrintingPriceListQueryKey = ReturnType<typeof printingPriceKeys.list>;
type PrintingPriceDetailQueryKey = ReturnType<typeof printingPriceKeys.detail>;
type PrintingPriceItemsQueryKey = ReturnType<typeof printingPriceKeys.items>;

export function printingPriceListQueryOptions(params: PrintingPriceListREQ) {
  return queryOptions<PrintingPriceListRESP, AxiosError<IBaseError>, PrintingPriceListRESP, PrintingPriceListQueryKey>({
    queryKey: printingPriceKeys.list(params),
    queryFn: () => getPrintingPricesAPI(params),
    staleTime: 30_000,
  });
}

export function usePrintingPricesQuery(
  params: PrintingPriceListREQ,
  options?: Omit<
    UseQueryOptions<PrintingPriceListRESP, AxiosError<IBaseError>, PrintingPriceListRESP, PrintingPriceListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PrintingPriceListRESP, AxiosError<IBaseError>, PrintingPriceListRESP, PrintingPriceListQueryKey>({
    ...printingPriceListQueryOptions(params),
    ...options,
    // placeholderData: keepPreviousData,
  });
}

export function printingPriceDetailQueryOptions(id: number) {
  return queryOptions<PrintingPriceDetailRESP, AxiosError<IBaseError>, PrintingPriceDetailRESP, PrintingPriceDetailQueryKey>({
    queryKey: printingPriceKeys.detail(id),
    queryFn: () => getPrintingPriceDetailAPI(id),
    staleTime: 30_000,
  });
}

export function usePrintingPriceDetailQuery(
  id: number | null,
  options?: Omit<
    UseQueryOptions<PrintingPriceDetailRESP, AxiosError<IBaseError>, PrintingPriceDetailRESP, PrintingPriceDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PrintingPriceDetailRESP, AxiosError<IBaseError>, PrintingPriceDetailRESP, PrintingPriceDetailQueryKey>({
    ...printingPriceDetailQueryOptions(id ?? 0),
    enabled: id !== null,
    ...options,
  });
}

export function printingPriceItemsQueryOptions(id: number) {
  return queryOptions<PrintingPriceItemsRESP, AxiosError<IBaseError>, PrintingPriceItemsRESP, PrintingPriceItemsQueryKey>({
    queryKey: printingPriceKeys.items(id),
    queryFn: () => getPrintingPriceItemsAPI(id),
    staleTime: 30_000,
  });
}

export function usePrintingPriceItemsQuery(
  id: number | null,
  options?: Omit<
    UseQueryOptions<PrintingPriceItemsRESP, AxiosError<IBaseError>, PrintingPriceItemsRESP, PrintingPriceItemsQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PrintingPriceItemsRESP, AxiosError<IBaseError>, PrintingPriceItemsRESP, PrintingPriceItemsQueryKey>({
    ...printingPriceItemsQueryOptions(id ?? 0),
    enabled: id !== null,
    ...options,
  });
}

export function useCreatePrintingPriceMutation(
  options?: UseMutationOptions<PrintingPriceActionRESP, AxiosError<IBaseError>, PrintingPriceCreateREQ>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => createPrintingPriceAPI(payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: printingPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdatePrintingPriceMutation(
  options?: UseMutationOptions<PrintingPriceActionRESP, AxiosError<IBaseError>, { id: number; payload: PrintingPriceUpdateREQ }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => updatePrintingPriceAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: printingPriceKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: printingPriceKeys.detail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: printingPriceKeys.items(variables.id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeletePrintingPriceMutation(options?: UseMutationOptions<void, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deletePrintingPriceAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: printingPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
