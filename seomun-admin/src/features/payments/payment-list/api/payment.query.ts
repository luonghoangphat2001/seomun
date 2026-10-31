import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { BaseResponse, IBaseError } from '@/types/api';

import {
  checkExportProgressStatusAPI,
  exportPaymentsExcelAPI,
  getPaymentDetailAPI,
  getPaymentReceiptAPI,
  getPaymentStatisticsAPI,
  getPaymentsAPI,
  refundPaymentAPI,
} from './payment.api';
import type { ExportProgressREQ, PaymentExportExcelREQ, PaymentListREQ, PaymentRefundREQ, PaymentStatisticREQ } from './payment.request';
import type {
  PaymentDetailResultRESP,
  PaymentExportProgressResultRESP,
  PaymentExportRESP,
  PaymentListRESP,
  PaymentReceiptRESP,
  PaymentRefundRESP,
  StatisticsRESP,
} from './payment.response';

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: PaymentListREQ) => [...paymentKeys.lists(), params] as const,
  detail: (id: number) => [...paymentKeys.all, 'detail', id] as const,
  statistics: (params: PaymentStatisticREQ) => [...paymentKeys.all, 'statistics', params] as const,
  receipt: (id: number) => [...paymentKeys.all, 'receipt', id] as const,
  exportProgress: (historyId: number, params: ExportProgressREQ) => [...paymentKeys.all, 'export-progress', historyId, params] as const,
};

type PaymentListQueryKey = ReturnType<typeof paymentKeys.list>;
type PaymentDetailQueryKey = ReturnType<typeof paymentKeys.detail>;
type PaymentStatisticsQueryKey = ReturnType<typeof paymentKeys.statistics>;
type PaymentReceiptQueryKey = ReturnType<typeof paymentKeys.receipt>;
type PaymentExportProgressQueryKey = ReturnType<typeof paymentKeys.exportProgress>;

export function paymentListQueryOptions(params: PaymentListREQ) {
  return queryOptions<PaymentListRESP, AxiosError<IBaseError>, PaymentListRESP, PaymentListQueryKey>({
    queryKey: paymentKeys.list(params),
    queryFn: () => getPaymentsAPI(params),
    staleTime: 30_000,
  });
}

export function usePaymentsQuery(
  params: PaymentListREQ,
  options?: Omit<UseQueryOptions<PaymentListRESP, AxiosError<IBaseError>, PaymentListRESP, PaymentListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PaymentListRESP, AxiosError<IBaseError>, PaymentListRESP, PaymentListQueryKey>({
    ...paymentListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function paymentDetailQueryOptions(id: number) {
  return queryOptions<PaymentDetailResultRESP, AxiosError<IBaseError>, PaymentDetailResultRESP, PaymentDetailQueryKey>({
    queryKey: paymentKeys.detail(id),
    queryFn: () => getPaymentDetailAPI(id),
    staleTime: 30_000,
  });
}

export function usePaymentDetailQuery(
  id: number,
  options?: Omit<
    UseQueryOptions<PaymentDetailResultRESP, AxiosError<IBaseError>, PaymentDetailResultRESP, PaymentDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PaymentDetailResultRESP, AxiosError<IBaseError>, PaymentDetailResultRESP, PaymentDetailQueryKey>({
    ...paymentDetailQueryOptions(id),
    ...options,
  });
}

export function paymentStatisticsQueryOptions(params: PaymentStatisticREQ) {
  return queryOptions<BaseResponse<StatisticsRESP>, AxiosError<IBaseError>, BaseResponse<StatisticsRESP>, PaymentStatisticsQueryKey>({
    queryKey: paymentKeys.statistics(params),
    queryFn: () => getPaymentStatisticsAPI(params),
    staleTime: 30_000,
  });
}

export function usePaymentStatisticsQuery(
  params: PaymentStatisticREQ,
  options?: Omit<
    UseQueryOptions<BaseResponse<StatisticsRESP>, AxiosError<IBaseError>, BaseResponse<StatisticsRESP>, PaymentStatisticsQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<BaseResponse<StatisticsRESP>, AxiosError<IBaseError>, BaseResponse<StatisticsRESP>, PaymentStatisticsQueryKey>({
    ...paymentStatisticsQueryOptions(params),
    ...options,
  });
}

export function paymentReceiptQueryOptions(id: number) {
  return queryOptions<BaseResponse<PaymentReceiptRESP>, AxiosError<IBaseError>, BaseResponse<PaymentReceiptRESP>, PaymentReceiptQueryKey>({
    queryKey: paymentKeys.receipt(id),
    queryFn: () => getPaymentReceiptAPI(id),
    staleTime: 30_000,
  });
}

export function usePaymentReceiptQuery(
  id: number,
  options?: Omit<
    UseQueryOptions<BaseResponse<PaymentReceiptRESP>, AxiosError<IBaseError>, BaseResponse<PaymentReceiptRESP>, PaymentReceiptQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<BaseResponse<PaymentReceiptRESP>, AxiosError<IBaseError>, BaseResponse<PaymentReceiptRESP>, PaymentReceiptQueryKey>({
    ...paymentReceiptQueryOptions(id),
    ...options,
  });
}

export function paymentExportProgressQueryOptions(historyId: number, params: ExportProgressREQ) {
  return queryOptions<PaymentExportProgressResultRESP, AxiosError<IBaseError>, PaymentExportProgressResultRESP, PaymentExportProgressQueryKey>({
    queryKey: paymentKeys.exportProgress(historyId, params),
    queryFn: () => checkExportProgressStatusAPI(historyId, params),
    staleTime: 0,
  });
}

export function usePaymentExportProgressQuery(
  historyId: number,
  params: ExportProgressREQ,
  options?: Omit<
    UseQueryOptions<PaymentExportProgressResultRESP, AxiosError<IBaseError>, PaymentExportProgressResultRESP, PaymentExportProgressQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PaymentExportProgressResultRESP, AxiosError<IBaseError>, PaymentExportProgressResultRESP, PaymentExportProgressQueryKey>({
    ...paymentExportProgressQueryOptions(historyId, params),
    ...options,
  });
}

export function useExportPaymentsExcelMutation(options?: UseMutationOptions<PaymentExportRESP, AxiosError<IBaseError>, PaymentExportExcelREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: exportPaymentsExcelAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: paymentKeys.lists(),
      });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useRefundPaymentMutation(
  options?: UseMutationOptions<PaymentRefundRESP, AxiosError<IBaseError>, { transactionId: string; payload: PaymentRefundREQ }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ transactionId, payload }) => refundPaymentAPI(transactionId, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
