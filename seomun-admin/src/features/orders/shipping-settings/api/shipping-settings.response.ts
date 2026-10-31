import type { BaseResponse } from '@/types/api';

export interface ShippingSettings {
  free_shipping_start_at: string | null;
  free_shipping_end_at: string | null;
  is_active: boolean;
}

export type ShippingSettingsRESP = BaseResponse<ShippingSettings>;
