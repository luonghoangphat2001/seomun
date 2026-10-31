import dayjs from 'dayjs';

import { CouponIssueTargetType } from '../enums';
import type { CouponFormValues, CouponIssueFormValues } from '../schemas';
import type { NormalizedCouponListParams } from '../utils/coupon-list-params';
import { getCouponIssuancesAPI, getCouponsAPI } from './coupon.api';
import type { CouponFormREQ, CouponIssuanceListREQ, CouponIssueREQ } from './coupon.request';
import type { CouponIssuanceListRESP, CouponListRESP } from './coupon.response';

const API_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function toOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number(trimmed);
}

function toRequiredNumber(value: string): number {
  const trimmed = value.trim();
  return trimmed === '' ? 0 : Number(trimmed);
}

const toApiStartOfDay = (date: Date | null) => (date ? dayjs(date).startOf('day').format(API_DATE_TIME_FORMAT) : null);
const toApiEndOfDay = (date: Date | null) => (date ? dayjs(date).endOf('day').format(API_DATE_TIME_FORMAT) : null);

export function getCouponList(params: NormalizedCouponListParams): Promise<CouponListRESP> {
  return getCouponsAPI(params);
}

export function getCouponIssuances({ couponId, ...params }: CouponIssuanceListREQ): Promise<CouponIssuanceListRESP> {
  return getCouponIssuancesAPI(couponId, params);
}

export function mapCouponFormToREQ(values: CouponFormValues): CouponFormREQ {
  return {
    code: values.code,
    name: values.name,
    description: values.description.trim() || null,
    discount_type: values.discount_type,
    discount_value: Number(values.discount_value),
    min_order_amount: toRequiredNumber(values.min_order_amount),
    max_discount_amount: toOptionalNumber(values.max_discount_amount),
    usage_limit: toOptionalNumber(values.usage_limit),
    claim_starts_at: toApiStartOfDay(values.claim_starts_at),
    claim_ends_at: toApiEndOfDay(values.claim_ends_at),
    starts_at: toApiStartOfDay(values.starts_at),
    expires_at: toApiEndOfDay(values.expires_at),
    is_active: values.is_active,
    sort_order: toRequiredNumber(values.sort_order),
  };
}

export function mapCouponIssueFormToREQ(couponId: number, values: CouponIssueFormValues): CouponIssueREQ {
  const base = { couponId, target_type: values.target_type };

  switch (values.target_type) {
    case CouponIssueTargetType.SPECIFIC_USERS:
      return { ...base, user_ids: values.user_ids.map(Number) };
    case CouponIssueTargetType.ALL_USERS:
    default:
      return base;
  }
}
