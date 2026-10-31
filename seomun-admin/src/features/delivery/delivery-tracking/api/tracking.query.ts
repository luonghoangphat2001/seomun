import { keepPreviousData, queryOptions, useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { TrackingListSearch } from '../schemas';
import { buildTrackingListParams } from '../utils';
import {
  checkDeliveryTrackingExportStatusAPI,
  exportDeliveryTrackingAPI,
  getDeliveryTrackingDetailAPI,
  getDeliveryTrackingsAPI,
} from './tracking.api';
import type { DeliveryTrackingExportREQ, DeliveryTrackingListREQ } from './tracking.request';
import type { DeliveryTrackingDetailWrapRESP, DeliveryTrackingExportRESP, DeliveryTrackingListRESP } from './tracking.response';

export const deliveryTrackingKeys = {
  all: ['delivery', 'tracking'] as const,
  lists: () => [...deliveryTrackingKeys.all, 'list'] as const,
  list: (params: DeliveryTrackingListREQ) => [...deliveryTrackingKeys.lists(), params] as const,
  detail: (invoiceNumber: string) => [...deliveryTrackingKeys.all, 'detail', invoiceNumber] as const,
};

type DeliveryTrackingListQueryKey = ReturnType<typeof deliveryTrackingKeys.list>;
type DeliveryTrackingDetailQueryKey = ReturnType<typeof deliveryTrackingKeys.detail>;

// ─── Query Options ────────────────────────────────────────────────────────────

export function deliveryTrackingListQueryOptions(params: DeliveryTrackingListREQ) {
  return queryOptions<DeliveryTrackingListRESP, AxiosError<IBaseError>, DeliveryTrackingListRESP, DeliveryTrackingListQueryKey>({
    queryKey: deliveryTrackingKeys.list(params),
    queryFn: () => getDeliveryTrackingsAPI(params),
    staleTime: 30_000,
  });
}

export function deliveryTrackingListQueryOptionsBySearch(search: TrackingListSearch) {
  return deliveryTrackingListQueryOptions(buildTrackingListParams(search));
}

export function deliveryTrackingDetailQueryOptions(invoiceNumber: string) {
  return queryOptions<DeliveryTrackingDetailWrapRESP, AxiosError<IBaseError>, DeliveryTrackingDetailWrapRESP, DeliveryTrackingDetailQueryKey>({
    queryKey: deliveryTrackingKeys.detail(invoiceNumber),
    queryFn: () => getDeliveryTrackingDetailAPI(invoiceNumber),
    staleTime: 30_000,
    enabled: Boolean(invoiceNumber),
  });
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDeliveryTrackingsQuery(
  params: DeliveryTrackingListREQ,
  options?: Omit<
    UseQueryOptions<DeliveryTrackingListRESP, AxiosError<IBaseError>, DeliveryTrackingListRESP, DeliveryTrackingListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<DeliveryTrackingListRESP, AxiosError<IBaseError>, DeliveryTrackingListRESP, DeliveryTrackingListQueryKey>({
    ...deliveryTrackingListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useDeliveryTrackingDetailQuery(
  invoiceNumber: string,
  options?: Omit<
    UseQueryOptions<DeliveryTrackingDetailWrapRESP, AxiosError<IBaseError>, DeliveryTrackingDetailWrapRESP, DeliveryTrackingDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<DeliveryTrackingDetailWrapRESP, AxiosError<IBaseError>, DeliveryTrackingDetailWrapRESP, DeliveryTrackingDetailQueryKey>({
    ...deliveryTrackingDetailQueryOptions(invoiceNumber),
    ...options,
  });
}

export function useExportDeliveryTrackingMutation(
  options?: UseMutationOptions<DeliveryTrackingExportRESP, AxiosError<IBaseError>, DeliveryTrackingExportREQ>,
) {
  return useMutation({
    mutationFn: exportDeliveryTrackingAPI,
    ...options,
  });
}

export function useCheckDeliveryTrackingExportStatusMutation(
  options?: UseMutationOptions<Awaited<ReturnType<typeof checkDeliveryTrackingExportStatusAPI>>, AxiosError<IBaseError>, number>,
) {
  return useMutation({
    mutationFn: checkDeliveryTrackingExportStatusAPI,
    ...options,
  });
}
