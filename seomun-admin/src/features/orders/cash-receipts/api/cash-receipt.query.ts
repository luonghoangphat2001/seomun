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
import type { BulkGenerateCashReceiptREQ, BulkStatusCashReceiptREQ, CreateCashReceiptREQ, CashReceiptListREQ } from './cash-receipt.request';
import type {
  CashReceiptActionRESP,
  CashReceiptBulkActionRESP,
  CashReceiptBulkGenerateRESP,
  CashReceiptListRESP,
  CashReceiptSearchFiltersRESP,
} from './cash-receipt.response';
import {
  bulkGenerateCashReceipts,
  bulkStatusCashReceipts,
  createCashReceipt,
  deleteCashReceipt,
  getCashReceiptList,
  getCashReceiptSearchFilters,
  issueCashReceipt,
  setCashReceiptPending,
} from './cash-receipt.service';

export const cashReceiptKeys = {
  all: ['orders', 'cash-receipts'] as const,
  filters: () => [...cashReceiptKeys.all, 'search-filters'] as const,
  lists: () => [...cashReceiptKeys.all, 'list'] as const,
  list: (params: CashReceiptListREQ) => [...cashReceiptKeys.lists(), params] as const,
};

type CashReceiptFiltersQueryKey = ReturnType<typeof cashReceiptKeys.filters>;
type CashReceiptListQueryKey = ReturnType<typeof cashReceiptKeys.list>;

// === Search filters (검색 필터 옵션 조회) ===
export function cashReceiptSearchFiltersQueryOptions() {
  return queryOptions<CashReceiptSearchFiltersRESP, AxiosError<IBaseError>, CashReceiptSearchFiltersRESP, CashReceiptFiltersQueryKey>({
    queryKey: cashReceiptKeys.filters(),
    queryFn: getCashReceiptSearchFilters,
    staleTime: 5 * 60_000,
  });
}

export function useCashReceiptSearchFiltersQuery(
  options?: Omit<
    UseQueryOptions<CashReceiptSearchFiltersRESP, AxiosError<IBaseError>, CashReceiptSearchFiltersRESP, CashReceiptFiltersQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({ ...cashReceiptSearchFiltersQueryOptions(), ...options });
}

// === List (shared by ?tab=original & ?tab=generated) ===
export function cashReceiptListQueryOptions(params: CashReceiptListREQ) {
  return queryOptions<CashReceiptListRESP, AxiosError<IBaseError>, CashReceiptListRESP, CashReceiptListQueryKey>({
    queryKey: cashReceiptKeys.list(params),
    queryFn: () => getCashReceiptList(params),
    staleTime: 30_000,
  });
}

export function useCashReceiptsQuery(
  params: CashReceiptListREQ,
  options?: Omit<UseQueryOptions<CashReceiptListRESP, AxiosError<IBaseError>, CashReceiptListRESP, CashReceiptListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({ ...cashReceiptListQueryOptions(params), placeholderData: keepPreviousData, ...options });
}

// === Create (데이터 생성) ===
export function useCreateCashReceiptMutation(options?: UseMutationOptions<CashReceiptActionRESP, AxiosError<IBaseError>, CreateCashReceiptREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createCashReceipt,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: cashReceiptKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

// === Issuance (pending → issued) ===
export function useIssueCashReceiptMutation(options?: UseMutationOptions<CashReceiptActionRESP, AxiosError<IBaseError>, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: issueCashReceipt,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: cashReceiptKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

// === Pending (발행 대기 처리) ===
export function useSetCashReceiptPendingMutation(options?: UseMutationOptions<CashReceiptActionRESP, AxiosError<IBaseError>, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: setCashReceiptPending,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: cashReceiptKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

// === Delete (→ deleted) ===
export function useDeleteCashReceiptMutation(options?: UseMutationOptions<CashReceiptActionRESP, AxiosError<IBaseError>, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteCashReceipt,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: cashReceiptKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

// === Bulk generate (일괄 생성) ===
export function useBulkGenerateCashReceiptsMutation(
  options?: UseMutationOptions<CashReceiptBulkGenerateRESP, AxiosError<IBaseError>, BulkGenerateCashReceiptREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkGenerateCashReceipts,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: cashReceiptKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

// === Bulk status (일괄 상태 변경) ===
export function useBulkStatusCashReceiptsMutation(
  options?: UseMutationOptions<CashReceiptBulkActionRESP, AxiosError<IBaseError>, BulkStatusCashReceiptREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkStatusCashReceipts,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: cashReceiptKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
