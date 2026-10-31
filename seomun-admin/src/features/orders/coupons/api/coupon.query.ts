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

import type { IBaseError } from '@/types/api';

import type { CouponListSearch } from '../schemas';
import { buildCouponListParams, type NormalizedCouponListParams } from '../utils/coupon-list-params';
import { createCouponAPI, deleteCouponAPI, getCouponDetailAPI, issueCouponAPI, updateCouponAPI, updateCouponStatusAPI } from './coupon.api';
import type { CouponFormREQ, CouponIssuanceListREQ, CouponIssueREQ, UpdateCouponREQ, UpdateCouponStatusREQ } from './coupon.request';
import type { Coupon, CouponDeleteRESP, CouponDetailRESP, CouponIssuanceListRESP, CouponIssueRESP, CouponListRESP } from './coupon.response';
import { getCouponIssuances, getCouponList } from './coupon.service';

export const couponKeys = {
  all: ['orders', 'coupons'] as const,
  lists: () => [...couponKeys.all, 'list'] as const,
  list: (params: NormalizedCouponListParams) => [...couponKeys.lists(), params] as const,
  detail: (couponId: number) => [...couponKeys.all, 'detail', couponId] as const,
  issuances: (params: CouponIssuanceListREQ) => [...couponKeys.detail(params.couponId), 'issuances', params] as const,
};

type CouponListQueryKey = ReturnType<typeof couponKeys.list>;
type CouponDetailQueryKey = ReturnType<typeof couponKeys.detail>;
type CouponIssuanceListQueryKey = ReturnType<typeof couponKeys.issuances>;

// ============================================================================
// Queries
// ============================================================================

export function couponListQueryOptions(params: NormalizedCouponListParams) {
  return queryOptions<CouponListRESP, AxiosError<IBaseError>, CouponListRESP, CouponListQueryKey>({
    queryKey: couponKeys.list(params),
    queryFn: () => getCouponList(params),
    staleTime: 30_000,
  });
}

export function couponListQueryOptionsBySearch(search: CouponListSearch) {
  return couponListQueryOptions(buildCouponListParams(search));
}

export function useCouponsQuery(
  params: NormalizedCouponListParams,
  options?: Omit<UseQueryOptions<CouponListRESP, AxiosError<IBaseError>, CouponListRESP, CouponListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CouponListRESP, AxiosError<IBaseError>, CouponListRESP, CouponListQueryKey>({
    ...couponListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function couponDetailQueryOptions(couponId: number) {
  return queryOptions<CouponDetailRESP, AxiosError<IBaseError>, Coupon | null, CouponDetailQueryKey>({
    queryKey: couponKeys.detail(couponId),
    queryFn: () => getCouponDetailAPI(couponId),
    select: (response) => response.data.coupon ?? null,
    staleTime: 30_000,
  });
}

export function useCouponDetailQuery(
  couponId: number,
  options?: Omit<UseQueryOptions<CouponDetailRESP, AxiosError<IBaseError>, Coupon | null, CouponDetailQueryKey>, 'queryKey' | 'queryFn' | 'select'>,
) {
  return useQuery<CouponDetailRESP, AxiosError<IBaseError>, Coupon | null, CouponDetailQueryKey>({
    ...couponDetailQueryOptions(couponId),
    ...options,
  });
}

export function useCouponIssuancesQuery(params: CouponIssuanceListREQ) {
  return useQuery<CouponIssuanceListRESP, AxiosError<IBaseError>, CouponIssuanceListRESP, CouponIssuanceListQueryKey>({
    queryKey: couponKeys.issuances(params),
    queryFn: () => getCouponIssuances(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useCreateCouponMutation(options?: UseMutationOptions<CouponDetailRESP, AxiosError<IBaseError>, CouponFormREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createCouponAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCouponMutation(options?: UseMutationOptions<CouponDetailRESP, AxiosError<IBaseError>, UpdateCouponREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateCouponAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables.couponId) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteCouponMutation(options?: UseMutationOptions<CouponDeleteRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteCouponAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.removeQueries({ queryKey: couponKeys.detail(variables) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCouponStatusMutation(options?: UseMutationOptions<CouponDetailRESP, AxiosError<IBaseError>, UpdateCouponStatusREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateCouponStatusAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables.couponId) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useIssueCouponMutation(options?: UseMutationOptions<CouponIssueRESP, AxiosError<IBaseError>, CouponIssueREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: issueCouponAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables.couponId) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
