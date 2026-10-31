export enum CashReceiptIssueStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  DELETED = 'deleted',
}

export enum CashReceiptSortField {
  ORDER_CODE = 'order_code',
  ORDER_NUMBER = 'order_number',
  CREATED_AT = 'created_at',
  TOTAL_TRANSACTION_AMOUNT = 'total_transaction_amount',
  ISSUE_STATUS = 'issue_status',
}

export enum CashReceiptExportType {
  ALL = 'all',
  SELECTED = 'selected',
  CURRENT_PAGE = 'current_page',
}

export enum CashReceiptTab {
  ORIGINAL = 'original',
  GENERATED = 'generated',
}

export enum PaymentMethod {
  CARD = 'card',
  VIRTUAL_ACCOUNT = 'virtual_account',
  BANK_TRANSFER = 'bank_transfer',
  TOSS = 'toss',
  SEOMUN_PAY = 'seomun_pay',
  PAYLATER = 'paylater',
  DEDICATED_ACCOUNT = 'dedicated_account',
  TAX_INVOICE = 'tax_invoice',
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
