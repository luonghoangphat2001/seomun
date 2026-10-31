export enum TaxInvoiceIssueStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  DELETED = 'deleted',
}

export enum TaxInvoiceSortField {
  ORDER_CODE = 'order_code',
  ORDER_NUMBER = 'order_number',
  CREATED_AT = 'created_at',
  COMPANY_NAME = 'company_name',
  PAYMENT_AMOUNT = 'payment_amount',
  ISSUE_STATUS = 'issue_status',
}

export enum TaxInvoiceExportType {
  ALL = 'all',
  SELECTED = 'selected',
  CURRENT_PAGE = 'current_page',
}

export enum TaxInvoiceTab {
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

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  AWAITING_PAYMENT = 'awaiting_payment',
  CONFIRMED = 'confirmed',
  PURCHASE_CONFIRMED = 'purchase_confirmed',
  PREPARING = 'preparing',
  IN_PRODUCTION = 'in_production',
  POST_PROCESSING = 'post_processing',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPING = 'shipping',
  SHIPPED = 'shipped',
  DELIVERY_COMPLETED = 'delivery_completed',
  COMPLETED = 'completed',
  DESIGN_IN_PROGRESS = 'design_in_progress',
  DESIGN_CONFIRMATION_REQUESTED = 'design_confirmation_requested',
  DESIGN_CONFIRMED = 'design_confirmed',
  DESIGN_REJECTED = 'design_rejected',
  CANCELLED = 'cancelled',
  REFUND_REQUESTED = 'refund_requested',
  REFUND_COMPLETED = 'refund_completed',
}
