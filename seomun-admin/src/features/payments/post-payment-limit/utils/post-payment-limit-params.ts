import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import type { UserLimitListREQ } from '../api/post-payment-limit.request';
import type { PostPaymentLimitListSearch } from '../schemas';

export type NormalizedUserLimitListParams = UserLimitListREQ & Required<Pick<UserLimitListREQ, 'page' | 'per_page'>>;

export function buildUserLimitListParams(search: PostPaymentLimitListSearch): NormalizedUserLimitListParams {
  return {
    name: search.name,
    status: search.status,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
