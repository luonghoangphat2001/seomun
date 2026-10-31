import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { CouponFormREQ, CouponIssuanceListREQ, CouponIssueREQ, CouponListREQ, UpdateCouponREQ, UpdateCouponStatusREQ } from './coupon.request';
import type { CouponDeleteRESP, CouponDetailRESP, CouponIssuanceListRESP, CouponIssueRESP, CouponListRESP } from './coupon.response';

export function getCouponsAPI(params: CouponListREQ): Promise<CouponListRESP> {
  return api.get(ENDPOINTS.ORDERS.COUPONS.LIST, { params });
}

export function getCouponDetailAPI(couponId: number): Promise<CouponDetailRESP> {
  return api.get(ENDPOINTS.ORDERS.COUPONS.DETAIL(couponId));
}

export function createCouponAPI(payload: CouponFormREQ): Promise<CouponDetailRESP> {
  return api.post(ENDPOINTS.ORDERS.COUPONS.CREATE, payload);
}

export function updateCouponAPI({ couponId, payload }: UpdateCouponREQ): Promise<CouponDetailRESP> {
  return api.put(ENDPOINTS.ORDERS.COUPONS.UPDATE(couponId), payload);
}

export function deleteCouponAPI(couponId: number): Promise<CouponDeleteRESP> {
  return api.delete(ENDPOINTS.ORDERS.COUPONS.DELETE(couponId));
}

export function updateCouponStatusAPI({ couponId, ...payload }: UpdateCouponStatusREQ): Promise<CouponDetailRESP> {
  return api.patch(ENDPOINTS.ORDERS.COUPONS.STATUS(couponId), payload);
}

export function issueCouponAPI({ couponId, ...payload }: CouponIssueREQ): Promise<CouponIssueRESP> {
  return api.post(ENDPOINTS.ORDERS.COUPONS.ISSUE(couponId), payload);
}

export function getCouponIssuancesAPI(couponId: number, params: Omit<CouponIssuanceListREQ, 'couponId'>): Promise<CouponIssuanceListRESP> {
  return api.get(ENDPOINTS.ORDERS.COUPONS.ISSUANCES(couponId), { params });
}
