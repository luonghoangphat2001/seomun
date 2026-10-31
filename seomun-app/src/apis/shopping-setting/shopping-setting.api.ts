import { api } from '@/config';
import { BaseResponse } from '@/types';
import { ShoppingSettingRESP } from './shopping-setting.response';
import { ShoppingSettingListREQ } from './shopping-setting.request';

export const ENDPOINTS = {
  SHOPPING_SETTING_LIST: '/shopping-settings',
};

export const ShoppingSettingApi = {
  getList: (params?: ShoppingSettingListREQ) =>
    api.get<BaseResponse<ShoppingSettingRESP>>(ENDPOINTS.SHOPPING_SETTING_LIST, { params }),
};
