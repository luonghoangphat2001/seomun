import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import { getPricingProfilesAPI, updatePricingProfileStatusAPI } from './pricing-profile.api';
import type { PricingProfileStatusUpdateREQ } from './pricing-profile.request';
import type { PricingProfileListRESP, PricingProfileToggleStatusRESP } from './pricing-profile.response';

export const pricingProfileKeys = {
  all: ['products', 'pricing-profiles'] as const,
  lists: () => [...pricingProfileKeys.all, 'list'] as const,
  list: () => pricingProfileKeys.lists(),
};

type PricingProfileListQueryKey = ReturnType<typeof pricingProfileKeys.list>;
export function usePricingProfilesQuery(
  options?: Omit<
    UseQueryOptions<PricingProfileListRESP, AxiosError<IBaseError>, PricingProfileListRESP, PricingProfileListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PricingProfileListRESP, AxiosError<IBaseError>, PricingProfileListRESP, PricingProfileListQueryKey>({
    queryKey: pricingProfileKeys.list(),
    queryFn: getPricingProfilesAPI,
    staleTime: 30_000,
    ...options,
  });
}

export function useTogglePricingProfileStatusMutation(
  options?: UseMutationOptions<PricingProfileToggleStatusRESP, AxiosError<IBaseError>, { id: number; payload: PricingProfileStatusUpdateREQ }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => updatePricingProfileStatusAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: pricingProfileKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
