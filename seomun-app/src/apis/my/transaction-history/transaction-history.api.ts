import { api } from '@/config';
import { BaseResponse } from '@/types';
import { TransactionHistoryListREQ } from './transaction-history.request';
import { TransactionHistoryListDataRESP } from './transaction-history.response';

const ENDPOINT = {
  LIST: '/mypage/transaction-history',
};

export const TransactionHistoryApi = {
  list: (params?: TransactionHistoryListREQ) => api.get<BaseResponse<TransactionHistoryListDataRESP>>(ENDPOINT.LIST, { params }),
};
