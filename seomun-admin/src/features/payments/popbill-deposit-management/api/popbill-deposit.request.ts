import type { PaginationRequest } from '@/types/api';

import type { BankAccountKey, BankDepositStatus } from '../enums';

export type { BankAccountKey, BankDepositStatus } from '../enums';

export interface BankDepositListREQ extends PaginationRequest {
  status?: BankDepositStatus;
  bank_account_key?: BankAccountKey;
}

export interface ConfirmBankDepositREQ {
  payment_transaction_id: number;
  note: string;
}
