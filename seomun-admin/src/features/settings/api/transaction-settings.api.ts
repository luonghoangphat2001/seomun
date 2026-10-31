import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { BaseResponse } from '@/types/api';

import type { UpdateTransactionSettingsREQ } from './transaction-settings.request';
import type { TransactionSettingsRESP } from './transaction-settings.response';

export function getTransactionSettingsAPI(): Promise<TransactionSettingsRESP> {
  return api.get(ENDPOINTS.TRANSACTION_SETTINGS.DETAIL);
}

export function updateTransactionSettingsAPI(payload: UpdateTransactionSettingsREQ): Promise<TransactionSettingsRESP> {
  return api.put(ENDPOINTS.TRANSACTION_SETTINGS.DETAIL, payload);
}

export function uploadTransactionLogoAPI(file: File): Promise<BaseResponse<unknown>> {
  const formData = new FormData();
  formData.append('logo', file);

  return api.post(ENDPOINTS.TRANSACTION_SETTINGS.LOGO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
