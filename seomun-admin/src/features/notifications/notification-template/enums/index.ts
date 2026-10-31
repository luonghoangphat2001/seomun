export enum NotificationTemplateSortField {
  NAME = 'name',
  TEMPLATE_NUMBER = 'template_number',
  CREATED_AT = 'created_at',
}

export enum NotificationUsageStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export enum NotificationTriggerType {
  ORDER_PLACED = 'order_placed',
  ORDER_STATUS_CHANGED = 'order_status_changed',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_PROCESSED = 'refund_processed',
  DESIGN_CONFIRMATION_REQUEST = 'design_confirmation_request',
  DESIGN_REJECTED = 'design_rejected',
  SHIPMENT_STARTED = 'shipment_started',
  MEMBERSHIP_LEVEL_UPGRADE = 'membership_level_upgrade',
  INQUIRY_ANSWERED = 'inquiry_answered',
  CUSTOMER_APPROVED = 'customer_approved',
}
