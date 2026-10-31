import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';

import { CouponActiveFilter, CouponDiscountType, CouponIssuanceStatus, CouponIssueTargetType, CouponValidityStatus } from '../enums';

export const COUPON_DISCOUNT_TYPE_LABELS: Record<CouponDiscountType, (t: TFunction<'page'>) => string> = {
  [CouponDiscountType.PERCENTAGE]: (t) => t('orders.coupons.discount_type.percentage'),
  [CouponDiscountType.FIXED]: (t) => t('orders.coupons.discount_type.fixed'),
};

export const COUPON_VALIDITY_STATUS_LABELS: Record<CouponValidityStatus, (t: TFunction<'page'>) => string> = {
  [CouponValidityStatus.VALID]: (t) => t('orders.coupons.validity_status.valid'),
  [CouponValidityStatus.EXPIRED]: (t) => t('orders.coupons.validity_status.expired'),
  [CouponValidityStatus.UPCOMING]: (t) => t('orders.coupons.validity_status.upcoming'),
};

export const COUPON_ISSUE_TARGET_LABELS: Record<CouponIssueTargetType, (t: TFunction<'page'>) => string> = {
  [CouponIssueTargetType.SPECIFIC_USERS]: (t) => t('orders.coupons.issue.target.specific_users'),
  [CouponIssueTargetType.ALL_USERS]: (t) => t('orders.coupons.issue.target.all_users'),
};

export const COUPON_ISSUE_TARGET_DESCRIPTIONS: Record<CouponIssueTargetType, (t: TFunction<'page'>) => string> = {
  [CouponIssueTargetType.SPECIFIC_USERS]: (t) => t('orders.coupons.issue.target_description.specific_users'),
  [CouponIssueTargetType.ALL_USERS]: (t) => t('orders.coupons.issue.target_description.all_users'),
};

export const COUPON_VALIDITY_BADGE_CLASSES: Record<CouponValidityStatus, string> = {
  [CouponValidityStatus.VALID]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [CouponValidityStatus.UPCOMING]: 'border-amber-200 bg-amber-50 text-amber-700',
  [CouponValidityStatus.EXPIRED]: 'border-rose-200 bg-rose-50 text-rose-700',
};

export const COUPON_ISSUANCE_STATUS_LABELS: Record<CouponIssuanceStatus, (t: TFunction<'page'>) => string> = {
  [CouponIssuanceStatus.AVAILABLE]: (t) => t('orders.coupons.issuance_status.available'),
  [CouponIssuanceStatus.USED]: (t) => t('orders.coupons.issuance_status.used'),
  [CouponIssuanceStatus.UPCOMING]: (t) => t('orders.coupons.issuance_status.upcoming'),
  [CouponIssuanceStatus.EXPIRED]: (t) => t('orders.coupons.issuance_status.expired'),
};

export const COUPON_ISSUANCE_STATUS_BADGE_CLASSES: Record<CouponIssuanceStatus, string> = {
  [CouponIssuanceStatus.AVAILABLE]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  [CouponIssuanceStatus.USED]: 'border-sky-200 bg-sky-50 text-sky-700',
  [CouponIssuanceStatus.UPCOMING]: 'border-amber-200 bg-amber-50 text-amber-700',
  [CouponIssuanceStatus.EXPIRED]: 'border-rose-200 bg-rose-50 text-rose-700',
};

// ============================================================================
// Select options
// ============================================================================

export function getCouponDiscountTypeOptions(t: TFunction<'page'>): AppSelectOption<CouponDiscountType>[] {
  return Object.values(CouponDiscountType).map((value) => ({ value, label: COUPON_DISCOUNT_TYPE_LABELS[value](t) }));
}

export function getCouponValidityStatusOptions(t: TFunction<'page'>): AppSelectOption<CouponValidityStatus>[] {
  return Object.values(CouponValidityStatus).map((value) => ({ value, label: COUPON_VALIDITY_STATUS_LABELS[value](t) }));
}

export function getCouponIssuanceStatusOptions(t: TFunction<'page'>): AppSelectOption<CouponIssuanceStatus>[] {
  return Object.values(CouponIssuanceStatus).map((value) => ({ value, label: COUPON_ISSUANCE_STATUS_LABELS[value](t) }));
}

export function getCouponActiveFilterOptions(t: TFunction<'common'>): AppSelectOption<CouponActiveFilter>[] {
  return [
    { value: CouponActiveFilter.ACTIVE, label: t('status.active') },
    { value: CouponActiveFilter.INACTIVE, label: t('status.inactive') },
  ];
}

export function getCouponIssueTargetOptions(t: TFunction<'page'>) {
  return Object.values(CouponIssueTargetType).map((value) => ({
    value,
    label: COUPON_ISSUE_TARGET_LABELS[value](t),
    description: COUPON_ISSUE_TARGET_DESCRIPTIONS[value](t),
  }));
}
