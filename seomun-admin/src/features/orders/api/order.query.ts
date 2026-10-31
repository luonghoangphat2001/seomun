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
import type { BaseResponse, IBaseError, PaginationResponse } from '@/types/api';
import type { OrderListSearch } from '../schemas';
import { buildOrderListParams } from '../utils/order-list-params';
import {
  assignOrderToDesigner,
  approveDesignWorkFlowAPI,
  batchPrintWorkInstructionsAPI,
  bulkOrderStatusChangeAPI,
  getAssignedDessignDetailAPI,
  getAssignedDessignListAPI,
  getOrderDesignFilesAPI,
  getOrderDetailAPI,
  getOrderStatusChangeHistoryAPI,
  getOrdersAPI,
  printWorkInstructionAPI,
  resubmitOrderDesignFileAPI,
  sendDesignReviewAPI,
  uploadDratfDesignFileAPI,
  updateOrderStatusAPI,
} from './order.api';
import type {
  BatchPrintWorkInstructionsREQ,
  BulkOrderStatusChangeREQ,
  AssignedDesignListREQ,
  OrderAssignDesignerREQ,
  OrderListREQ,
  OrderResubmitFileREQ,
  OrderStatusChangeHistoryREQ,
  sendDesignReviewREQ,
  UpdateOrderStatusREQ,
  UploadDraftDesignFileREQ,
} from './order.request';
import type {
  BatchPrintWorkInstructionsRESP,
  BulkOrderStatusChangeRESP,
  AssignedDesignListRESP,
  AssignedDesignDetail,
  OrderActionRESP,
  OrderDesignFilesRESP,
  OrderDetailRESP,
  OrderFileResubmissionRESP,
  OrderListItemRESP,
  OrderListRESP,
  OrderStatusChangeHistoryRESP,
  WorkInstructionPrintRESP,
} from './order.response';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderListREQ) => [...orderKeys.lists(), params] as const,
  detail: (orderId: string) => [...orderKeys.all, 'detail', orderId] as const,
  designFiles: (orderNumber: string) => [...orderKeys.all, 'design-files', orderNumber] as const,
  statusChangeHistory: (orderNumber: string, params: OrderStatusChangeHistoryREQ) =>
    [...orderKeys.all, 'status-change-history', orderNumber, params] as const,
  assignedDesignLists: () => [...orderKeys.all, 'assigned-design-list'] as const,
  assignedDesignList: (params: AssignedDesignListREQ) => [...orderKeys.assignedDesignLists(), params] as const,
  assignedDesignDetail: (orderNumber: string) => [...orderKeys.all, 'assigned-design-detail', orderNumber] as const,
};

type OrderListQueryKey = ReturnType<typeof orderKeys.list>;
type OrderDetailQueryKey = ReturnType<typeof orderKeys.detail>;
type OrderDesignFilesQueryKey = ReturnType<typeof orderKeys.designFiles>;
type OrderStatusChangeHistoryQueryKey = ReturnType<typeof orderKeys.statusChangeHistory>;
type AssignedDesignListQueryKey = ReturnType<typeof orderKeys.assignedDesignList>;
type AssignedDesignDetailQueryKey = ReturnType<typeof orderKeys.assignedDesignDetail>;

export function orderListQueryOptions(params: OrderListREQ) {
  return queryOptions<OrderListRESP, AxiosError<IBaseError>, OrderListRESP, OrderListQueryKey>({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrdersAPI(params),
    staleTime: 30_000,
  });
}

export function orderListQueryOptionsBySearch(search: OrderListSearch) {
  return orderListQueryOptions(buildOrderListParams(search));
}

