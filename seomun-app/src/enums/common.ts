export enum PeriodFilter {
  ONE_WEEK = 'ONE_WEEK',
  ONE_MONTH = 'ONE_MONTH',
  THREE_MONTHS = 'THREE_MONTHS',
  SIX_MONTHS = 'SIX_MONTHS',
}

export enum ActiveStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  EXPIRED = 'expired',
}

export enum ExportType {
  ALL = 'All',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

export enum DesignSourceType {
  UPLOAD_FILE = 'upload_file',
  WEB_EDITOR = 'web_editor',
}

export enum CouponStatus {
  UPCOMING = 'upcoming',
  AVAILABLE = 'available',
  USED = 'used',
  EXPIRED = 'expired',
}

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum DesignReviewReplyStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
