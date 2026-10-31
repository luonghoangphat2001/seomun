import { api } from '@/config';
import { BaseResponse } from '@/types';
import { PointBalanceRESP, PointSummaryRESP, PointTransactionListRESP } from './points.response';
import { PointTransactionListREQ } from './points.request';

export const ENDPOINTS = {
  BALANCE: '/points/balance',
  TRANSACTIONS: '/points/transactions',
  TRANSACTIONS_SUMMARY: '/points/transactions/summary',
};

export const PointApi = {
  getBalance: () => api.get<BaseResponse<PointBalanceRESP>>(ENDPOINTS.BALANCE),
  getTransactions: (params?: PointTransactionListREQ) =>
    api.get<BaseResponse<PointTransactionListRESP>>(ENDPOINTS.TRANSACTIONS, { params }),
  getSummary: () => api.get<BaseResponse<PointSummaryRESP>>(ENDPOINTS.TRANSACTIONS_SUMMARY),
};
