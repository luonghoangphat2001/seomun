import { BaseResponse, ErrorRESP } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { PointApi } from './points.api';
import {
  PointBalanceRESP,
  PointPaginationRESP,
  PointSummaryRESP,
  PointTransactionListRESP,
  PointTransactionRESP,
} from './points.response';
import { PointTransactionListREQ } from './points.request';

export const POINT_QUERY_KEYS = {
  BALANCE: 'POINT_BALANCE',
  TRANSACTIONS: 'POINT_TRANSACTIONS',
  SUMMARY: 'POINT_SUMMARY',
};

export const usePointBalanceQuery = (
  options?: Omit<
    UseQueryOptions<BaseResponse<PointBalanceRESP>, AxiosError<ErrorRESP>, PointBalanceRESP>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [POINT_QUERY_KEYS.BALANCE],
    queryFn: PointApi.getBalance,
    select: (resp) => resp.data,
    ...options,
  });

export const usePointTransactionsQuery = (
  params?: PointTransactionListREQ,
  options?: Omit<
    UseQueryOptions<
      BaseResponse<PointTransactionListRESP>,
      AxiosError<ErrorRESP>,
      { transactions: PointTransactionRESP[]; pagination: PointPaginationRESP }
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [POINT_QUERY_KEYS.TRANSACTIONS, params],
    queryFn: () => PointApi.getTransactions(params),
    select: (resp) => ({
      transactions: resp.data.transactions,
      pagination: resp.data.pagination,
    }),
    ...options,
  });

export const usePointSummaryQuery = (
  options?: Omit<
    UseQueryOptions<BaseResponse<PointSummaryRESP>, AxiosError<ErrorRESP>, PointSummaryRESP>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [POINT_QUERY_KEYS.SUMMARY],
    queryFn: PointApi.getSummary,
    select: (resp) => resp.data,
    ...options,
  });
