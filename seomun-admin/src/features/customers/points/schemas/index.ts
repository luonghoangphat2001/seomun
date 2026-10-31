import { z } from 'zod';

import { MembershipLevelCode, PointActionType, PointDetailCategory, PointTransactionType } from '../../enums';

export const pointManagementFilterFormSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).default(10),
  category: z.nativeEnum(PointTransactionType).optional().or(z.literal('')).default(''),
  detail_category: z.nativeEnum(PointDetailCategory).optional().or(z.literal('')).default(''),
  order_number: z.string().optional().default(''),
  name: z.string().optional().default(''),
  contact: z.string().optional().default(''),
  email: z.string().optional().default(''),
  issue_date_preset: z.enum(['today', 'yesterday', '1w', '1m', '3m', '6m', 'custom']).optional().or(z.literal('')).default(''),
  date_from: z.string().optional().default(''),
  date_to: z.string().optional().default(''),
});

export type PointManagementFilterFormValues = z.infer<typeof pointManagementFilterFormSchema>;

export const pointManualAdjustmentFormSchema = z.object({
  user_id: z.string().trim().min(1, 'Target customer is required.'),
  action: z.nativeEnum(PointActionType),
  amount: z.coerce.number().min(1, 'Amount must be greater than zero.'),
  reason: z.string().trim().min(1, 'Reason is required.'),
});

export type PointManualAdjustmentFormInput = z.input<typeof pointManualAdjustmentFormSchema>;
export type PointManualAdjustmentFormValues = z.infer<typeof pointManualAdjustmentFormSchema>;

export const pointMembershipOverrideFormSchema = z.object({
  customer_id: z.string().trim().min(1, 'Customer is required.'),
  membership_level: z.nativeEnum(MembershipLevelCode),
  reason: z.string().trim().min(1, 'Reason is required.'),
});

export type PointMembershipOverrideFormValues = z.infer<typeof pointMembershipOverrideFormSchema>;

export const pointSettingsFormSchema = z.object({
  new_signup_reward: z.coerce.number().min(0),
  monthly_reward_limit: z.coerce.number().min(0),
  inviter_reward: z.coerce.number().min(0),
  invited_reward: z.coerce.number().min(0),
  payment_usage_restriction_enabled: z.boolean(),
  minimum_order_amount: z.coerce.number().min(0),
  invitation_point_purchase_limit_enabled: z.boolean(),
  invitation_point_purchase_points: z.coerce.number().min(0),
  invitation_point_purchase_percent: z.coerce.number().min(0),
});

export type PointSettingsFormInput = z.input<typeof pointSettingsFormSchema>;
export type PointSettingsFormValues = z.infer<typeof pointSettingsFormSchema>;

export const customerPointsSearchSchema = z.object({
  tab: z.enum(['usage-history', 'point-setting']).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  category: z.nativeEnum(PointTransactionType).optional().or(z.literal('')).optional().catch(undefined),
  detail_category: z.nativeEnum(PointDetailCategory).optional().or(z.literal('')).optional().catch(undefined),
  order_number: z.string().optional().catch(undefined),
  name: z.string().optional().catch(undefined),
  contact: z.string().optional().catch(undefined),
  email: z.string().optional().catch(undefined),
  issue_date_preset: z.enum(['today', 'yesterday', '1w', '1m', '3m', '6m', 'custom']).optional().or(z.literal('')).optional().catch(undefined),
  date_from: z.string().optional().catch(undefined),
  date_to: z.string().optional().catch(undefined),
});

export type CustomerPointsSearch = z.infer<typeof customerPointsSearchSchema>;
