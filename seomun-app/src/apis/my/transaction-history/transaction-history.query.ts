import { useQuery } from '@tanstack/react-query';
import { TransactionHistoryApi } from './transaction-history.api';
import { TransactionHistoryListREQ } from './transaction-history.request';

export const TRANSACTION_HISTORY_QUERY_KEYS = {
  LIST: 'TRANSACTION_HISTORY_LIST',
};

export const useTransactionHistoryListQuery = (params?: TransactionHistoryListREQ, enabled = true) =>
  useQuery({
    queryKey: [TRANSACTION_HISTORY_QUERY_KEYS.LIST, params],
    queryFn: () => TransactionHistoryApi.list(params),
    select: (resp) => resp.data,
    enabled,
  });
