import type { TFunction } from 'i18next';
import type { AppSelectOption } from '@/components/shared/app-select';

import {
  CustomerApprovalRequestType,
  CustomerApprovalStatus,
  CustomerStatus,
  MembershipLevelCode,
  PointDetailCategory,
  PointTransactionType,
} from '../enums';

export function getCustomerStatusOptions(t: TFunction): AppSelectOption<CustomerStatus>[] {
  return [
    { value: CustomerStatus.ACTIVE, label: t('page.customers.shared.status.active') },
    { value: CustomerStatus.INACTIVE, label: t('page.customers.shared.status.inactive') },
    { value: CustomerStatus.WITHDRAWN, label: t('page.customers.shared.status.withdrawn') },
  ];
}

export function getCustomerApprovalStatusOptions(t: TFunction): AppSelectOption<CustomerApprovalStatus>[] {
  return [
    { value: CustomerApprovalStatus.APPROVED, label: t('page.customers.shared.approval_status.approved') },
    { value: CustomerApprovalStatus.PENDING, label: t('page.customers.shared.approval_status.pending') },
    { value: CustomerApprovalStatus.REJECTED, label: t('page.customers.shared.approval_status.rejected') },
  ];
}

export function getCustomerApprovalRequestTypeOptions(t: TFunction): AppSelectOption<CustomerApprovalRequestType>[] {
  return [
    { value: CustomerApprovalRequestType.SIGN_UP, label: t('page.customers.approvals.request_types.sign_up') },
    { value: CustomerApprovalRequestType.INFORMATION_MODIFICATION, label: t('page.customers.approvals.request_types.information_modification') },
    { value: CustomerApprovalRequestType.PERMISSION_CHANGE, label: t('page.customers.approvals.request_types.permission_change') },
  ];
}

export function getMembershipLevelOptions(t: TFunction): AppSelectOption<MembershipLevelCode>[] {
  return [
    { value: MembershipLevelCode.FAMILY, label: t('page.customers.membership_levels.levels.family') },
    { value: MembershipLevelCode.BRONZE, label: t('page.customers.membership_levels.levels.bronze') },
    { value: MembershipLevelCode.SILVER, label: t('page.customers.membership_levels.levels.silver') },
    { value: MembershipLevelCode.GOLD, label: t('page.customers.membership_levels.levels.gold') },
    { value: MembershipLevelCode.DIAMOND, label: t('page.customers.membership_levels.levels.diamond') },
    { value: MembershipLevelCode.VIP, label: t('page.customers.membership_levels.levels.vip') },
  ];
}

export function getPointTransactionTypeOptions(t: TFunction): AppSelectOption<PointTransactionType>[] {
  return [
    { value: PointTransactionType.EARN, label: t('page.customers.points.categories.accumulation') },
    { value: PointTransactionType.USE, label: t('page.customers.points.categories.use') },
    { value: PointTransactionType.EXPIRE, label: t('page.customers.points.categories.expire') },
    { value: PointTransactionType.REFUND, label: t('page.customers.points.categories.refund') },
  ];
}

export function getPointDetailCategoryOptions(t: TFunction): AppSelectOption<PointDetailCategory>[] {
  return [
    { value: PointDetailCategory.PAYMENT, label: t('page.customers.points.detail_categories.payment') },
    { value: PointDetailCategory.DEDUCTION, label: t('page.customers.points.detail_categories.deduction') },
  ];
}

export const POINT_PERIOD_PRESET_VALUES = ['today', 'yesterday', '1w', '1m', '3m', '6m'] as const;

export function getPointPeriodPresetOptions(t: TFunction) {
  return POINT_PERIOD_PRESET_VALUES.map((value) => ({
    value,
    label: t(`page.customers.points.presets.${value}`),
  }));
}

export type PointPeriodPreset = (typeof POINT_PERIOD_PRESET_VALUES)[number];
