import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorRESP } from '@/types';
import { ExportExcelApi } from './export-excel.api';
import { ExportExcelProgressStatusREQ } from './export-excel.request';
import { ExportExcelHistoryRESP, ExportExcelProgressStatusRESP } from './export-excel.response';

export const EXPORT_EXCEL_QUERY_KEYS = {
  CHECK_PROGRESS_STATUS: 'EXPORT_EXCEL_CHECK_PROGRESS_STATUS',
};

export const useExportExcelProgressStatusQuery = (
  params: ExportExcelProgressStatusREQ,
  options?: Omit<
    UseQueryOptions<ExportExcelProgressStatusRESP, AxiosError<ErrorRESP>, ExportExcelHistoryRESP>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [EXPORT_EXCEL_QUERY_KEYS.CHECK_PROGRESS_STATUS, params.history],
    queryFn: () => ExportExcelApi.checkProgressStatus(params),
    select: (resp) => resp.data.history,
    ...options,
  });
