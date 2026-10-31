import dayjs from 'dayjs';
import type { TFunction } from 'i18next';

import type { Coupon } from '../api/coupon.response';
import { CouponDiscountType, CouponValidityStatus } from '../enums';

export const UNLIMITED_SYMBOL = '∞';

export function formatCouponNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function formatCouponDate(value: string | null): string {
  if (!value) return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : value;
}

export function formatCouponDateTime(value: string | null): string {
  if (!value) return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : value;
}

export function formatCouponDiscount(coupon: Coupon, t: TFunction<'page'>): string {
  const value = formatCouponNumber(coupon.discount_value);

  return coupon.discount_type === CouponDiscountType.PERCENTAGE
    ? t('orders.coupons.discount_value.percentage', { value })
    : t('orders.coupons.discount_value.fixed', { value });
}

export function formatCouponRemaining(coupon: Coupon): string {
  return coupon.usage_limit === null ? UNLIMITED_SYMBOL : formatCouponNumber(Math.max(coupon.usage_limit - coupon.usage_count, 0));
}

export function getCouponValidity(coupon: Coupon): CouponValidityStatus {
  const now = Date.now();

  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return CouponValidityStatus.UPCOMING;
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return CouponValidityStatus.EXPIRED;
  }

  return CouponValidityStatus.VALID;
}
