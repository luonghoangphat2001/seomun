import type { PaginationRequest } from '@/types/api';

export interface MembershipCustomerListREQ extends PaginationRequest {
  search_term?: string;
}

export interface UpdateMembershipLevelREQ {
  level_id: number;
  name: string;
  condition_amount: number;
  accrual_rate: number;
  free_shipping: boolean;
  is_active: boolean;
}

export interface OverrideCustomerMembershipREQ {
  user_id: number;
  tier_id: number;
}
