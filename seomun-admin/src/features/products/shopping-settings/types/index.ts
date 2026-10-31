import type { ShoppingSettingType } from '../enums';

export interface ShoppingSetting {
  id: number;
  title: string;
  content: string;
  type: ShoppingSettingType;
  created_at: string;
  updated_at: string;
}
