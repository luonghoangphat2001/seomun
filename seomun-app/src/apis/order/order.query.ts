import { BaseResponse, ErrorRESP } from '@/types';
import { useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderCreateResponse } from './order.response';
import { AxiosError } from 'axios';
import { OrderCreateREQ, OrderDesignReviewReplyREQ } from './order.request';
import { OrderApi } from './order.api';

export const orderQueryKeys = {
  ORDER_DETAIL: 'ORDER_DETAIL',
  ORDER_DESIGN_REVIEW: 'ORDER_DESIGN_REVIEW',
};

export const useCreateOrderProductMutation = (
  options?: UseMutationOptions<BaseResponse<OrderCreateResponse>, AxiosError<ErrorRESP>, OrderCreateREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: OrderApi.createOrderProduct,
  });

export const useGetOrderDetail = (orderNumber?: string) =>
  useQuery({
    queryKey: [orderQueryKeys.ORDER_DETAIL, orderNumber],
    queryFn: () => OrderApi.getOrderDetailByNumber(orderNumber as string),
    select: (resp) => resp.data.order,
    enabled: !!orderNumber,
  });

export const useGetOrderDesignReview = (token?: string) =>
  useQuery({
    queryKey: [orderQueryKeys.ORDER_DESIGN_REVIEW, token],
    queryFn: async () => {
      const response = await OrderApi.getDesignReview(token as string);

      if (response.success === false) {
        throw new Error(response.message ?? 'Không thể tải thông tin duyệt thiết kế.');
      }

      return response;
    },
    select: (resp) => resp.data,
    enabled: !!token,
    retry: false,
  });

export const useReplyDesignReviewMutation = (
  options?: UseMutationOptions<BaseResponse<unknown>, AxiosError<ErrorRESP>, OrderDesignReviewReplyREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: OrderApi.replyDesignReview,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (data.success !== false) {
        await queryClient.invalidateQueries({ queryKey: [orderQueryKeys.ORDER_DESIGN_REVIEW, variables.token] });
      }

      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
