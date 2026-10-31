import { BaseResponse, ErrorRESP } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ShoppingSettingApi } from './shopping-setting.api';
import { ShoppingSettingRESP } from './shopping-setting.response';
import { ShoppingSettingListREQ } from './shopping-setting.request';

export const shoppingSettingQueryKeys = {
  LIST: 'SHOPPING_SETTING_LIST',
};

export const useShoppingSettingListQuery = (
  params?: ShoppingSettingListREQ,
  options?: Omit<UseQueryOptions<BaseResponse<ShoppingSettingRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: [shoppingSettingQueryKeys.LIST],
    queryFn: () => ShoppingSettingApi.getList(params),
    ...options,
  });
