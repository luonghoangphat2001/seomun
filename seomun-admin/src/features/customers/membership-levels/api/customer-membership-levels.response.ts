import type { BaseResponse, PaginationMeta } from '@/types/api';

import type { CustomerMember, MembershipLevel } from '../../types/customer.type';

export type MembershipLevelListRESP = BaseResponse<{
  levels: MembershipLevel[];
}>;

export type MembershipLevelListRawRESP = BaseResponse<{
  tiers: MembershipTierRaw[];
}>;

export type MembershipLevelRawRESP = BaseResponse<MembershipTierRaw>;

export type MembershipTierRaw = {
  id: number;
  name: string;
  condition_amount: number;
  accrual_rate: number;
  free_shipping: boolean;
  sort_order: number;
  is_active: boolean;
  members_count: number;
  average_quarterly_spend: number;
};

export type MembershipCustomerListRESP = BaseResponse<{
  members: CustomerMember[];
  pagination: PaginationMeta;
}>;

export type MembershipLevelUpdateRESP = BaseResponse<{
  level: MembershipLevel;
}>;

export type CustomerMembershipOverrideRESP = BaseResponse<{
  user_id: number;
  user_name: string;
  tier_id: number;
  tier_name: string;
}>;
