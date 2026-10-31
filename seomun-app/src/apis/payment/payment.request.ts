export type PaymentByVirtualAccountREQ = {
  order_number: string;
};

export type PaymentInitREQ = {
  order_number: string;
  payment_method: string;
  bank_account_holder?: string;
  return_url?: string | null;
  metadata?: unknown[];
};

export type PaymentConfirmREQ = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

/** Payload for the POPBiLL manual bank-transfer flow. */
export type BankTransferPaymentREQ = {
  order_number: string;
  payment_method: 'bank_transfer';
  bank_account_key: string;
  /** Name of the person making the transfer, used by POPBiLL for matching. */
  bank_account_holder: string;
};
