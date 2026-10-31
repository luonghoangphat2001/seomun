import { PointActionType, PointTransactionType } from '../../enums';
import type { PointHistoryItem, PointSetting } from '../../types/customer.type';
import { getCustomerPolicySections } from '../../utils/policy-notes';
import type {
  PointManagementFilterFormValues,
  PointManualAdjustmentFormValues,
  PointMembershipOverrideFormValues,
  PointSettingsFormValues,
} from '../schemas';
import {
  applyPointManualAdjustmentAPI,
  getPointChangeLogsAPI,
  getPointHistoryAPI,
  getPointSettingsAPI,
  getPointTargetMembersAPI,
  overridePointMembershipAPI,
  updatePointSettingsAPI,
} from './customer-points.api';
import type { PointHistoryREQ, PointManualAdjustmentREQ, PointMembershipOverrideREQ, PointSettingsREQ } from './customer-points.request';
import type {
  PointChangeLogsRESP,
  PointHistoryRawRESP,
  PointHistoryRawTransaction,
  PointHistoryRESP,
  PointManualAdjustmentRESP,
  PointMembershipOverrideRESP,
  PointSettingsRawRESP,
  PointSettingsRESP,
  PointTargetMembersRESP,
} from './customer-points.response';

export function mapPointSettingsToFormValues(settings?: PointSetting): PointSettingsFormValues {
  return {
    new_signup_reward: settings?.newSignupReward ?? 0,
    monthly_reward_limit: settings?.monthlyRewardLimit ?? 0,
    inviter_reward: settings?.inviterReward ?? 0,
    invited_reward: settings?.invitedReward ?? 0,
    payment_usage_restriction_enabled: settings?.paymentUsageRestrictionEnabled ?? false,
    minimum_order_amount: settings?.minimumOrderAmount ?? 0,
    invitation_point_purchase_limit_enabled: settings?.invitationPointPurchaseLimitEnabled ?? false,
    invitation_point_purchase_points: settings?.invitationPointPurchasePoints ?? 0,
    invitation_point_purchase_percent: settings?.invitationPointPurchasePercent ?? 0,
  };
}

export function mapPointSettingsFormToRequest(values: PointSettingsFormValues): PointSettingsREQ {
  return {
    signup_reward: values.new_signup_reward,
    monthly_reward_limit: values.monthly_reward_limit,
    invite_reward_inviter: values.inviter_reward,
    invite_reward_invited: values.invited_reward,
    min_order_amount_to_use: values.minimum_order_amount,
    max_point_usage_percent: values.invitation_point_purchase_percent,
    max_point_usage_amount: values.invitation_point_purchase_points,
    enable_payment_restriction: values.payment_usage_restriction_enabled,
    enable_point_restriction: values.invitation_point_purchase_limit_enabled,
  };
}

export function mapPointFilterFormToRequest(values: PointManagementFilterFormValues): PointHistoryREQ {
  return {
    page: values.page,
    per_page: values.per_page,
    type: values.category || undefined,
    order_number: values.order_number || undefined,
    start_date: values.date_from || undefined,
    end_date: values.date_to || undefined,
    name: values.name || undefined,
    contact: values.contact || undefined,
    email: values.email || undefined,
  };
}

export function mapPointManualAdjustmentFormToRequest(values: PointManualAdjustmentFormValues): PointManualAdjustmentREQ {
  return {
    user_id: Number(values.user_id),
    amount: values.amount,
    type: values.action === PointActionType.DEDUCT ? 'deduct' : 'grant',
    description: values.reason,
  };
}

export function mapPointMembershipOverrideFormToRequest(values: PointMembershipOverrideFormValues): PointMembershipOverrideREQ {
  return {
    customer_id: Number(values.customer_id),
    membership_level: values.membership_level,
    reason: values.reason,
  };
}

