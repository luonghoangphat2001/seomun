import { useInfiniteQuery, useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShippingAddressCreateREQ, ShippingAddressListREQ, ShippingAddressUpdateREQ } from './shipping-address.request';
import { ShippingAddressApi } from './shipping-address.api';
import { AxiosError } from 'axios';
import { ErrorRESP } from '@/types';

export const SHIPPING_ADDRESS_QUERY_KEYS = {
  LIST: 'SHIPPING_ADDRESS_LIST',
  MOBILE_LIST: 'SHIPPING_ADDRESS_MOBILE_LIST',
  DETAIL: 'SHIPPING_ADDRESS_DETAIL',
};

export const useShippingAddressListQuery = (params?: ShippingAddressListREQ) =>
  useQuery({
    queryKey: [SHIPPING_ADDRESS_QUERY_KEYS.LIST, params],
    queryFn: () => ShippingAddressApi.list(params),
    select: (resp) => ({
      list: resp.data.addresses,
      pagination: resp.pagination,
    }),
    refetchOnWindowFocus: true,
  });

export const useShippingAddressMobileListQuery = (params?: ShippingAddressListREQ) =>
  useInfiniteQuery({
    queryKey: [SHIPPING_ADDRESS_QUERY_KEYS.MOBILE_LIST, params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => ShippingAddressApi.list({ ...params, page: pageParam }),
    getNextPageParam: (resp) => {
      const pagination = resp.pagination;

      const currentPage = pagination.current_page || 1;
      const totalPage = pagination.total_page || 1;

      return currentPage < totalPage ? currentPage + 1 : undefined;
    },
  });

export const useShippingAddressDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [SHIPPING_ADDRESS_QUERY_KEYS.DETAIL, id],
    queryFn: () => ShippingAddressApi.detail(id as number),
    enabled: !!id,
  });

export const useShippingAddressCreateMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, ShippingAddressCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ShippingAddressApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEYS.MOBILE_LIST] });
    },
    ...options,
  });
};

export const useShippingAddressUpdateMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, ShippingAddressUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ShippingAddressApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEYS.DETAIL] });
    },
    ...options,
  });
};

export const useShippingAddressDeleteMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, number[]>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ShippingAddressApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEYS.MOBILE_LIST] });
    },
    ...options,
  });
};
