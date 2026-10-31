export enum InquiryType {
  PRODUCT = 'product',
  QUOTE = 'quote',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REWORK = 'rework',
  REFUND = 'refund',
}

export enum InquiryStatus {
  PENDING = 'pending',
  RESPONDED = 'responded',
}

export enum AnswerChannel {
  EMAIL = 'EMAIL',
  KAKAO = 'KAKAO',
}

export enum DeliveryStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum RelatedInquiryType {
  SAME_CUSTOMER = 'same_customer',
  SAME_ORDER = 'same_order',
  SAME_DESIGN_DRAFT = 'same_design_draft',
}

export enum TimelineEventType {
  CREATED = 'created',
  COMMENT = 'comment',
  ADMIN_COMMENT = 'admin_comment',
  ANSWERED = 'answered',
}

export enum AuditLogAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

export enum InquiryExportType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

export enum AuditLogField {
  STATUS = 'status',
  TITLE = 'title',
  CONTACT = 'contact',
  CONTENT = 'content',
  REPLIED_BY = 'replied_by',
  ORDER_NUMBER = 'order_number',
  REPLY_CONTENT = 'reply_content',
  IS_EDITED_REPLY = 'is_edited_reply',
  REPLY_CONTACT_PHONE = 'reply_contact_phone',
}
