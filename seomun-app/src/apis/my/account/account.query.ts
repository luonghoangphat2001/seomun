import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';
import { BaseResponse, ErrorRESP, PaginationRESP, PaginationResponse } from '@/types';
import { MyAccountApi } from './account.api';
import { MyAccountHistoryListREQ } from './account-histories.request';
import { MyAccountHistoryRESP, MyAccountHistoriesRESP } from './account-histories.response';
import { MyAccountChangeBankREQ } from './account.request';
import { MyAccountChangeBankRESP, MyAccountRESP, MyAccountDetailRESP } from './account.response';
import { PAGINATION } from '@/constants/common';

export const ACCOUNT_QUERY_KEYS = {
  DETAIL: 'MY_ACCOUNT_DETAIL',
  HISTORIES: 'MY_ACCOUNT_HISTORIES',
};

export const useMyAccountQuery = (
  options?: Omit<
    UseQueryOptions<BaseResponse<MyAccountDetailRESP> | null, AxiosError<ErrorRESP>, MyAccountRESP | null>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.DETAIL],
    queryFn: async () => {
      try {
        return await MyAccountApi.get();
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }

        throw error;
      }
    },
    select: (resp) => resp?.data.account ?? null,
    ...options,
  });

export const useMyAccountHistoriesQuery = (
  params?: MyAccountHistoryListREQ,
  options?: Omit<
    UseQueryOptions<
      PaginationResponse<MyAccountHistoriesRESP>,
      AxiosError<ErrorRESP>,
      { histories: MyAccountHistoryRESP[]; pagination: PaginationRESP }
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.HISTORIES, params],
    queryFn: async () => {
      try {
        return await MyAccountApi.histories(params);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return {
            data: { histories: [] },
            pagination: {
              current_page: params?.page ?? PAGINATION.DEFAULT_PAGE,
              per_page: params?.per_page ?? 15,
              total_item: 0,
              total_page: 1,
            },
          } as PaginationResponse<MyAccountHistoriesRESP>;
        }

        throw error;
      }
    },
    select: (resp) => ({
      histories: resp.data.histories,
      pagination: resp.pagination,
    }),
    ...options,
  });

export const useMyAccountChangeBankMutation = (
  options?: UseMutationOptions<BaseResponse<MyAccountChangeBankRESP>, AxiosError<ErrorRESP>, MyAccountChangeBankREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: MyAccountApi.changeBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEYS.DETAIL] });
    },
    ...options,
  });
};
