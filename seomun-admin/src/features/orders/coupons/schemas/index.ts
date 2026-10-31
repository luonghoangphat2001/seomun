import type { TFunction } from 'i18next';
import { z } from 'zod';

import { SortOrder } from '@/enums';

import type { Coupon } from '../api/coupon.response';
import { CouponActiveFilter, CouponDiscountType, CouponIssueTargetType, CouponSortField, CouponValidityStatus } from '../enums';

// ============================================================================
// List search (URL state)
// ============================================================================

export const couponListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(CouponSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  search_term: z.coerce.string().optional().catch(undefined),
  discount_type: z.enum(CouponDiscountType).optional().catch(undefined),
  is_active: z.enum(CouponActiveFilter).optional().catch(undefined),
  validity_status: z.enum(CouponValidityStatus).optional().catch(undefined),
  starts_at_from: z.string().optional().catch(undefined),
  starts_at_to: z.string().optional().catch(undefined),
  expires_at_from: z.string().optional().catch(undefined),
  expires_at_to: z.string().optional().catch(undefined),
});

export type CouponListSearch = z.infer<typeof couponListSearchSchema>;

export type CouponSearchFilterValues = {
  search_term: string;
  discount_type?: CouponDiscountType;
  is_active?: CouponActiveFilter;
  validity_status?: CouponValidityStatus;
  starts_at_from: Date | null;
  starts_at_to: Date | null;
  expires_at_from: Date | null;
  expires_at_to: Date | null;
};

export const EMPTY_COUPON_SEARCH_FILTER_VALUES: CouponSearchFilterValues = {
  search_term: '',
  discount_type: undefined,
  is_active: undefined,
  validity_status: undefined,
  starts_at_from: null,
  starts_at_to: null,
  expires_at_from: null,
  expires_at_to: null,
};

// ============================================================================
// Coupon form (create + edit)
// ============================================================================

/** Numeric inputs stay strings in the form (AppInput writes strings); the service converts them. */
const optionalNumberField = (tValidation: TFunction<'validation'>, min = 0) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= min), tValidation('min_number', { min }));

export const createCouponFormSchema = (tPage: TFunction<'page'>, tValidation: TFunction<'validation'>) =>
  z
    .object({
      code: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tPage('orders.coupons.form.fields.code') })),
      name: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tPage('orders.coupons.form.fields.name') })),
      description: z.string().trim(),
      discount_type: z.enum(CouponDiscountType),
      discount_value: z.string().trim().min(1, tValidation('coupon.discount_value_positive')),
      min_order_amount: optionalNumberField(tValidation),
      max_discount_amount: optionalNumberField(tValidation),
      usage_limit: optionalNumberField(tValidation, 1),
      sort_order: optionalNumberField(tValidation),
      claim_starts_at: z.date().nullable(),
      claim_ends_at: z.date().nullable(),
      starts_at: z.date().nullable(),
      expires_at: z.date().nullable(),
      is_active: z.boolean(),
    })
    .superRefine((values, ctx) => {
      const discountValue = Number(values.discount_value);

      if (Number.isNaN(discountValue) || discountValue <= 0) {
        ctx.addIssue({ code: 'custom', path: ['discount_value'], message: tValidation('coupon.discount_value_positive') });
      } else if (values.discount_type === CouponDiscountType.PERCENTAGE && discountValue > 100) {
        ctx.addIssue({ code: 'custom', path: ['discount_value'], message: tValidation('coupon.percentage_max') });
      }

      if (values.starts_at && values.expires_at && values.expires_at.getTime() <= values.starts_at.getTime()) {
        ctx.addIssue({ code: 'custom', path: ['expires_at'], message: tValidation('end_date_after_start_date') });
      }

      if (values.claim_starts_at && values.claim_ends_at && values.claim_ends_at.getTime() <= values.claim_starts_at.getTime()) {
        ctx.addIssue({ code: 'custom', path: ['claim_ends_at'], message: tValidation('end_date_after_start_date') });
      }
    });

export type CouponFormValues = z.infer<ReturnType<typeof createCouponFormSchema>>;

const toFormNumber = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));

/** For fields the API rejects as null — they fall back to `0` rather than an empty input. */
const toRequiredFormNumber = (value: number | null | undefined) => String(value ?? 0);

export function getCouponFormDefaultValues(coupon?: Coupon): CouponFormValues {
  return {
    code: coupon?.code ?? '',
    name: coupon?.name ?? '',
    description: coupon?.description ?? '',
    discount_type: coupon?.discount_type ?? CouponDiscountType.FIXED,
    discount_value: toFormNumber(coupon?.discount_value),
    min_order_amount: toRequiredFormNumber(coupon?.min_order_amount),
    max_discount_amount: toFormNumber(coupon?.max_discount_amount),
    usage_limit: toFormNumber(coupon?.usage_limit),
    sort_order: toRequiredFormNumber(coupon?.sort_order),
    claim_starts_at: coupon?.claim_starts_at ? new Date(coupon.claim_starts_at) : null,
    claim_ends_at: coupon?.claim_ends_at ? new Date(coupon.claim_ends_at) : null,
    starts_at: coupon?.starts_at ? new Date(coupon.starts_at) : null,
    expires_at: coupon?.expires_at ? new Date(coupon.expires_at) : null,
    is_active: coupon?.is_active ?? true,
  };
}

// ============================================================================
// Issue form
// ============================================================================

export const createCouponIssueFormSchema = (tValidation: TFunction<'validation'>) =>
  z
    .object({
      target_type: z.enum(CouponIssueTargetType),
      user_ids: z.array(z.string()),
    })
    .superRefine((values, ctx) => {
      if (values.target_type === CouponIssueTargetType.SPECIFIC_USERS && values.user_ids.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['user_ids'], message: tValidation('coupon.issue_target_required') });
      }
    });

export type CouponIssueFormValues = z.infer<ReturnType<typeof createCouponIssueFormSchema>>;

export function getCouponIssueFormDefaultValues(): CouponIssueFormValues {
  return {
    target_type: CouponIssueTargetType.SPECIFIC_USERS,
    user_ids: [],
  };
}
