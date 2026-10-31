import type { TFunction } from 'i18next';

import {
  CustomerApprovalRequestType,
  type CustomerApprovalStatus,
  CustomerStatus,
  MembershipLevelCode,
  MemberType,
  PointDetailCategory,
  PointTransactionType,
} from '../enums';

export function getCustomerStatusLabel(t: TFunction, status: CustomerStatus | string) {
  return translate(t, `page.customers.shared.status.${normalizeCustomerStatus(status)}`);
}

export function getMemberTypeLabel(t: TFunction, memberType?: MemberType | string | null) {
  if (!memberType) return '-';
  const normalized = memberType.toLowerCase();
  if (normalized === MemberType.BUSINESS || normalized === MemberType.INDIVIDUAL) {
    return translate(t, `page.customers.shared.member_type.${normalized}`);
  }
  return memberType;
}

/** The API sends authority labels untranslated (`super_admin`), so translate by value and keep its label as the fallback. */
export function getCustomerAuthorityLabel(t: TFunction, authority?: { value: string | null; label?: string } | null) {
  if (!authority?.value) return authority?.label ?? '-';
  return String(
    t(`page.customers.shared.authority.${authority.value.toLowerCase()}` as never, { defaultValue: authority.label ?? authority.value } as never),
  );
}

export function getCustomerApprovalStatusLabel(t: TFunction, status: CustomerApprovalStatus | string) {
  return translate(t, `page.customers.shared.approval_status.${normalizeCustomerApprovalStatus(status)}`);
}

export function getCustomerApprovalRequestTypeLabel(t: TFunction, type: CustomerApprovalRequestType) {
  return translate(t, `page.customers.approvals.request_types.${CUSTOMER_APPROVAL_REQUEST_TYPE_KEY[type]}`);
}

export function getMembershipLevelLabel(t: TFunction, level: MembershipLevelCode) {
  return translate(t, `page.customers.membership_levels.levels.${MEMBERSHIP_LEVEL_KEY[level]}`);
}

export function getPointHistoryCategoryLabel(t: TFunction, category: PointTransactionType) {
  return translate(t, `page.customers.points.categories.${POINT_TRANSACTION_TYPE_KEY[category]}`);
}

export function getPointDetailCategoryLabel(t: TFunction, category: PointDetailCategory | string) {
  switch (category) {
    case PointDetailCategory.PAYMENT:
      return translate(t, 'page.customers.points.detail_categories.payment');
    case PointDetailCategory.DEDUCTION:
      return translate(t, 'page.customers.points.detail_categories.deduction');
    case PointDetailCategory.SIGNUP_REWARD:
      return translate(t, 'page.customers.points.mock_labels.detail_categories.signup_reward');
    case PointDetailCategory.INVITE_REWARD:
      return translate(t, 'page.customers.points.mock_labels.detail_categories.invite_reward');
    case PointDetailCategory.MANUAL_GRANT:
      return translate(t, 'page.customers.points.mock_labels.detail_categories.manual_grant');
    case PointDetailCategory.MANUAL_DEDUCTION:
      return translate(t, 'page.customers.points.mock_labels.detail_categories.manual_deduction');
    case PointDetailCategory.RESTORED_POINTS:
      return translate(t, 'page.customers.points.mock_labels.detail_categories.restored_points');
    default:
      return category;
  }
}

export function translateCustomerApprovalReason(t: TFunction, reason: string | null) {
  if (!reason) return '-';

  const map: Record<string, string> = {
    'Waiting for new account approval.': 'page.customers.approvals.mock_reasons.awaiting_new_account_approval',
    'Customer requested basic information update.': 'page.customers.approvals.mock_reasons.basic_information_update',
    'Customer requested permission scope adjustment.': 'page.customers.approvals.mock_reasons.permission_scope_adjustment',
    'Approved after document verification.': 'page.customers.approvals.mock_reasons.approved_after_document_verification',
    'Reviewed and processed.': 'page.customers.approvals.mock_reasons.reviewed_and_processed',
    'New admin-side customer registration awaiting approval.': 'page.customers.approvals.mock_reasons.admin_side_registration_awaiting_approval',
  };

  return map[reason] ? translate(t, map[reason]) : reason;
}

export function translateCustomerAuditAction(t: TFunction, action: string) {
  const map: Record<string, string> = {
    'Customer registered': 'page.customers.detail.audit_log.mock_actions.customer_registered',
    'Basic information updated': 'page.customers.detail.audit_log.mock_actions.basic_information_updated',
  };

  return map[action] ? translate(t, map[action]) : action;
}

