export type PaymentByVirtualAccountRESP = {
  transaction_id: string;
  payment_method: string;
  status: string;
  amount: number;
  currency: string;
  order: {
    order_number: string;
    payment_status: string;
  };
};

export type PaymentInitRESP = {
  transaction_id: string;
  payment_method: string;
  status: string;
  amount: number;
  currency: string;
};

export type PaymentConfirmRESP = {
  transaction_id: string;
  status: string;
  order: {
    order_number: string;
    payment_status: string;
  };
};

export type PaymentTransactionStatus =
  'pending' | 'processing' | 'paid' | 'cancelled' | 'failed' | 'expired' | 'refunded' | 'partially_refunded';

export type PaymentMethodRESP = {
  code: string;
  label: string;
  available: boolean;
  requires_redirect: boolean;
};

export type BankAccountRESP = {
  bank_account_key: string;
  bank_name: string;
};

export type PaymentMethodsRESP = {
  payment_methods: PaymentMethodRESP[];
  bank_accounts: BankAccountRESP[];
};

export type BankTransferRESP = {
  bank_account_key: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  /** Recipient account holder. This is different from the payer name in the request. */
  account_holder: string;
  transfer_reference: string;
  matching_rule: string;
  transfer_reference_required: boolean;
  recipient_description_label: string;
  transfer_instructions: string;
  check_interval_minutes: number;
};

export type BankTransferPaymentRESP = {
  transaction_id: string;
  payment_method: 'bank_transfer';
  status: PaymentTransactionStatus;
  amount: string;
  currency: string;
  bank_transfer: BankTransferRESP | null;
};

export type PaymentDetailTransactionRESP = {
  id: number;
  transaction_id: string;
  order_number: string;
  payment_method: string;
  status: PaymentTransactionStatus;
  amount: string;
  currency: string;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  created_at: string;
  bank_transfer: BankTransferRESP | null;
};

export type PaymentDetailRESP = {
  transaction: PaymentDetailTransactionRESP;
};
