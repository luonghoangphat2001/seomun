export enum OrderStatusGroup {
  PRODUCTION = 'production',
  DESIGN = 'design',
  DELIVERY = 'delivery',
}

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  AWAITING_PAYMENT = 'awaiting_payment',
  CONFIRMED = 'confirmed',
  PURCHASE_CONFIRMED = 'purchase_confirmed',

  PENDING_RECEPTION = 'pending_reception',
  FILE_ERROR = 'file_error',
  PENDING_CORRECTION = 'pending_correction',
  DESIGN_IN_PROGRESS = 'design_in_progress',
  DESIGN_CONFIRMATION_REQUESTED = 'design_confirmation_requested',
  DESIGN_CONFIRMED = 'design_confirmed',
  DESIGN_REJECTED = 'design_rejected',
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
  CANCELLED = 'cancelled',
  REFUND_REQUESTED = 'refund_requested',
  REFUND_COMPLETED = 'refund_completed',
}

export enum OrderSortField {
  PLACED_AT = 'placed_at',
  ORDERER_NUMBER = 'orderer_number',
  PAYMENT_AMOUNT = 'payment_amount',
  STATUS = 'status',
}

export enum PaymentMethod {
  CARD = 'card',
  TOSS = 'toss',
  SEOMUN_PAY = 'seomun_pay',
  VIRTUAL_ACCOUNT = 'virtual_account',
  BANK_TRANSFER = 'bank_transfer',
  PAYLATER = 'paylater',
}

export enum OrderShippingMethod {
  COURIER = 'courier',
  QUICK = 'quick',
  PICKUP = 'pickup',
  DIRECT = 'direct',
}

/** Virtual account bank, keyed by Toss `virtual_account_bank` code. */
export enum Bank {
  IBK = 'IBK',
  KOOKMIN = 'KOOKMIN',
  NONGHYUP = 'NONGHYUP',
  WOORI = 'WOORI',
  DAEGU = 'DAEGU',
  BUSAN = 'BUSAN',
  HANA = 'HANA',
  SHINHAN = 'SHINHAN',
}

export enum OrderProofStatus {
  FILE_RESUBMITTED = 'file_resubmitted',
  CONFIRMED = 'confirmed',
}

export enum AssignedDesignStatus {
  PENDING_ASSIGNMENT = 'pending_assignment',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  CUSTOMER_REVIEW = 'customer_review',
  REVISION_REQUESTED = 'revision_requested',
  CUSTOMER_APPROVED = 'customer_approved',
}

export enum CustomerReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
