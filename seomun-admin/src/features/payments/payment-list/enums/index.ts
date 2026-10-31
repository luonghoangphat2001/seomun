export enum PaymentSortField {
  STATUS = 'status',
  AMOUNT = 'amount',
  PAID_AT = 'paid_at',
  ORDER_NUMBER = 'order_number',
  CREATED_AT = 'created_at',
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

export enum PaymentMethod {
  CARD = 'card',
  TOSS = 'toss',
  VIRTUAL_ACCOUNT = 'virtual_account',
  BANK_TRANSFER = 'bank_transfer',
  PAYLATER = 'paylater',
}

export enum PaymentExportExcelType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

export enum PaymentPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}
