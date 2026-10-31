import { BaseResponse, ErrorRESP } from '@/types';
import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { WithDrawalApi } from './withdrawal.api';
import { WithdrawalREQ } from './withdrawal.request';
import { WithdrawalCheckRESP } from './withdrawal.response';

export const WITHDRAWAL_QUERY_KEYS = {
  CHECK: 'WITHDRAWAL_CHECK',
};

export const useWithdrawalCheckQuery = (
  options?: Omit<
    UseQueryOptions<BaseResponse<WithdrawalCheckRESP>, AxiosError<ErrorRESP>, WithdrawalCheckRESP>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [WITHDRAWAL_QUERY_KEYS.CHECK],
    queryFn: WithDrawalApi.checkAbleToWithDrawal,
    select: (resp) => resp.data,
    ...options,
  });

export const useWithdrawalAccountMutation = (
  options?: UseMutationOptions<BaseResponse<null>, AxiosError<ErrorRESP>, WithdrawalREQ>,
) =>
  useMutation({
    mutationFn: WithDrawalApi.withDrawalAccount,
    ...options,
  });
