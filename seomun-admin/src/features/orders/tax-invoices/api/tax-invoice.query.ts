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

import { orderKeys } from '../../api';
import type { BulkGenerateTaxInvoiceREQ, BulkStatusTaxInvoiceREQ, CreateTaxInvoiceREQ, TaxInvoiceListREQ } from './tax-invoice.request';
import type {
  TaxInvoiceActionRESP,
  TaxInvoiceBulkActionRESP,
  TaxInvoiceBulkGenerateRESP,
  TaxInvoiceListRESP,
  TaxInvoiceSearchFiltersRESP,
} from './tax-invoice.response';
import {
  bulkGenerateTaxInvoices,
  bulkStatusTaxInvoices,
  createTaxInvoice,
  deleteTaxInvoice,
  getTaxInvoiceList,
  getTaxInvoiceSearchFilters,
  issueTaxInvoice,
  setTaxInvoicePending,
} from './tax-invoice.service';

export const taxInvoiceKeys = {
  all: ['orders', 'tax-invoices'] as const,
  filters: () => [...taxInvoiceKeys.all, 'search-filters'] as const,
  lists: () => [...taxInvoiceKeys.all, 'list'] as const,
  list: (params: TaxInvoiceListREQ) => [...taxInvoiceKeys.lists(), params] as const,
};

type TaxInvoiceFiltersQueryKey = ReturnType<typeof taxInvoiceKeys.filters>;
type TaxInvoiceListQueryKey = ReturnType<typeof taxInvoiceKeys.list>;

export function taxInvoiceSearchFiltersQueryOptions() {
  return queryOptions<TaxInvoiceSearchFiltersRESP, AxiosError<IBaseError>, TaxInvoiceSearchFiltersRESP, TaxInvoiceFiltersQueryKey>({
    queryKey: taxInvoiceKeys.filters(),
    queryFn: getTaxInvoiceSearchFilters,
    staleTime: 5 * 60_000,
  });
}

export function useTaxInvoiceSearchFiltersQuery(
  options?: Omit<
    UseQueryOptions<TaxInvoiceSearchFiltersRESP, AxiosError<IBaseError>, TaxInvoiceSearchFiltersRESP, TaxInvoiceFiltersQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({ ...taxInvoiceSearchFiltersQueryOptions(), ...options });
}

export function taxInvoiceListQueryOptions(params: TaxInvoiceListREQ) {
  return queryOptions<TaxInvoiceListRESP, AxiosError<IBaseError>, TaxInvoiceListRESP, TaxInvoiceListQueryKey>({
    queryKey: taxInvoiceKeys.list(params),
    queryFn: () => getTaxInvoiceList(params),
    staleTime: 30_000,
  });
}

export function useTaxInvoicesQuery(
  params: TaxInvoiceListREQ,
  options?: Omit<UseQueryOptions<TaxInvoiceListRESP, AxiosError<IBaseError>, TaxInvoiceListRESP, TaxInvoiceListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({ ...taxInvoiceListQueryOptions(params), placeholderData: keepPreviousData, ...options });
}

export function useCreateTaxInvoiceMutation(options?: UseMutationOptions<TaxInvoiceActionRESP, AxiosError<IBaseError>, CreateTaxInvoiceREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createTaxInvoice,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: taxInvoiceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useIssueTaxInvoiceMutation(options?: UseMutationOptions<TaxInvoiceActionRESP, AxiosError<IBaseError>, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: issueTaxInvoice,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: taxInvoiceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useSetTaxInvoicePendingMutation(options?: UseMutationOptions<TaxInvoiceActionRESP, AxiosError<IBaseError>, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: setTaxInvoicePending,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: taxInvoiceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteTaxInvoiceMutation(options?: UseMutationOptions<TaxInvoiceActionRESP, AxiosError<IBaseError>, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteTaxInvoice,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: taxInvoiceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useBulkGenerateTaxInvoicesMutation(
  options?: UseMutationOptions<TaxInvoiceBulkGenerateRESP, AxiosError<IBaseError>, BulkGenerateTaxInvoiceREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkGenerateTaxInvoices,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: taxInvoiceKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useBulkStatusTaxInvoicesMutation(
  options?: UseMutationOptions<TaxInvoiceBulkActionRESP, AxiosError<IBaseError>, BulkStatusTaxInvoiceREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkStatusTaxInvoices,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: taxInvoiceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
