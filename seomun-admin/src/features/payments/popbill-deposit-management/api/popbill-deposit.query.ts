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

import { confirmBankDepositAPI, getBankDepositsAPI, getBankDepositSyncStatusAPI } from './popbill-deposit.api';
import type { BankDepositListREQ, ConfirmBankDepositREQ } from './popbill-deposit.request';
import type { BankDepositListRESP, BankDepositSyncStatusRESP, ConfirmBankDepositRESP } from './popbill-deposit.response';

export const popbillDepositKeys = {
  all: ['popbill-deposits'] as const,
  lists: () => [...popbillDepositKeys.all, 'list'] as const,
  list: (params: BankDepositListREQ) => [...popbillDepositKeys.lists(), params] as const,
  syncStatus: () => [...popbillDepositKeys.all, 'sync-status'] as const,
};

type BankDepositListQueryKey = ReturnType<typeof popbillDepositKeys.list>;
type BankDepositSyncStatusQueryKey = ReturnType<typeof popbillDepositKeys.syncStatus>;

export function bankDepositListQueryOptions(params: BankDepositListREQ) {
  return queryOptions<BankDepositListRESP, AxiosError<IBaseError>, BankDepositListRESP, BankDepositListQueryKey>({
    queryKey: popbillDepositKeys.list(params),
    queryFn: () => getBankDepositsAPI(params),
    staleTime: 30_000,
  });
}

export function useBankDepositsQuery(
  params: BankDepositListREQ,
  options?: Omit<UseQueryOptions<BankDepositListRESP, AxiosError<IBaseError>, BankDepositListRESP, BankDepositListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<BankDepositListRESP, AxiosError<IBaseError>, BankDepositListRESP, BankDepositListQueryKey>({
    ...bankDepositListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function bankDepositSyncStatusQueryOptions() {
  return queryOptions<BankDepositSyncStatusRESP, AxiosError<IBaseError>, BankDepositSyncStatusRESP, BankDepositSyncStatusQueryKey>({
    queryKey: popbillDepositKeys.syncStatus(),
    queryFn: getBankDepositSyncStatusAPI,
    staleTime: 30_000,
  });
}

export function useBankDepositSyncStatusQuery(
  options?: Omit<
    UseQueryOptions<BankDepositSyncStatusRESP, AxiosError<IBaseError>, BankDepositSyncStatusRESP, BankDepositSyncStatusQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<BankDepositSyncStatusRESP, AxiosError<IBaseError>, BankDepositSyncStatusRESP, BankDepositSyncStatusQueryKey>({
    ...bankDepositSyncStatusQueryOptions(),
    ...options,
  });
}

export function useConfirmBankDepositMutation(
  options?: UseMutationOptions<ConfirmBankDepositRESP, AxiosError<IBaseError>, { depositId: number; payload: ConfirmBankDepositREQ }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ depositId, payload }) => confirmBankDepositAPI(depositId, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: popbillDepositKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['payments', 'list'] });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
