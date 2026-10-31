import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { CouponDiscountType, CouponIssuanceStatus } from '../enums';

export interface CouponStatistics {
  issued_total: number;
  used_total: number;
  available_total: number;
  upcoming_total: number;
  expired_total: number;
  usage_rate: number;
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  issued_count: number;
  claim_starts_at: string | null;
  claim_ends_at: string | null;
  is_claimable: boolean;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  is_valid: boolean;
  status_label: string;
  sort_order: number | null;
  statistics?: CouponStatistics;
  created_at: string;
  updated_at: string;
}

export interface CouponIssuance {
  id: number;
  user_id: number;
  coupon_id: number;
  status: CouponIssuanceStatus;
  received_at: string;
  used_at: string | null;
  user: {
    id: number;
    username: string;
    name: string;
    email: string | null;
    mobile: string | null;
    customer: { id: number; company_name: string | null } | null;
  } | null;
  /** Set once the coupon has been used on an order. */
  order: {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    discount_amount: number;
  } | null;
}

export type CouponListRESP = PaginationResponse<{ coupons: Coupon[] }>;

export type CouponDetailRESP = BaseResponse<{ coupon: Coupon }>;

export type CouponDeleteRESP = BaseResponse<unknown>;

export type CouponIssueRESP = BaseResponse<unknown>;

export type CouponIssuanceListRESP = PaginationResponse<{ issuances: CouponIssuance[] }>;
