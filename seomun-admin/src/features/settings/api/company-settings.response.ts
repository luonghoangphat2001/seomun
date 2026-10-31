import type { BaseResponse } from '@/types/api';

export interface CompanyStamp {
  is_configured: boolean;
  original_name: string | null;
  preview_url: string | null;
}

export interface CompanySettings {
  id: number;
  company_name: string | null;
  business_registration_number: string | null;
  address: string | null;
  representative_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  industry_type: string | null;
  business_type: string | null;
  stamp: CompanyStamp;
  updated_at: string | null;
}

export type CompanySettingsRESP = BaseResponse<CompanySettings>;
