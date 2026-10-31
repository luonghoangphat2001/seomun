export enum OrderStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  RECEIPT_PENDING = 'RECEIPT_PENDING',
  FILE_ERROR = 'FILE_ERROR',
  PROOFREADING_PENDING = 'PROOFREADING_PENDING',
  REPRESS = 'REPRESS',
  PUBLICATION = 'PUBLICATION',
  PRINTING = 'PRINTING',
  FINISHING = 'FINISHING',
  PRODUCTION_COMPLETE = 'PRODUCTION_COMPLETE',
}

export enum DesignStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  RECEIPT_PENDING = 'RECEIPT_PENDING',
  IN_DESIGN = 'IN_DESIGN',
  DRAFT_DELIVERY = 'DRAFT_DELIVERY',
  DESIGN_COMPLETE = 'DESIGN_COMPLETE',
}

export enum ShippingStatus {
  PICKUP = 'PICKUP',
  SHIPPING = 'SHIPPING',
  QUICK_DELIVERY = 'QUICK_DELIVERY',
  DIRECT_DELIVERY = 'DIRECT_DELIVERY',
  DELIVERY_COMPLETE = 'DELIVERY_COMPLETE',
}

export enum OrderActionFilter {
  ALL = 'ALL',
  EXCLUDE_CANCELLED = 'EXCLUDE_CANCELLED',
  FILE_ERROR = 'FILE_ERROR',
}

export enum OrderShippingMethod {
  COURIER = 'courier',
  QUICK = 'quick',
  PICKUP = 'pickup',
  DIRECT = 'direct',
}

export enum OrderPaymentMethod {
  VIRTUAL_ACCOUNT = 'virtual_account',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  NAVER_PAY = 'NAVER_PAY',
  KAKAO_PAY = 'KAKAO_PAY',
}

export enum OrderFilterLabel {
  ALL = 'all',
  EXCLUDE_CANCELLED = 'exclude_cancelled',
  FILE_ERROR = 'file_error',
}

export enum OrderHistoryStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  AWAITING_PAYMENT = 'awaiting_payment',
  CONFIRMED = 'confirmed',
  PURCHASE_CONFIRMED = 'purchase_confirmed',
  PENDING_RECEPTION = 'pending_reception',
  FILE_ERROR = 'file_error',
  PENDING_CORRECTION = 'pending_correction',
  TYPESETTING = 'typesetting',
  OUTPUT_OF_POWER = 'output_of_power',
  PRINT = 'print',
  POST_PROCESSING = 'post_processing',
  PRODUCTION_DONE = 'production_done',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPING = 'shipping',
  SHIPPED = 'shipped',
  DELIVERY_COMPLETED = 'delivery_completed',
  COMPLETED = 'completed',
  DESIGN_CONFIRMATION_REQUESTED = 'design_confirmation_requested',
  DESIGN_CONFIRMED = 'design_confirmed',
  DESIGN_REJECTED = 'design_rejected',
  CANCELLED = 'cancelled',
  REFUND_REQUESTED = 'refund_requested',
  REFUND_COMPLETED = 'refund_completed',
}

export enum OrderProofStatus {
  FILE_RESUBMITTED = 'file_resubmitted',
  CONFIRMED = 'confirmed',
}
