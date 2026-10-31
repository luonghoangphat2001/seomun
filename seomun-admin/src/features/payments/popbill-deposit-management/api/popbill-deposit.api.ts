import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import { createMockBankDepositSyncStatusResponse } from '../mocks';
import type { BankDepositListREQ, ConfirmBankDepositREQ } from './popbill-deposit.request';
import type { BankDepositListRESP, BankDepositSyncStatusRESP, ConfirmBankDepositRESP } from './popbill-deposit.response';

export async function getBankDepositsAPI(params: BankDepositListREQ): Promise<BankDepositListRESP> {
  const response = await api.get<BankDepositListRESP>(ENDPOINTS.PAYMENTS.BANK_DEPOSITS, { params });

  return response;
}

export async function getBankDepositSyncStatusAPI(): Promise<BankDepositSyncStatusRESP> {
  const response = await api.get<BankDepositSyncStatusRESP>(ENDPOINTS.PAYMENTS.BANK_DEPOSIT_SYNC_STATUS);

  return import.meta.env.DEV && response.data.length === 0 ? createMockBankDepositSyncStatusResponse() : response;
}

export function confirmBankDepositAPI(depositId: number, payload: ConfirmBankDepositREQ): Promise<ConfirmBankDepositRESP> {
  return api.post<ConfirmBankDepositRESP>(ENDPOINTS.PAYMENTS.CONFIRM_BANK_DEPOSIT(depositId), payload);
}
