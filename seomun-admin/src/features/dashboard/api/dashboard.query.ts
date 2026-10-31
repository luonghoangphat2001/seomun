import { keepPreviousData, queryOptions, useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import { ExportStatus } from '../enums';

import type { DashboardOperationsREQ, DashboardStatisticsREQ } from './dashboard.request';
import type { DashboardOperationsRESP, DashboardStatisticsExportHistory, DashboardStatisticsRESP } from './dashboard.response';
import { exportDashboardStatistics, getDashboardOperations, getDashboardStatistics, getExportHistory } from './dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  operations: () => [...dashboardKeys.all, 'operations'] as const,
  operation: (params: DashboardOperationsREQ) => [...dashboardKeys.operations(), params] as const,
  statistics: () => [...dashboardKeys.all, 'statistics'] as const,
  statistic: (params: DashboardStatisticsREQ) => [...dashboardKeys.statistics(), params] as const,
  exportHistory: (historyId?: number) => [...dashboardKeys.all, 'export-history', historyId] as const,
};

type DashboardOperationQueryKey = ReturnType<typeof dashboardKeys.operation>;
type DashboardStatisticQueryKey = ReturnType<typeof dashboardKeys.statistic>;

export function dashboardOperationsQueryOptions(params: DashboardOperationsREQ) {
  return queryOptions<DashboardOperationsRESP, AxiosError<IBaseError>, DashboardOperationsRESP, DashboardOperationQueryKey>({
    queryKey: dashboardKeys.operation(params),
    queryFn: () => getDashboardOperations(params),
    staleTime: 30_000,
  });
}

export function useDashboardOperationsQuery(
  params: DashboardOperationsREQ,
  options?: Omit<
    UseQueryOptions<DashboardOperationsRESP, AxiosError<IBaseError>, DashboardOperationsRESP, DashboardOperationQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<DashboardOperationsRESP, AxiosError<IBaseError>, DashboardOperationsRESP, DashboardOperationQueryKey>({
    ...dashboardOperationsQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function dashboardStatisticsQueryOptions(params: DashboardStatisticsREQ) {
  return queryOptions<DashboardStatisticsRESP, AxiosError<IBaseError>, DashboardStatisticsRESP, DashboardStatisticQueryKey>({
    queryKey: dashboardKeys.statistic(params),
    queryFn: () => getDashboardStatistics(params),
    staleTime: 30_000,
  });
}

export function useDashboardStatisticsQuery(
  params: DashboardStatisticsREQ,
  options?: Omit<
    UseQueryOptions<DashboardStatisticsRESP, AxiosError<IBaseError>, DashboardStatisticsRESP, DashboardStatisticQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<DashboardStatisticsRESP, AxiosError<IBaseError>, DashboardStatisticsRESP, DashboardStatisticQueryKey>({
    ...dashboardStatisticsQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useExportDashboardStatisticsMutation() {
  return useMutation<DashboardStatisticsExportHistory, AxiosError<IBaseError>, DashboardStatisticsREQ>({
    mutationFn: exportDashboardStatistics,
  });
}

const EXPORT_POLL_INTERVAL_MS = 3_000;

const isExportSettled = (status?: string) => status === ExportStatus.COMPLETED || status === ExportStatus.FAILED;

/**
 * Polls one export-history record until the file is either ready or failed. Pass `undefined` to stay
 * idle (dialog closed), and note the interval stops itself once a terminal status comes back.
 */
export function useExportHistoryQuery(historyId?: number) {
  return useQuery<DashboardStatisticsExportHistory, AxiosError<IBaseError>>({
    queryKey: dashboardKeys.exportHistory(historyId),
    queryFn: () => getExportHistory(Number(historyId)),
    enabled: historyId !== undefined,
    refetchInterval: ({ state }) => (isExportSettled(state.data?.status) ? false : EXPORT_POLL_INTERVAL_MS),
  });
}
