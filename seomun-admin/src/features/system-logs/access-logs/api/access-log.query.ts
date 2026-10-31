import { keepPreviousData, queryOptions, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { AccessLogListSearch } from '../schemas';
import { buildAccessLogListParams } from '../utils/access-log-list-params';
import type { AccessLogListRESP, AccessLogSearchFilterRESP } from './access-log.response';
import type { AccessLogListRequest } from './access-log.request';
import { getAccessLogSearchFilterAPI, getAccessLogsAPI } from './access-log.api';

export const accessLogKeys = {
  all: ['system-logs', 'access-logs'] as const,
  lists: () => [...accessLogKeys.all, 'list'] as const,
  list: (params: AccessLogListRequest) => [...accessLogKeys.lists(), params] as const,
  searchFilters: () => [...accessLogKeys.all, 'search-filters'] as const,
};

type AccessLogListQueryKey = ReturnType<typeof accessLogKeys.list>;
type AccessLogSearchFilterQueryKey = ReturnType<typeof accessLogKeys.searchFilters>;

export function accessLogSearchFilterQueryOptions() {
  return queryOptions<AccessLogSearchFilterRESP, AxiosError<IBaseError>, AccessLogSearchFilterRESP, AccessLogSearchFilterQueryKey>({
    queryKey: accessLogKeys.searchFilters(),
    queryFn: () => getAccessLogSearchFilterAPI(),
    staleTime: 30_000,
  });
}

export function useAccessLogSearchFilterQuery(
  options?: Omit<
    UseQueryOptions<AccessLogSearchFilterRESP, AxiosError<IBaseError>, AccessLogSearchFilterRESP, AccessLogSearchFilterQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<AccessLogSearchFilterRESP, AxiosError<IBaseError>, AccessLogSearchFilterRESP, AccessLogSearchFilterQueryKey>({
    ...accessLogSearchFilterQueryOptions(),
    ...options,
  });
}
export function accessLogListQueryOptions(params: AccessLogListRequest) {
  return queryOptions<AccessLogListRESP, AxiosError<IBaseError>, AccessLogListRESP, AccessLogListQueryKey>({
    queryKey: accessLogKeys.list(params),
    queryFn: () => getAccessLogsAPI(params),
    staleTime: 30_000,
  });
}

export function accessLogListQueryOptionsBySearch(search: AccessLogListSearch) {
  return accessLogListQueryOptions(buildAccessLogListParams(search));
}

export function useAccessLogsQuery(
  params: AccessLogListRequest,
  options?: Omit<UseQueryOptions<AccessLogListRESP, AxiosError<IBaseError>, AccessLogListRESP, AccessLogListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AccessLogListRESP, AxiosError<IBaseError>, AccessLogListRESP, AccessLogListQueryKey>({
    ...accessLogListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}
