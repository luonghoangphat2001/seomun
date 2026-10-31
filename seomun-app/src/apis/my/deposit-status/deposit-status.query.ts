import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorRESP } from '@/types';
import { DepositStatusApi } from './deposit-status.api';
import { DepositStatusExportExcelREQ, DepositStatusListREQ } from './deposit-status.request';
import { DepositStatusExportExcelRESP } from './deposit-status.response';

export const DEPOSIT_STATUS_QUERY_KEYS = {
  LIST: 'DEPOSIT_STATUS_LIST',
};

export const useDepositStatusListQuery = (params?: DepositStatusListREQ, enabled = true) =>
  useQuery({
    queryKey: [DEPOSIT_STATUS_QUERY_KEYS.LIST, params],
    queryFn: () => DepositStatusApi.list(params),
    select: (resp) => resp,
    enabled,
  });

export const useDepositStatusExportExcelMutation = (
  options?: UseMutationOptions<DepositStatusExportExcelRESP, AxiosError<ErrorRESP>, DepositStatusExportExcelREQ>,
) =>
  useMutation({
    mutationFn: async (body: DepositStatusExportExcelREQ) => {
      const resp = await DepositStatusApi.exportExcel(body);
      return resp.data;
    },
    ...options,
  });
