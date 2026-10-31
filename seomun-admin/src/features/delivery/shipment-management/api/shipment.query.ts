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

import type { ShipmentListSearch } from '../schemas';
import { buildShipmentListParams } from '../utils';
import { getShipmentTrackingInfoAPI, getShipmentsAPI, getShipmentSearchFiltersAPI, updateShipmentTrackingNumberAPI } from './shipment.api';
import type { ShipmentListREQ, ShipmentTrackingInfoREQ, ShipmentTrackingNumberREQ } from './shipment.request';
import type { ShipmentListFilteredRESP, ShipmentListRESP, ShipmentTrackingInfoRESP } from './shipment.response';

export const shipmentKeys = {
  all: ['delivery', 'shipments'] as const,
  lists: () => [...shipmentKeys.all, 'list'] as const,
  list: (params: ShipmentListREQ) => [...shipmentKeys.lists(), params] as const,
  filters: (params: ShipmentListREQ) => [...shipmentKeys.all, 'filters', params] as const,
  trackingInfo: (params?: ShipmentTrackingInfoREQ) => [...shipmentKeys.all, 'tracking-info', params] as const,
};

type ShipmentListQueryKey = ReturnType<typeof shipmentKeys.list>;
type ShipmentFiltersQueryKey = ReturnType<typeof shipmentKeys.filters>;
type ShipmentTrackingInfoQueryKey = ReturnType<typeof shipmentKeys.trackingInfo>;

export function shipmentListQueryOptions(params: ShipmentListREQ) {
  return queryOptions<ShipmentListRESP, AxiosError<IBaseError>, ShipmentListRESP, ShipmentListQueryKey>({
    queryKey: shipmentKeys.list(params),
    queryFn: () => getShipmentsAPI(params),
    staleTime: 30_000,
  });
}

export function shipmentListQueryOptionsBySearch(search: ShipmentListSearch) {
  return shipmentListQueryOptions(buildShipmentListParams(search));
}

export function useShipmentsQuery(
  params: ShipmentListREQ,
  options?: Omit<UseQueryOptions<ShipmentListRESP, AxiosError<IBaseError>, ShipmentListRESP, ShipmentListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ShipmentListRESP, AxiosError<IBaseError>, ShipmentListRESP, ShipmentListQueryKey>({
    ...shipmentListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateShipmentTrackingNumberMutation(options?: UseMutationOptions<void, AxiosError<IBaseError>, ShipmentTrackingNumberREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateShipmentTrackingNumberAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useShipmentSearchFiltersQuery(
  params: ShipmentListREQ,
  options?: Omit<
    UseQueryOptions<ShipmentListFilteredRESP, AxiosError<IBaseError>, ShipmentListFilteredRESP, ShipmentFiltersQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ShipmentListFilteredRESP, AxiosError<IBaseError>, ShipmentListFilteredRESP, ShipmentFiltersQueryKey>({
    queryKey: shipmentKeys.filters(params),
    queryFn: () => getShipmentSearchFiltersAPI(params),
    staleTime: 60_000,
    ...options,
  });
}

export function shipmentTrackingInfoQueryOptions(params?: ShipmentTrackingInfoREQ) {
  return queryOptions<
    BaseResponse<ShipmentTrackingInfoRESP>,
    AxiosError<IBaseError>,
    BaseResponse<ShipmentTrackingInfoRESP>,
    ShipmentTrackingInfoQueryKey
  >({
    queryKey: shipmentKeys.trackingInfo(params),
    queryFn: () => getShipmentTrackingInfoAPI(params),
    staleTime: 30_000,
    enabled: Boolean(params),
  });
}

export function useShipmentTrackingInfoQuery(
  params?: ShipmentTrackingInfoREQ,
  options?: Omit<
    UseQueryOptions<
      BaseResponse<ShipmentTrackingInfoRESP>,
      AxiosError<IBaseError>,
      BaseResponse<ShipmentTrackingInfoRESP>,
      ShipmentTrackingInfoQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<
    BaseResponse<ShipmentTrackingInfoRESP>,
    AxiosError<IBaseError>,
    BaseResponse<ShipmentTrackingInfoRESP>,
    ShipmentTrackingInfoQueryKey
  >({
    ...shipmentTrackingInfoQueryOptions(params),
    ...options,
  });
}
