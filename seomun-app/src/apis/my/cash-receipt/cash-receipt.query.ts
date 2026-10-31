import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorRESP, PaginationRESP, PaginationResponse } from '@/types';
import { CashReceiptApi } from './cash-receipt.api';
import { CashReceiptExportExcelREQ, CashReceiptListREQ } from './cash-receipt.request';
import { CashReceiptExportExcelRESP, CashReceiptItemRESP, CashReceiptListRESP } from './cash-receipt.response';

export const CASH_RECEIPT_QUERY_KEYS = {
  LIST: 'CASH_RECEIPT_LIST',
};

export const useCashReceiptListQuery = (
  params?: CashReceiptListREQ,
  options?: Omit<
    UseQueryOptions<
      PaginationResponse<CashReceiptListRESP>,
      AxiosError<ErrorRESP>,
      { items: CashReceiptItemRESP[]; pagination: PaginationRESP }
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [CASH_RECEIPT_QUERY_KEYS.LIST, params],
    queryFn: () => CashReceiptApi.list(params),
    select: (resp) => ({
      items: resp.data.items,
      pagination: resp.pagination,
    }),
    ...options,
  });

export const useCashReceiptExportExcelMutation = (
  options?: UseMutationOptions<CashReceiptExportExcelRESP, AxiosError<ErrorRESP>, CashReceiptExportExcelREQ>,
) =>
  useMutation({
    mutationFn: async (body) => {
      const response = await CashReceiptApi.exportExcel(body);
      return response.data;
    },
    ...options,
  });
