import type { BaseResponse } from '@/types/api';

import type { CompanyStamp } from './company-settings.response';

export interface TransactionSettings {
  id: number;
  logo: string | null;
  /** Same seal as the company settings (managed there). */
  stamp: CompanyStamp;
  address: string | null;
  email: string | null;
  phone_number: string | null;
  updated_at: string | null;
}

export type TransactionSettingsRESP = BaseResponse<TransactionSettings>;
