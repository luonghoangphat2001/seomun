import type { PaginationRequest } from '@/types/api';

import type { ShoppingSettingType } from '../enums';

export type ShoppingSettingListREQ = PaginationRequest;

export interface UpdateShoppingSettingREQ {
  title: string;
  content: string;
  type: ShoppingSettingType;
}

export type ShoppingSettingItemListREQ = {
  shopping_setting_id: number;
  is_active?: boolean;
};

export type ShoppingSettingItemCreateREQ = {
  shopping_setting_id: number;
  title: string;
  content: string;
  is_default?: boolean;
  is_active?: boolean;
  sort_order?: number;
};

export type ShoppingSettingItemUpdateREQ = {
  itemId: number;
  title: string;
  content: string;
  is_default?: boolean;
  is_active?: boolean;
  sort_order?: number;
};
