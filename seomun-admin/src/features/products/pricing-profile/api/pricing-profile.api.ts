import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { PricingProfileStatusUpdateREQ } from './pricing-profile.request';
import type { PricingProfileListRESP, PricingProfileToggleStatusRESP } from './pricing-profile.response';

export const getPricingProfilesAPI = (): Promise<PricingProfileListRESP> => api.get(ENDPOINTS.PRICING.PROFILES.LIST);

export const updatePricingProfileStatusAPI = (id: number, payload: PricingProfileStatusUpdateREQ): Promise<PricingProfileToggleStatusRESP> =>
  api.patch(ENDPOINTS.PRICING.PROFILES.UPDATE_STATUS(id), payload);
