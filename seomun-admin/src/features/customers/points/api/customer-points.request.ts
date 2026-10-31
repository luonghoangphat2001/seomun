import type { PaginationRequest } from '@/types/api';

import type { MembershipLevelCode, PointTransactionType } from '../../enums';

export interface PointHistoryREQ extends PaginationRequest {
  type?: PointTransactionType;
  order_number?: string;
  start_date?: string;
  end_date?: string;
  name?: string;
  contact?: string;
  email?: string;
}

export interface PointSettingsREQ {
  signup_reward: number;
  monthly_reward_limit: number;
  invite_reward_inviter: number;
  invite_reward_invited: number;
  min_order_amount_to_use: number;
  max_point_usage_percent: number;
  max_point_usage_amount: number;
  enable_payment_restriction: boolean;
  enable_point_restriction: boolean;
}

export interface PointManualAdjustmentREQ {
  user_id: number;
  amount: number;
  type: 'grant' | 'deduct';
  description: string;
}

export interface PointMembershipOverrideREQ {
  customer_id: number;
  membership_level: MembershipLevelCode;
  reason: string;
}
