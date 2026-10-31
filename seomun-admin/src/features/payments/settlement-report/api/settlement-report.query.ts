import { keepPreviousData, queryOptions, useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { BaseResponse, IBaseError } from '@/types/api';

import type { ReportExportExcelREQ, ReportListREQ } from './settlement-report.request';
import type { ReportExportExcelRESP, ReportRESP } from './settlement-report.response';
import { checkSettlementReportExportProgressStatusAPI, exportSettlementReportExcelAPI, getSettlementReportsAPI } from './settlement-report.api';

export const reportKeys = {
  all: ['settlement-reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (params: ReportListREQ) => [...reportKeys.lists(), params] as const,
};

type ReportListQueryKey = ReturnType<typeof reportKeys.list>;

export function settlementReportListQueryOptions(params: ReportListREQ) {
  return queryOptions<ReportRESP, AxiosError<IBaseError>, ReportRESP, ReportListQueryKey>({
    queryKey: reportKeys.list(params),
    queryFn: () => getSettlementReportsAPI(params),
    staleTime: 30_000,
  });
}

export function useSettlementReportsQuery(
  params: ReportListREQ,
  options?: Omit<UseQueryOptions<ReportRESP, AxiosError<IBaseError>, ReportRESP, ReportListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ReportRESP, AxiosError<IBaseError>, ReportRESP, ReportListQueryKey>({
    ...settlementReportListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useExportSettlementReportMutation(
  options?: UseMutationOptions<BaseResponse<{ history: ReportExportExcelRESP }>, AxiosError<IBaseError>, ReportExportExcelREQ>,
) {
  return useMutation({ ...options, mutationFn: exportSettlementReportExcelAPI });
}

export function useCheckSettlementReportExportStatusMutation(
  options?: UseMutationOptions<BaseResponse<{ history: ReportExportExcelRESP }>, AxiosError<IBaseError>, number>,
) {
  return useMutation({ ...options, mutationFn: checkSettlementReportExportProgressStatusAPI });
}
