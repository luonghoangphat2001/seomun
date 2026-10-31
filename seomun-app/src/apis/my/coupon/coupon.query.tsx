import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { CouponListREQ, OrderCouponListREQ } from './coupon.request';
import { CouponApi } from './coupon.api';

export const COUPON_QUERY_KEYS = {
  LIST: 'MY_COUPON_LIST',
  MOBILE_LIST: 'MY_COUPON_MOBILE_LIST',
  ORDER_COUPON_LIST: 'ORDER_COUPON_LIST',
};

export const useCouponListQuery = (params?: CouponListREQ) =>
  useQuery({
    queryKey: [COUPON_QUERY_KEYS.LIST, params],
    queryFn: () => CouponApi.list(params),
    select: (resp) => ({
      list: resp.data.coupons,
      pagination: resp.pagination,
    }),
  });

export const useCouponMobileListQuery = (params?: CouponListREQ) =>
  useInfiniteQuery({
    queryKey: [COUPON_QUERY_KEYS.MOBILE_LIST, params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => CouponApi.list({ ...params, page: pageParam }),
    getNextPageParam: (resp) => {
      const pagination = resp.pagination;

      const currentPage = pagination.current_page || 1;
      const totalPage = pagination.total_page || 1;

      return currentPage < totalPage ? currentPage + 1 : undefined;
    },
  });

export const useOrderCouponListQuery = (params?: OrderCouponListREQ) =>
  useQuery({
    queryKey: [COUPON_QUERY_KEYS.ORDER_COUPON_LIST, params],
    queryFn: () => CouponApi.orderCouponList(params),
    select: (resp) => resp.data,
    enabled: Boolean(params?.amount),
  });
