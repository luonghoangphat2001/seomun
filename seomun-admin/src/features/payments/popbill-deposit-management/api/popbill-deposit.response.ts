import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { BankAccountKey, BankDepositMatchReason, BankDepositStatus } from '../enums';

export type { BankDepositMatchReason } from '../enums';

export interface BankDepositRESP {
  id: number;
  account_key: BankAccountKey;
  provider_tid: string;
  amount: string;
  deposited_at: string;
  remarks: string[];
  status: BankDepositStatus;
  match_reason: BankDepositMatchReason | null;
  payment_transaction_id: string | null;
  order_id: string | null;
  matched_by: number | null;
  admin_note: string | null;
  matched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankFeedSyncRESP {
  id: number;
  account_key: BankAccountKey;
  requested_at: string | null;
  start_date: string | null;
  end_date: string | null;
  completed_through: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_code: number | null;
  created_at: string;
  updated_at: string;
}

export type BankDepositListRESP = PaginationResponse<{ bank_deposits: BankDepositRESP[] }>;
export type BankDepositSyncStatusRESP = BaseResponse<BankFeedSyncRESP[]>;
export type ConfirmBankDepositRESP = BaseResponse<BankDepositRESP>;
