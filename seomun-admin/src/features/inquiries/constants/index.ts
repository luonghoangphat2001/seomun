import type { AppSelectOption } from '@/components/shared/app-select';

import {
  AnswerChannel,
  AuditLogAction,
  AuditLogField,
  DeliveryStatus,
  InquiryStatus,
  InquiryType,
  RelatedInquiryType,
  TimelineEventType,
} from '../enums';

export const ACCEPTED = '.pdf,.jpeg,.png,.jpg,.webp,.doc,.docx,.txt';
export const MAX_SIZE = 10 * 1024 * 1024;

const INQUIRY_TYPE_LABEL_KEYS = {
  [InquiryType.PRODUCT]: 'page.inquiries.enum.inquiry_type.product',
  [InquiryType.QUOTE]: 'page.inquiries.enum.inquiry_type.quote',
  [InquiryType.SHIPPING]: 'page.inquiries.enum.inquiry_type.shipping',
  [InquiryType.PAYMENT]: 'page.inquiries.enum.inquiry_type.payment',
  [InquiryType.REWORK]: 'page.inquiries.enum.inquiry_type.rework',
  [InquiryType.REFUND]: 'page.inquiries.enum.inquiry_type.refund',
} satisfies Record<InquiryType, string>;

const STATUS_LABEL_KEYS = {
  [InquiryStatus.PENDING]: 'page.inquiries.enum.status.pending',
  [InquiryStatus.RESPONDED]: 'page.inquiries.enum.status.responded',
} satisfies Record<InquiryStatus, string>;

const ANSWER_CHANNEL_LABEL_KEYS = {
  [AnswerChannel.EMAIL]: 'page.inquiries.enum.answer_channel.EMAIL',
  [AnswerChannel.KAKAO]: 'page.inquiries.enum.answer_channel.KAKAO',
} satisfies Record<AnswerChannel, string>;

const DELIVERY_STATUS_LABEL_KEYS = {
  [DeliveryStatus.SENT]: 'page.inquiries.enum.delivery_status.SENT',
  [DeliveryStatus.FAILED]: 'page.inquiries.enum.delivery_status.FAILED',
  [DeliveryStatus.PENDING]: 'page.inquiries.enum.delivery_status.PENDING',
} satisfies Record<DeliveryStatus, string>;

const RELATED_INQUIRY_TYPE_LABEL_KEYS = {
  [RelatedInquiryType.SAME_CUSTOMER]: 'page.inquiries.enum.related_inquiry_type.SAME_CUSTOMER',
  [RelatedInquiryType.SAME_ORDER]: 'page.inquiries.enum.related_inquiry_type.SAME_ORDER',
  [RelatedInquiryType.SAME_DESIGN_DRAFT]: 'page.inquiries.enum.related_inquiry_type.SAME_DESIGN_DRAFT',
} satisfies Record<RelatedInquiryType, string>;

const TIMELINE_EVENT_LABEL_KEYS = {
  [TimelineEventType.CREATED]: 'page.inquiries.enum.timeline_event_type.created',
  [TimelineEventType.COMMENT]: 'page.inquiries.enum.timeline_event_type.comment',
  [TimelineEventType.ADMIN_COMMENT]: 'page.inquiries.enum.timeline_event_type.admin_comment',
  [TimelineEventType.ANSWERED]: 'page.inquiries.enum.timeline_event_type.answered',
} satisfies Record<TimelineEventType, string>;

const AUDIT_LOG_ACTION_LABEL_KEYS = {
  [AuditLogAction.CREATED]: 'page.inquiries.enum.audit_action.created',
  [AuditLogAction.UPDATED]: 'page.inquiries.enum.audit_action.updated',
  [AuditLogAction.DELETED]: 'page.inquiries.enum.audit_action.deleted',
} satisfies Record<AuditLogAction, string>;

