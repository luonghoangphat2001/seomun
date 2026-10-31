import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type {
  ShoppingSettingItemCreateREQ,
  ShoppingSettingItemListREQ,
  ShoppingSettingItemUpdateREQ,
  ShoppingSettingListREQ,
  UpdateShoppingSettingREQ,
} from './shopping-settings.request';
import type {
  ShoppingSettingDetailRESP,
  ShoppingSettingItem,
  ShoppingSettingItemListRESP,
  ShoppingSettingListRESP,
} from './shopping-settings.response';
import type { BaseResponse } from '@/types/api';

export function getShoppingSettingsAPI(params: ShoppingSettingListREQ): Promise<ShoppingSettingListRESP> {
  return api.get(ENDPOINTS.SHOPPING_SETTINGS.LIST, { params });
}

export function getShoppingSettingDetailAPI(id: number): Promise<ShoppingSettingDetailRESP> {
  return api.get(ENDPOINTS.SHOPPING_SETTINGS.DETAIL(id));
}

export function updateShoppingSettingAPI(id: number, payload: UpdateShoppingSettingREQ): Promise<ShoppingSettingDetailRESP> {
  return api.put(ENDPOINTS.SHOPPING_SETTINGS.UPDATE(id), payload);
}

export function getShoppingSettingItemListAPI(params?: ShoppingSettingItemListREQ): Promise<BaseResponse<ShoppingSettingItemListRESP>> {
  return api.get(ENDPOINTS.SHOPPING_SETTINGS.ITEM_LIST, { params });
}

export function createShoppingSettingItemAPI(body: ShoppingSettingItemCreateREQ): Promise<BaseResponse<ShoppingSettingItem>> {
  return api.post(ENDPOINTS.SHOPPING_SETTINGS.ITEM_LIST, body);
}

export function updateShoppingSettingItemAPI(body: ShoppingSettingItemUpdateREQ): Promise<BaseResponse<ShoppingSettingItem>> {
  return api.put(ENDPOINTS.SHOPPING_SETTINGS.ITEM_DETAIL(body.itemId), body);
}

export function deleteShoppingSettingItemAPI(itemId: number) {
  return api.delete(ENDPOINTS.SHOPPING_SETTINGS.ITEM_DETAIL(itemId));
}
