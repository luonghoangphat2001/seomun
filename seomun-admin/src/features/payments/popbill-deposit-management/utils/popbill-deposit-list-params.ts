import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import type { BankDepositListREQ } from '../api';
import type { PopbillDepositManagementSearch } from '../schemas';

export type NormalizedPopbillDepositListParams = BankDepositListREQ & Required<Pick<BankDepositListREQ, 'page' | 'per_page'>>;

export function buildPopbillDepositListParams(search: PopbillDepositManagementSearch): NormalizedPopbillDepositListParams {
  return {
    ...search,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
