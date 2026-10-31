export type TransactionHistoryAmountTotalsRESP = {
  order_amount: string;
  shipping_fee: string;
  tax_amount: string;
  subtotal: string;
  point_used: string;
  billed_amount: string;
  paid_amount: string;
  prepaid: string;
  unpaid_amount: string;
  refund_amount: string;
};

export type TransactionHistoryDayRESP = TransactionHistoryAmountTotalsRESP & {
  month: number;
  day: number;
};

export type TransactionHistoryMonthRESP = {
  month: number;
  days: TransactionHistoryDayRESP[];
  totals: TransactionHistoryAmountTotalsRESP;
};

export type TransactionHistoryListDataRESP = {
  items: TransactionHistoryMonthRESP[];
  totals: TransactionHistoryAmountTotalsRESP;
};
