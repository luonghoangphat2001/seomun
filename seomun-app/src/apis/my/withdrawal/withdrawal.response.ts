export type WithdrawalCheckRESP = {
  can_withdraw: boolean;
  blocking_reason: string | null;
  current_balance: {
    s_point: number;
    c_coupons: number;
    pending_refund_amount: number;
  };
};
