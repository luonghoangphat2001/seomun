import { api } from '@/config';
import { CouponListREQ, OrderCouponListREQ } from './coupon.request';
import { BaseResponse, PaginationResponse } from '@/types';
import { CouponListRESP, OrderCouponListRESP } from './coupon.response';

const ENDPOINT = {
  ROOT: '/mypage/coupons',
  GET_ORDER_COUPON_LIST: '/orders/checkout/applicable-coupons',
};

export const CouponApi = {
  list: (params?: CouponListREQ) => api.get<PaginationResponse<CouponListRESP>>(ENDPOINT.ROOT, { params }),
  orderCouponList: (params?: OrderCouponListREQ) =>
    api.get<BaseResponse<OrderCouponListRESP>>(ENDPOINT.GET_ORDER_COUPON_LIST, { params }),
};
