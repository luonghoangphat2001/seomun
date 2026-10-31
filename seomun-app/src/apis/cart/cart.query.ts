import { BaseResponse, ErrorRESP } from '@/types';
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { CartApi } from './cart.api';
import { CartAddItemREQ, CartDeleteBatchREQ, CartListREQ, CartOrderREQ, CartQuoteREQ } from './cart.request';
import { CartListResponse } from './cart.response';
import { OrderCreateResponse } from '../order/order.response';

export const cartQueryKeys = {
  LIST: 'CART_LIST',
  CART_QUOTE: 'CART_QUOTE',
};

export const useCartListQuery = (
  params?: CartListREQ,
  options?: Omit<UseQueryOptions<BaseResponse<CartListResponse>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn' | 'select'>,
) =>
  useQuery({
    queryKey: [cartQueryKeys.LIST, params],
    queryFn: () => CartApi.getCartList(params),
    select: (resp) => resp.data.cart,
    ...options,
  });

export const useAddToCartMutation = (
  options?: UseMutationOptions<BaseResponse<unknown>, AxiosError<ErrorRESP>, CartAddItemREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CartApi.addToCart,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: [cartQueryKeys.LIST] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteCartItemMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, number>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CartApi.deleteCartItem,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: [cartQueryKeys.LIST] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteCartBatchMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, CartDeleteBatchREQ>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CartApi.deleteCartBatch,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: [cartQueryKeys.LIST] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useCartQuoteQuery = (body?: CartQuoteREQ) =>
  useQuery({
    queryKey: [cartQueryKeys.CART_QUOTE, body],
    queryFn: () => CartApi.checkCartQuote(body as CartQuoteREQ),
    select: (resp) => resp.data,
    enabled: !!body,
    // placeholderData: keepPreviousData,
    retry: 1,
  });

export const useOrderCartItemMutation = (
  options?: UseMutationOptions<BaseResponse<OrderCreateResponse>, AxiosError<ErrorRESP>, CartOrderREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CartApi.orderCartItem,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: [cartQueryKeys.LIST] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
