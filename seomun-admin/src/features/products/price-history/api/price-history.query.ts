import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { PriceHistoryListREQ } from './price-history.request';
import type { PriceHistoryListRESP, PriceHistoryLog } from './price-history.response';
import { getPriceHistoryLogDetail, getPriceHistoryLogs } from './price-history.service';

export const priceHistoryKeys = {
  all: ['price-history'] as const,
  list: (params: PriceHistoryListREQ) => [...priceHistoryKeys.all, 'list', params] as const,
  detail: (id: string) => [...priceHistoryKeys.all, 'detail', id] as const,
};

export function usePriceHistoryLogsQuery(params: PriceHistoryListREQ) {
  return useQuery<PriceHistoryListRESP, AxiosError<IBaseError>, PriceHistoryListRESP, ReturnType<typeof priceHistoryKeys.list>>({
    queryKey: priceHistoryKeys.list(params),
    queryFn: () => getPriceHistoryLogs(params),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}

export function usePriceHistoryDetailQuery(id: string, enabled: boolean) {
  return useQuery<PriceHistoryLog, AxiosError<IBaseError>, PriceHistoryLog, ReturnType<typeof priceHistoryKeys.detail>>({
    queryKey: priceHistoryKeys.detail(id),
    queryFn: () => getPriceHistoryLogDetail(id),
    enabled,
  });
}