export function useOrdersQuery(
  params: OrderListREQ,
  options?: Omit<UseQueryOptions<OrderListRESP, AxiosError<IBaseError>, OrderListRESP, OrderListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<OrderListRESP, AxiosError<IBaseError>, OrderListRESP, OrderListQueryKey>({
    ...orderListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function orderDetailQueryOptions(orderId: string) {
  return queryOptions<OrderDetailRESP, AxiosError<IBaseError>, OrderListItemRESP | null, OrderDetailQueryKey>({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderDetailAPI(orderId),
    select: (resp) => resp.data.order ?? null,
    staleTime: 30_000,
  });
}

export function useOrderDetailQuery(
  orderId: string,
  options?: Omit<
    UseQueryOptions<OrderDetailRESP, AxiosError<IBaseError>, OrderListItemRESP | null, OrderDetailQueryKey>,
    'queryKey' | 'queryFn' | 'select'
  >,
) {
  return useQuery<OrderDetailRESP, AxiosError<IBaseError>, OrderListItemRESP | null, OrderDetailQueryKey>({
    ...orderDetailQueryOptions(orderId),
    ...options,
  });
}

export function useOrderDesignFilesQuery(
  orderNumber: string,
  options?: Omit<
    UseQueryOptions<OrderDesignFilesRESP, AxiosError<IBaseError>, OrderFileResubmissionRESP[], OrderDesignFilesQueryKey>,
    'queryKey' | 'queryFn' | 'select'
  >,
) {
  return useQuery<OrderDesignFilesRESP, AxiosError<IBaseError>, OrderFileResubmissionRESP[], OrderDesignFilesQueryKey>({
    queryKey: orderKeys.designFiles(orderNumber),
    queryFn: () => getOrderDesignFilesAPI(orderNumber),
    select: (resp) =>
      [...(resp.data.metadata.file_resubmissions ?? [])].sort(
        (first, second) => new Date(second.submitted_at).getTime() - new Date(first.submitted_at).getTime(),
      ),
    staleTime: 30_000,
    ...options,
  });
}

export function useOrderStatusChangeHistoryQuery(
  orderNumber: string,
  params: OrderStatusChangeHistoryREQ,
  options?: Omit<
    UseQueryOptions<OrderStatusChangeHistoryRESP, AxiosError<IBaseError>, OrderStatusChangeHistoryRESP, OrderStatusChangeHistoryQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<OrderStatusChangeHistoryRESP, AxiosError<IBaseError>, OrderStatusChangeHistoryRESP, OrderStatusChangeHistoryQueryKey>({
    queryKey: orderKeys.statusChangeHistory(orderNumber, params),
    queryFn: () => getOrderStatusChangeHistoryAPI(orderNumber, params),
    placeholderData: keepPreviousData,
    enabled: !!orderNumber,
    ...options,
  });
}

export function usePrintWorkInstructionMutation(options?: UseMutationOptions<WorkInstructionPrintRESP, AxiosError<IBaseError>, string>) {
  return useMutation({
    mutationFn: printWorkInstructionAPI,
    ...options,
  });
}

export function useBatchPrintWorkInstructionsMutation(
  options?: UseMutationOptions<BatchPrintWorkInstructionsRESP, AxiosError<IBaseError>, BatchPrintWorkInstructionsREQ>,
) {
  return useMutation({
    mutationFn: batchPrintWorkInstructionsAPI,
    ...options,
  });
}

export function useResubmitOrderDesignFileMutation(options?: UseMutationOptions<unknown, AxiosError<IBaseError>, OrderResubmitFileREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: resubmitOrderDesignFileAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.designFiles(variables.orderNumber) });
      await queryClient.invalidateQueries({ queryKey: orderKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateOrderStatusMutation(options?: UseMutationOptions<OrderActionRESP, AxiosError<IBaseError>, UpdateOrderStatusREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateOrderStatusAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useBulkOrderStatusChangeMutation(
  options?: UseMutationOptions<BulkOrderStatusChangeRESP, AxiosError<IBaseError>, BulkOrderStatusChangeREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkOrderStatusChangeAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useAssignOrderToDesignerMutation(
  options?: UseMutationOptions<Awaited<ReturnType<typeof assignOrderToDesigner>>, AxiosError<IBaseError>, OrderAssignDesignerREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: assignOrderToDesigner,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function assignedDesignListQueryOptions(params: AssignedDesignListREQ) {
  return queryOptions<
    PaginationResponse<AssignedDesignListRESP>,
    AxiosError<IBaseError>,
    PaginationResponse<AssignedDesignListRESP>,
    AssignedDesignListQueryKey
  >({
    queryKey: orderKeys.assignedDesignList(params),
    queryFn: () => getAssignedDessignListAPI(params),
    staleTime: 30_000,
  });
}

export function useAssignedDesignListQuery(
  params: AssignedDesignListREQ,
  options?: Omit<
    UseQueryOptions<
      PaginationResponse<AssignedDesignListRESP>,
      AxiosError<IBaseError>,
      PaginationResponse<AssignedDesignListRESP>,
      AssignedDesignListQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<
    PaginationResponse<AssignedDesignListRESP>,
    AxiosError<IBaseError>,
    PaginationResponse<AssignedDesignListRESP>,
    AssignedDesignListQueryKey
  >({
    ...assignedDesignListQueryOptions(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function assignedDesignDetailQueryOptions(orderNumber: string) {
  return queryOptions<BaseResponse<AssignedDesignDetail>, AxiosError<IBaseError>, BaseResponse<AssignedDesignDetail>, AssignedDesignDetailQueryKey>({
    queryKey: orderKeys.assignedDesignDetail(orderNumber),
    queryFn: () => getAssignedDessignDetailAPI(orderNumber),
    staleTime: 30_000,
  });
}

export function useAssignedDesignDetailQuery(
  orderNumber: string,
  options?: Omit<
    UseQueryOptions<BaseResponse<AssignedDesignDetail>, AxiosError<IBaseError>, BaseResponse<AssignedDesignDetail>, AssignedDesignDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<BaseResponse<AssignedDesignDetail>, AxiosError<IBaseError>, BaseResponse<AssignedDesignDetail>, AssignedDesignDetailQueryKey>({
    ...assignedDesignDetailQueryOptions(orderNumber),
    enabled: !!orderNumber,
    ...options,
  });
}

export function useUploadDratfDesignFileMutation(
  options?: UseMutationOptions<Awaited<ReturnType<typeof uploadDratfDesignFileAPI>>, AxiosError<IBaseError>, UploadDraftDesignFileREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: uploadDratfDesignFileAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.assignedDesignDetail(variables.orderNumber) });
      await queryClient.invalidateQueries({ queryKey: orderKeys.assignedDesignLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useSendDesignReviewMutation(
  options?: UseMutationOptions<Awaited<ReturnType<typeof sendDesignReviewAPI>>, AxiosError<IBaseError>, sendDesignReviewREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: sendDesignReviewAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.assignedDesignDetail(variables.orderNumber) });
      await queryClient.invalidateQueries({ queryKey: orderKeys.assignedDesignLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useApproveDesignWorkFlowMutation(
  options?: UseMutationOptions<Awaited<ReturnType<typeof approveDesignWorkFlowAPI>>, AxiosError<IBaseError>, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: approveDesignWorkFlowAPI,
    onSuccess: async (data, orderNumber, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderNumber) });
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      await options?.onSuccess?.(data, orderNumber, onMutateResult, context);
    },
  });
}