export function translateCustomerAuditChange(t: TFunction, change: string) {
  const map: Record<string, string> = {
    'Initial customer profile created': 'page.customers.detail.audit_log.mock_changes.initial_customer_profile_created',
    'No visible field changes recorded.': 'page.customers.detail.audit_log.mock_changes.no_visible_field_changes',
    'Customer profile created from admin registration flow.':
      'page.customers.detail.audit_log.mock_changes.customer_profile_created_from_admin_registration',
  };

  if (map[change]) return translate(t, map[change]);

  const statusChange = change.match(/^Status:\s(.+?)\s->\s(.+)$/);
  if (statusChange) {
    const [, fromStatus, toStatus] = statusChange;
    return String(
      t('page.customers.detail.audit_log.mock_changes.status_change', {
        from: translateStatusText(t, fromStatus),
        to: translateStatusText(t, toStatus),
      }),
    );
  }

  return change;
}

export function translateCustomerAuditReason(t: TFunction, reason: string | null) {
  if (!reason) return null;

  const map: Record<string, string> = {
    'Master account automatically created.': 'page.customers.detail.audit_log.mock_reasons.master_account_automatically_created',
  };

  return map[reason] ? translate(t, map[reason]) : reason;
}

export function translateCustomerPaymentMethod(t: TFunction, value: string) {
  const map: Record<string, string> = {
    'Corporate card': 'page.customers.detail.payment_info.mock_values.payment_methods.corporate_card',
    'Bank transfer': 'page.customers.detail.payment_info.mock_values.payment_methods.bank_transfer',
  };

  return map[value] ? translate(t, map[value]) : value;
}

export function translateCustomerSettlementCycle(t: TFunction, value: string) {
  const map: Record<string, string> = {
    Monthly: 'page.customers.detail.payment_info.mock_values.settlement_cycles.monthly',
    'Bi-weekly': 'page.customers.detail.payment_info.mock_values.settlement_cycles.bi_weekly',
  };

  return map[value] ? translate(t, map[value]) : value;
}

export function translateCustomerBankName(t: TFunction, value: string) {
  const map: Record<string, string> = {
    'Kookmin Bank': 'page.customers.detail.payment_info.mock_values.bank_names.kookmin_bank',
    'Shinhan Bank': 'page.customers.detail.payment_info.mock_values.bank_names.shinhan_bank',
    'Woori Bank': 'page.customers.detail.payment_info.mock_values.bank_names.woori_bank',
  };

  return map[value] ? translate(t, map[value]) : value;
}

export function translateCustomerPaymentMemo(t: TFunction, value: string | null) {
  if (!value) return '-';

  const map: Record<string, string> = {
    'Priority billing customer': 'page.customers.detail.payment_info.mock_values.memos.priority_billing_customer',
    'Master account auto-created on registration.': 'page.customers.detail.payment_info.mock_values.memos.master_account_auto_created',
  };

  return map[value] ? translate(t, map[value]) : value;
}

export function translateCustomerAffiliation(t: TFunction, value: string) {
  const map: Record<string, string> = {
    'Seoul HQ': 'page.customers.detail.bookkeeping.mock_values.affiliations.seoul_hq',
  };

  return map[value] ? translate(t, map[value]) : value;
}

export function translateCustomerBookkeepingDetail(t: TFunction, value: string) {
  const map: Record<string, string> = {
    'Invoice settlement': 'page.customers.detail.bookkeeping.mock_values.transaction_details.invoice_settlement',
    'Point deduction adjustment': 'page.customers.detail.bookkeeping.mock_values.transaction_details.point_deduction_adjustment',
  };

  return map[value] ? translate(t, map[value]) : value;
}

export function translateCustomerBookkeepingNote(t: TFunction, value: string | null) {
  if (!value) return '-';

  const map: Record<string, string> = {
    'Checked by finance team': 'page.customers.detail.bookkeeping.mock_values.notes.checked_by_finance_team',
  };

  return map[value] ? translate(t, map[value]) : value;
}

export function translatePointPolicySectionTitle(t: TFunction, sectionId: string, fallback: string) {
  const key = `page.customers.points.policy.sections.${sectionId}.title`;
  return String(t(key as never, { defaultValue: fallback } as never));
}

