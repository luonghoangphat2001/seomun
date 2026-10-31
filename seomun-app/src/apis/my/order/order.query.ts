import { ErrorRESP } from '@/types';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { OrderApi } from './order.api';
import {
  OrderHistoryChangeAddressREQ,
  OrderHistoryDownloadREQ,
  OrderHistoryListREQ,
  OrderHistoryProofConfirmREQ,
  OrderHistoryResubmitFileREQ,
  OrderHistoryReviewREQ,
  OrderListREQ,
  OrderTrackingDeliveryREQ,
} from './order.request';
import { OrderHistoryDownloadRESP } from './order.response';

export type OrderSelectValue = {
  orderNumber: string;
  productId: number | null;
};

export const encodeOrderValue = (orderNumber: string, productId: number | null | undefined) =>
  JSON.stringify({ orderNumber, productId: productId ?? null });

export const decodeOrderValue = (value: string): OrderSelectValue => {
  try {
    const parsed = JSON.parse(value) as Partial<OrderSelectValue>;

    return {
      orderNumber: parsed.orderNumber || '',
      productId: parsed.productId ?? null,
    };
  } catch {
    return {
      orderNumber: value,
      productId: null,
    };
  }
};

export const ORDER_QUERY_KEYS = {
  LIST: 'ORDER_LIST',
  HISTORY_LIST: 'ORDER_HISTORY_LIST',
  QUOTATION_PDF: 'ORDER_QUOTATION_PDF',
  TRANSACTION_STATEMENT_PDF: 'ORDER_TRANSACTION_STATEMENT_PDF',
  HISTORT_DETAIL: 'ORDER_HISTORY_DETAIL',
  ADDRESS_CHANGE_HISTORY: 'ORDER_ADDRESS_CHANGE_HISTORY',
  TRACKING_DELIVERY: 'ORDER_TRACKING_DELIVERY',
};

export const useOrderListQuery = (params?: OrderListREQ) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.LIST, params],
    queryFn: () => OrderApi.list(params),
    select: (resp) => resp.data.orders ?? [],
  });

export const useOrderInfiniteListQuery = (params?: OrderListREQ, enabled = true) =>
  useInfiniteQuery({
    queryKey: [ORDER_QUERY_KEYS.LIST, 'MOBILE', params],
    initialPageParam: params?.page ?? 1,
    queryFn: ({ pageParam }) => OrderApi.list({ ...params, page: pageParam }),
    getNextPageParam: (resp) => {
      const pagination = resp.pagination;
      const currentPage = pagination.current_page || 1;
      const totalPage = pagination.total_page || 1;

      return currentPage < totalPage ? currentPage + 1 : undefined;
    },
    enabled,
  });

//-----------------------
export const useOrderHistoryListQuery = (params?: OrderHistoryListREQ) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.HISTORY_LIST, params],
    queryFn: () => OrderApi.getOrderHistoryList(params),
    select: (resp) => ({
      list: resp.data.orders,
      pagination: resp.pagination,
    }),
  });

export const useDownloadQuotationPDFMutation = (options?: UseMutationOptions<Blob, AxiosError<ErrorRESP>, string>) =>
  useMutation({
    mutationFn: OrderApi.downloadQuotationPDF,
    ...options,
  });

export const useDownloadTransactionStatementPDFMutation = (options?: UseMutationOptions<Blob, AxiosError<ErrorRESP>, string>) =>
  useMutation({
    mutationFn: OrderApi.downloadTransactionStatementPDF,
    ...options,
  });

export const useOrderHistoryExportExcelMutation = (
  options?: UseMutationOptions<OrderHistoryDownloadRESP, AxiosError<ErrorRESP>, OrderHistoryDownloadREQ>,
) =>
  useMutation({
    mutationFn: async (body) => {
      const response = await OrderApi.downloadExcel(body);
      return response.data;
    },
    ...options,
  });

export const useOrderHistoryDetailQuery = (orderNumber?: string) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.HISTORT_DETAIL, orderNumber],
    queryFn: () => OrderApi.getOrderHistoryDetail(orderNumber as string),
    select: (resp) => resp.data.order,
    enabled: !!orderNumber,
  });

export const useChangeOrderHistoryAddressMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, OrderHistoryChangeAddressREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: OrderApi.changeOrderHistoryAddress,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [ORDER_QUERY_KEYS.HISTORT_DETAIL, variables.orderNumber],
        }),
        queryClient.invalidateQueries({
          queryKey: [ORDER_QUERY_KEYS.ADDRESS_CHANGE_HISTORY, variables.orderNumber],
        }),
      ]);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useResubmitFileMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, OrderHistoryResubmitFileREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: OrderApi.resubmitFile,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: [ORDER_QUERY_KEYS.HISTORT_DETAIL, variables.orderNumber],
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useProofConfirmMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, OrderHistoryProofConfirmREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: OrderApi.proofconfirm,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: [ORDER_QUERY_KEYS.HISTORT_DETAIL, variables.orderNumber],
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useOrderAddressChangeHistoryQuery = (orderNumber?: string) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.ADDRESS_CHANGE_HISTORY, orderNumber],
    queryFn: () => OrderApi.getOrderAddressChangeHistory(orderNumber as string),
    select: (resp) => resp.data,
    enabled: !!orderNumber,
  });

export const useOrderHistoryReviewMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, OrderHistoryReviewREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: OrderApi.reviewOrderHistory,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: [ORDER_QUERY_KEYS.HISTORT_DETAIL],
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useOrderTrackingDeliveryQuery = (params?: OrderTrackingDeliveryREQ) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.TRACKING_DELIVERY, params],
    queryFn: () => OrderApi.trackingDelivery(params),
    select: (resp) => resp.data,
    enabled: !!params,
  });
