import { keepPreviousData, queryOptions, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { TaskLogListSearch } from '../schemas';
import { buildTaskLogListParams } from '../utils/task-log-list-params';
import type { TaskLogListRequest } from './task-log.request';
import type { TaskLogListRESP, TaskLogSearchFiltersRESP } from './task-log.response';
import { getTaskLogFilters, getTaskLogList } from './task-log.service';

export const taskLogKeys = {
  all: ['system-logs', 'task-logs'] as const,
  lists: () => [...taskLogKeys.all, 'list'] as const,
  list: (params: TaskLogListRequest) => [...taskLogKeys.lists(), params] as const,
  filters: () => [...taskLogKeys.all, 'search-filters'] as const,
};

type TaskLogListQueryKey = ReturnType<typeof taskLogKeys.list>;
type TaskLogFiltersQueryKey = ReturnType<typeof taskLogKeys.filters>;

export function taskLogListQueryOptions(params: TaskLogListRequest) {
  return queryOptions<TaskLogListRESP, AxiosError<IBaseError>, TaskLogListRESP, TaskLogListQueryKey>({
    queryKey: taskLogKeys.list(params),
    queryFn: () => getTaskLogList(params),
    staleTime: 30_000,
  });
}

export function taskLogListQueryOptionsBySearch(search: TaskLogListSearch) {
  return taskLogListQueryOptions(buildTaskLogListParams(search));
}

export function taskLogSearchFiltersQueryOptions() {
  return queryOptions<TaskLogSearchFiltersRESP, AxiosError<IBaseError>, TaskLogSearchFiltersRESP, TaskLogFiltersQueryKey>({
    queryKey: taskLogKeys.filters(),
    queryFn: getTaskLogFilters,
    staleTime: 300_000,
  });
}

export function useTaskLogsQuery(
  params: TaskLogListRequest,
  options?: Omit<UseQueryOptions<TaskLogListRESP, AxiosError<IBaseError>, TaskLogListRESP, TaskLogListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TaskLogListRESP, AxiosError<IBaseError>, TaskLogListRESP, TaskLogListQueryKey>({
    ...taskLogListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useTaskLogSearchFiltersQuery(
  options?: Omit<
    UseQueryOptions<TaskLogSearchFiltersRESP, AxiosError<IBaseError>, TaskLogSearchFiltersRESP, TaskLogFiltersQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<TaskLogSearchFiltersRESP, AxiosError<IBaseError>, TaskLogSearchFiltersRESP, TaskLogFiltersQueryKey>({
    ...taskLogSearchFiltersQueryOptions(),
    ...options,
  });
}
