import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BaseResponse, ErrorRESP } from '@/types';
import { VirtualAccountApi } from './virtual-account.api';
import { VirtualAccountCreateREQ } from './virtual-account.request';
import { VirtualAccountCreateRESP, VirtualAccountDetailRESP, VirtualAccountRESP } from './virtual-account.response';

export const VIRTUAL_ACCOUNT_QUERY_KEYS = {
  GET: 'MY_VIRTUAL_ACCOUNT',
};

export const useMyVirtualAccountQuery = (
  options?: Omit<
    UseQueryOptions<BaseResponse<VirtualAccountDetailRESP>, AxiosError<ErrorRESP>, VirtualAccountRESP | null>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [VIRTUAL_ACCOUNT_QUERY_KEYS.GET],
    queryFn: VirtualAccountApi.get,
    select: (resp) => resp.data.virtual_account,
    ...options,
  });

export const useVirtualAccountCreateMutation = (
  options?: UseMutationOptions<BaseResponse<VirtualAccountCreateRESP>, AxiosError<ErrorRESP>, VirtualAccountCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: VirtualAccountApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VIRTUAL_ACCOUNT_QUERY_KEYS.GET] });
    },
    ...options,
  });
};

export const useVirtualAccountUpdateMutation = (
  options?: UseMutationOptions<BaseResponse<VirtualAccountCreateRESP>, AxiosError<ErrorRESP>, VirtualAccountCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: VirtualAccountApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VIRTUAL_ACCOUNT_QUERY_KEYS.GET] });
    },
    ...options,
  });
};
