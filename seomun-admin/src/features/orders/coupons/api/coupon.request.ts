import type { PaginationRequest, SortRequest } from '@/types/api';

import type { CouponDiscountType, CouponIssuanceStatus, CouponIssueTargetType, CouponSortField, CouponValidityStatus } from '../enums';

export interface CouponListREQ extends PaginationRequest, SortRequest<CouponSortField> {
  search_term?: string;
  discount_type?: CouponDiscountType;
  is_active?: boolean;
  validity_status?: CouponValidityStatus;
  starts_at_from?: string;
  starts_at_to?: string;
  expires_at_from?: string;
  expires_at_to?: string;
}

export interface CouponFormREQ {
  code: string;
  name: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  claim_starts_at: string | null;
  claim_ends_at: string | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface UpdateCouponREQ {
  couponId: number;
  payload: CouponFormREQ;
}

export interface UpdateCouponStatusREQ {
  couponId: number;
  is_active: boolean;
}

export interface CouponIssueREQ {
  couponId: number;
  target_type: CouponIssueTargetType;
  user_ids?: number[];
}

export interface CouponIssuanceListREQ extends PaginationRequest {
  couponId: number;
  status?: CouponIssuanceStatus;
}
