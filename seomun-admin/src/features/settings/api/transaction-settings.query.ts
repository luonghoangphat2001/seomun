import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { BaseResponse, IBaseError } from '@/types/api';

import { getTransactionSettingsAPI, updateTransactionSettingsAPI, uploadTransactionLogoAPI } from './transaction-settings.api';
import type { UpdateTransactionSettingsREQ } from './transaction-settings.request';
import type { TransactionSettingsRESP } from './transaction-settings.response';

export const transactionSettingsKeys = {
  all: ['settings', 'transaction'] as const,
  detail: () => [...transactionSettingsKeys.all, 'detail'] as const,
};

export function useTransactionSettingsQuery() {
  return useQuery<TransactionSettingsRESP, AxiosError<IBaseError>>({
    queryKey: transactionSettingsKeys.detail(),
    queryFn: getTransactionSettingsAPI,
    staleTime: 30_000,
  });
}

export function useUpdateTransactionSettingsMutation(
  options?: UseMutationOptions<TransactionSettingsRESP, AxiosError<IBaseError>, UpdateTransactionSettingsREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateTransactionSettingsAPI,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: transactionSettingsKeys.detail() });
      await options?.onSuccess?.(...args);
    },
  });
}

export function useUploadTransactionLogoMutation(options?: UseMutationOptions<BaseResponse<unknown>, AxiosError<IBaseError>, File>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: uploadTransactionLogoAPI,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: transactionSettingsKeys.detail() });
      await options?.onSuccess?.(...args);
    },
  });
}
