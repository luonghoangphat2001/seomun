import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { BaseResponse } from '@/types/api';

import type { UpdateCompanySettingsREQ } from './company-settings.request';
import type { CompanySettingsRESP } from './company-settings.response';

export function getCompanySettingsAPI(): Promise<CompanySettingsRESP> {
  return api.get(ENDPOINTS.COMPANY_SETTINGS.DETAIL);
}

export function updateCompanySettingsAPI(payload: UpdateCompanySettingsREQ): Promise<CompanySettingsRESP> {
  return api.put(ENDPOINTS.COMPANY_SETTINGS.DETAIL, payload);
}

// The stamp is an image behind auth, so it's fetched as a Blob (not usable directly as an <img> src).
export function getCompanyStampAPI(): Promise<Blob> {
  return api.get<Blob>(ENDPOINTS.COMPANY_SETTINGS.STAMP, { responseType: 'blob' });
}

export function uploadCompanyStampAPI(file: File): Promise<BaseResponse<unknown>> {
  const formData = new FormData();
  formData.append('stamp', file);

  return api.post(ENDPOINTS.COMPANY_SETTINGS.STAMP, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function deleteCompanyStampAPI(): Promise<BaseResponse<unknown>> {
  return api.delete(ENDPOINTS.COMPANY_SETTINGS.STAMP);
}
