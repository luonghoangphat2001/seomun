import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { CouponListREQ } from '../api/coupon.request';
import { CouponActiveFilter } from '../enums';
import type { CouponListSearch } from '../schemas';

export type NormalizedCouponListParams = CouponListREQ & Required<Pick<CouponListREQ, 'page' | 'per_page'>>;

export function normalizeCouponQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildCouponListParams(search: CouponListSearch): NormalizedCouponListParams {
  return {
    search_term: normalizeCouponQuery(search.search_term),
    discount_type: search.discount_type,
    is_active: search.is_active ? search.is_active === CouponActiveFilter.ACTIVE : undefined,
    validity_status: search.validity_status,
    starts_at_from: search.starts_at_from,
    starts_at_to: search.starts_at_to,
    expires_at_from: search.expires_at_from,
    expires_at_to: search.expires_at_to,
    sort_by: search.sort_by,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.DESC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
