import type { BaseResponse, PaginationMeta } from '@/types/api';

import type { PointChangeLog, PointHistoryItem, PointPolicySection, PointSetting, PointTargetMember } from '../../types/customer.type';

export type PointHistoryRESP = BaseResponse<{
  items: PointHistoryItem[];
  pagination: PaginationMeta;
}>;

export type PointHistoryRawRESP = BaseResponse<{
  transactions?: PointHistoryRawTransaction[];
  point_transactions?: PointHistoryRawTransaction[];
  pagination?: PointHistoryRawPagination;
}> & {
  pagination?: PointHistoryRawPagination;
};

export type PointHistoryRawPagination = {
  current_page: number;
  per_page: number;
  total?: number;
  last_page?: number;
  total_item?: number;
  total_page?: number;
};

export type PointHistoryRawTransaction = {
  id: number;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  type: 'earn' | 'deduct' | 'use' | string;
  type_label: string;
  category: string;
  category_label: string;
  amount: number;
  balance_after: number;
  remaining_amount?: number;
  description: string | null;
  reference_id: string | null;
  order_number: string | null;
  order_id?: number | null;
  expired_at?: string | null;
  user?: {
    id: number;
    username: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  created_by?: {
    id: number;
    name: string;
  } | null;
  created_by_admin?: {
    id: number;
    name: string;
    username: string;
  } | null;
  created_at: string;
};

export type PointSettingsRESP = BaseResponse<{
  settings: PointSetting;
  policy_sections: PointPolicySection[];
}>;

export type PointSettingsRawRESP = BaseResponse<PointSettingsRawData>;

export type PointSettingsRawData = {
  id?: number;
  signup_reward: number;
  monthly_reward_limit: number;
  invite_reward_inviter: number;
  invite_reward_invited: number;
  min_order_amount_to_use: number;
  max_point_usage_percent: number;
  max_point_usage_amount: number;
  enable_payment_restriction: boolean;
  enable_point_restriction: boolean;
};

export type PointChangeLogsRESP = BaseResponse<{
  logs: PointChangeLog[];
  pagination: PaginationMeta;
}>;

export type PointTargetMembersRESP = BaseResponse<{
  members: PointTargetMember[];
}>;

export type PointManualAdjustmentRESP = BaseResponse<{
  transaction_id: number;
  user_id: number;
  amount: number;
  balance_after: number;
}>;

export type PointMembershipOverrideRESP = BaseResponse<{
  membership_level: string;
}>;
