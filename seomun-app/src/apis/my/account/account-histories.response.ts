import { RefundHistoryStatus } from '@/enums/refund-account';

export interface MyAccountHistoryRESP {
  id: number;
  settlement_date: string;
  refund_amount: number;
  account_holder: string;
  bank_code: string;
  account_number: string;
  deposit_date: string;
  status: RefundHistoryStatus;
}

export interface MyAccountHistoriesRESP {
  histories: MyAccountHistoryRESP[];
}