export async function getPointHistoryService(request: PointHistoryREQ): Promise<PointHistoryRESP> {
  return mapPointHistoryResponse(await getPointHistoryAPI(request));
}

export async function getPointSettingsService(): Promise<PointSettingsRESP> {
  return mapPointSettingsResponse(await getPointSettingsAPI());
}

export async function updatePointSettingsService(request: PointSettingsREQ): Promise<PointSettingsRESP> {
  return mapPointSettingsResponse(await updatePointSettingsAPI(request));
}

export async function getPointChangeLogsService(): Promise<PointChangeLogsRESP> {
  return getPointChangeLogsAPI();
}

export async function getPointTargetMembersService(): Promise<PointTargetMembersRESP> {
  return getPointTargetMembersAPI();
}

export async function applyPointManualAdjustmentService(request: PointManualAdjustmentREQ): Promise<PointManualAdjustmentRESP> {
  return applyPointManualAdjustmentAPI(request);
}

export async function overridePointMembershipService(request: PointMembershipOverrideREQ): Promise<PointMembershipOverrideRESP> {
  return overridePointMembershipAPI(request);
}

function mapPointSettingsResponse(response: PointSettingsRawRESP): PointSettingsRESP {
  const raw = response.data;

  return {
    success: response.success,
    message: response.message,
    data: {
      settings: {
        newSignupReward: raw.signup_reward,
        monthlyRewardLimit: raw.monthly_reward_limit,
        inviterReward: raw.invite_reward_inviter,
        invitedReward: raw.invite_reward_invited,
        paymentUsageRestrictionEnabled: raw.enable_payment_restriction,
        minimumOrderAmount: raw.min_order_amount_to_use,
        invitationPointPurchaseLimitEnabled: raw.enable_point_restriction,
        invitationPointPurchasePoints: raw.max_point_usage_amount,
        invitationPointPurchasePercent: raw.max_point_usage_percent,
      },
      policy_sections: getCustomerPolicySections(),
    },
  };
}

function mapPointHistoryResponse(response: PointHistoryRawRESP): PointHistoryRESP {
  const transactions = response.data.transactions ?? response.data.point_transactions ?? [];
  const pagination = response.data.pagination ?? response.pagination;

  return {
    success: response.success,
    message: response.message,
    data: {
      items: transactions.map(mapPointHistoryTransaction),
      pagination: {
        current_page: pagination?.current_page ?? 1,
        per_page: pagination?.per_page ?? transactions.length,
        total_page: pagination?.total_page ?? pagination?.last_page ?? 1,
        total_item: pagination?.total_item ?? pagination?.total ?? transactions.length,
      },
    },
  };
}

function mapPointHistoryTransaction(transaction: PointHistoryRawTransaction): PointHistoryItem {
  const userId = transaction.user_id ?? transaction.user?.id ?? 0;
  const userName = transaction.user_name ?? transaction.user?.name ?? transaction.user?.username ?? '-';
  const userEmail = transaction.user_email ?? transaction.user?.email ?? '';

  return {
    id: transaction.id,
    customerId: userId,
    memberId: userId,
    memberName: userName,
    memberLoginId: transaction.user?.username ?? String(userId),
    contact: transaction.user?.phone ?? null,
    email: userEmail,
    category: {
      value: normalizePointTransactionType(transaction.type),
      label: transaction.type_label,
    },
    detailCategory: {
      value: transaction.category,
      label: transaction.category_label,
    },
    orderNumber: transaction.order_number,
    amount: transaction.amount,
    issuedAt: transaction.created_at,
    remarks: transaction.description,
  };
}

function normalizePointTransactionType(type: string): PointTransactionType {
  if (type === PointTransactionType.USE || type === 'deduct') return PointTransactionType.USE;
  if (type === PointTransactionType.EXPIRE) return PointTransactionType.EXPIRE;
  if (type === PointTransactionType.REFUND) return PointTransactionType.REFUND;
  return PointTransactionType.EARN;
}
