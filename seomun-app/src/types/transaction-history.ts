export type DailyTransaction = {
  day: number;
  orderAmount: number;
  shippingFee: number | null;
  discountAmount: number | null;
  supplyAmount: number;
  depositAmount: number;
  depositSettlement: number;
  balance?: number | null;
  outStandingAmount?: number | null;
  refund?: number | null;
};

export type TransactionHistory = {
  month: number;
  days: DailyTransaction[];
};
