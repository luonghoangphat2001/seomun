import { queryOptions, useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import { getShippingSettingsAPI, updateShippingSettingsAPI } from './shipping-settings.api';
import type { UpdateShippingSettingsREQ } from './shipping-settings.request';
import type { ShippingSettingsRESP } from './shipping-settings.response';

export const shippingSettingsKeys = {
  all: ['orders', 'shipping-settings'] as const,
};

type ShippingSettingsQueryKey = typeof shippingSettingsKeys.all;

export function shippingSettingsQueryOptions() {
  return queryOptions<ShippingSettingsRESP, AxiosError<IBaseError>, ShippingSettingsRESP, ShippingSettingsQueryKey>({
    queryKey: shippingSettingsKeys.all,
    queryFn: getShippingSettingsAPI,
    staleTime: 30_000,
  });
}

export function useShippingSettingsQuery(
  options?: Omit<
    UseQueryOptions<ShippingSettingsRESP, AxiosError<IBaseError>, ShippingSettingsRESP, ShippingSettingsQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ShippingSettingsRESP, AxiosError<IBaseError>, ShippingSettingsRESP, ShippingSettingsQueryKey>({
    ...shippingSettingsQueryOptions(),
    ...options,
  });
}

export function useUpdateShippingSettingsMutation(
  options?: UseMutationOptions<ShippingSettingsRESP, AxiosError<IBaseError>, UpdateShippingSettingsREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateShippingSettingsAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: shippingSettingsKeys.all });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