const AUDIT_LOG_FIELD_LABEL_KEYS = {
  [AuditLogField.STATUS]: 'page.inquiries.enum.audit_field.status',
  [AuditLogField.TITLE]: 'page.inquiries.enum.audit_field.title',
  [AuditLogField.CONTACT]: 'page.inquiries.enum.audit_field.contact',
  [AuditLogField.CONTENT]: 'page.inquiries.enum.audit_field.content',
  [AuditLogField.REPLIED_BY]: 'page.inquiries.enum.audit_field.replied_by',
  [AuditLogField.ORDER_NUMBER]: 'page.inquiries.enum.audit_field.order_number',
  [AuditLogField.REPLY_CONTENT]: 'page.inquiries.enum.audit_field.reply_content',
  [AuditLogField.IS_EDITED_REPLY]: 'page.inquiries.enum.audit_field.is_edited_reply',
  [AuditLogField.REPLY_CONTACT_PHONE]: 'page.inquiries.enum.audit_field.reply_contact_phone',
} satisfies Record<AuditLogField, string>;

export const STATUS_STYLES = {
  [InquiryStatus.PENDING]: 'bg-blue-100 text-blue-800 border-blue-200',
  [InquiryStatus.RESPONDED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
} satisfies Record<InquiryStatus, string>;

export const INQUIRY_TYPE_STYLES = {
  [InquiryType.PRODUCT]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  [InquiryType.QUOTE]: 'bg-purple-100 text-purple-800 border-purple-200',
  [InquiryType.SHIPPING]: 'bg-orange-100 text-orange-800 border-orange-200',
  [InquiryType.PAYMENT]: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  [InquiryType.REWORK]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [InquiryType.REFUND]: 'bg-rose-100 text-rose-800 border-rose-200',
} satisfies Record<InquiryType, string>;

export function getInquiryTypeLabel(t: (key: string, options?: Record<string, unknown>) => string, value: InquiryType) {
  return t(INQUIRY_TYPE_LABEL_KEYS[value]);
}

export function getInquiryStatusLabel(t: (key: string, options?: Record<string, unknown>) => string, value: InquiryStatus) {
  return t(STATUS_LABEL_KEYS[value]);
}

export function getAnswerChannelLabel(t: (key: string, options?: Record<string, unknown>) => string, value: AnswerChannel) {
  return t(ANSWER_CHANNEL_LABEL_KEYS[value]);
}

export function getDeliveryStatusLabel(t: (key: string, options?: Record<string, unknown>) => string, value: DeliveryStatus) {
  return t(DELIVERY_STATUS_LABEL_KEYS[value]);
}

export function getRelatedInquiryTypeLabel(t: (key: string, options?: Record<string, unknown>) => string, value: RelatedInquiryType) {
  return t(RELATED_INQUIRY_TYPE_LABEL_KEYS[value]);
}

export function getTimelineEventTypeLabel(t: (key: string, options?: Record<string, unknown>) => string, value: TimelineEventType) {
  return t(TIMELINE_EVENT_LABEL_KEYS[value]);
}

export function getAuditLogActionLabel(t: (key: string, options?: Record<string, unknown>) => string, value: AuditLogAction) {
  return t(AUDIT_LOG_ACTION_LABEL_KEYS[value]);
}

export function getAuditLogFieldLabel(t: (key: string, options?: Record<string, unknown>) => string, value: AuditLogField) {
  return t(AUDIT_LOG_FIELD_LABEL_KEYS[value]);
}

export function getStatusOptions(t: (key: string, options?: Record<string, unknown>) => string): AppSelectOption<InquiryStatus>[] {
  return Object.values(InquiryStatus).map((value) => ({ value, label: getInquiryStatusLabel(t, value) }));
}

const STATUS_ORDER: Record<InquiryStatus, number> = {
  [InquiryStatus.PENDING]: 0,
  [InquiryStatus.RESPONDED]: 1,
};

export function getStatusTransitionOptions(
  t: (key: string, options?: Record<string, unknown>) => string,
  currentStatus?: InquiryStatus,
): AppSelectOption<InquiryStatus>[] {
  const currentOrder = currentStatus ? STATUS_ORDER[currentStatus] : -1;
  return Object.values(InquiryStatus).map((value) => ({
    value,
    label: getInquiryStatusLabel(t, value),
    disabled: STATUS_ORDER[value] < currentOrder,
  }));
}
