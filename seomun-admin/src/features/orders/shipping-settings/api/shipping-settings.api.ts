import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { UpdateShippingSettingsREQ } from './shipping-settings.request';
import type { ShippingSettingsRESP } from './shipping-settings.response';

export function getShippingSettingsAPI(): Promise<ShippingSettingsRESP> {
  return api.get(ENDPOINTS.ORDERS.SHIPPING_SETTINGS);
}

export function updateShippingSettingsAPI(payload: UpdateShippingSettingsREQ): Promise<ShippingSettingsRESP> {
  return api.put(ENDPOINTS.ORDERS.SHIPPING_SETTINGS, payload);
}