export function translatePointPolicyItem(t: TFunction, sectionId: string, itemId: string, fallback: string) {
  const key = `page.customers.points.policy.sections.${sectionId}.items.${itemId}`;
  return String(t(key as never, { defaultValue: fallback } as never));
}

export function translatePointChangeAction(t: TFunction, action: string) {
  const map: Record<string, string> = {
    'Manual point grant': 'page.customers.points.change_log.mock_actions.manual_point_grant',
    'Manual point deduction': 'page.customers.points.change_log.mock_actions.manual_point_deduction',
    'Manual membership override': 'page.customers.points.change_log.mock_actions.manual_membership_override',
  };

  return map[action] ? translate(t, map[action]) : action;
}

export function translatePointChangeReason(t: TFunction, reason: string) {
  const map: Record<string, string> = {
    'Welcome campaign': 'page.customers.points.change_log.mock_reasons.welcome_campaign',
    'Quarter-end strategic upgrade.': 'page.customers.points.change_log.mock_reasons.quarter_end_strategic_upgrade',
  };

  return map[reason] ? translate(t, map[reason]) : reason;
}

export function translatePointRemark(t: TFunction, remark: string | null) {
  if (!remark) return '-';

  const map: Record<string, string> = {
    'Accumulated after completed shipment via virtual account payment.':
      'page.customers.points.mock_labels.remarks.accumulated_after_completed_shipment',
    'New sign-up reward applied.': 'page.customers.points.mock_labels.remarks.new_signup_reward_applied',
    'Admin promotional grant.': 'page.customers.points.mock_labels.remarks.admin_promotional_grant',
    'Points used during payment.': 'page.customers.points.mock_labels.remarks.points_used_during_payment',
    'Manual deduction after policy review.': 'page.customers.points.mock_labels.remarks.manual_deduction_after_policy_review',
    'Used points restored after refund.': 'page.customers.points.mock_labels.remarks.used_points_restored_after_refund',
  };

  return map[remark] ? translate(t, map[remark]) : remark;
}

function translateStatusText(t: TFunction, status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'active' || normalized === CustomerStatus.ACTIVE) {
    return getCustomerStatusLabel(t, CustomerStatus.ACTIVE);
  }

  if (normalized === 'inactive' || normalized === CustomerStatus.INACTIVE) {
    return getCustomerStatusLabel(t, CustomerStatus.INACTIVE);
  }

  if (normalized === 'withdrawn' || normalized === CustomerStatus.WITHDRAWN) {
    return getCustomerStatusLabel(t, CustomerStatus.WITHDRAWN);
  }

  return status;
}

function translate(t: TFunction, key: string) {
  return String(t(key as never));
}

function normalizeCustomerStatus(status: CustomerStatus | string) {
  const normalized = String(status).toLowerCase();
  if (normalized === 'active') return 'active';
  if (normalized === 'withdrawn') return 'withdrawn';
  return 'inactive';
}

function normalizeCustomerApprovalStatus(status: CustomerApprovalStatus | string) {
  const normalized = String(status).toLowerCase();
  if (normalized === 'accepted' || normalized === 'approved') return 'approved';
  if (normalized === 'rejected') return 'rejected';
  return 'pending';
}

const CUSTOMER_APPROVAL_REQUEST_TYPE_KEY: Record<CustomerApprovalRequestType, string> = {
  [CustomerApprovalRequestType.SIGN_UP]: 'sign_up',
  [CustomerApprovalRequestType.INFORMATION_MODIFICATION]: 'information_modification',
  [CustomerApprovalRequestType.PERMISSION_CHANGE]: 'permission_change',
};

const MEMBERSHIP_LEVEL_KEY: Record<MembershipLevelCode, string> = {
  [MembershipLevelCode.FAMILY]: 'family',
  [MembershipLevelCode.BRONZE]: 'bronze',
  [MembershipLevelCode.SILVER]: 'silver',
  [MembershipLevelCode.GOLD]: 'gold',
  [MembershipLevelCode.DIAMOND]: 'diamond',
  [MembershipLevelCode.VIP]: 'vip',
};

const POINT_TRANSACTION_TYPE_KEY: Record<PointTransactionType, string> = {
  [PointTransactionType.EARN]: 'accumulation',
  [PointTransactionType.USE]: 'use',
  [PointTransactionType.EXPIRE]: 'expire',
  [PointTransactionType.REFUND]: 'refund',
};
