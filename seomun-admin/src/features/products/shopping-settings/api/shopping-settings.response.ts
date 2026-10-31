import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { ShoppingSetting } from '../types';

export type ShoppingSettingRESP = ShoppingSetting;

export type ShoppingSettingListRESP = PaginationResponse<{ settings: ShoppingSettingRESP[] }>;
export type ShoppingSettingDetailRESP = BaseResponse<{ shopping_setting: ShoppingSettingRESP }>;

export type ShoppingSettingItem = {
  id: number;
  shopping_setting_id: number;
  type: string;
  title: string;
  content: string;
  is_default?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
};

export type ShoppingSettingItemListRESP = {
  items: ShoppingSettingItem[];
};
