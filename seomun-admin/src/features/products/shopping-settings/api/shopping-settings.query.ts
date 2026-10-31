import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import {
  createShoppingSettingItemAPI,
  deleteShoppingSettingItemAPI,
  getShoppingSettingDetailAPI,
  getShoppingSettingItemListAPI,
  getShoppingSettingsAPI,
  updateShoppingSettingAPI,
  updateShoppingSettingItemAPI,
} from './shopping-settings.api';
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

export const shoppingSettingKeys = {
  all: ['shopping-settings'] as const,
  lists: () => [...shoppingSettingKeys.all, 'list'] as const,
  list: (params: ShoppingSettingListREQ) => [...shoppingSettingKeys.lists(), params] as const,
  details: () => [...shoppingSettingKeys.all, 'detail'] as const,
  detail: (id: number) => [...shoppingSettingKeys.details(), id] as const,
  itemLists: () => [...shoppingSettingKeys.all, 'item-list'] as const,
  itemList: (params?: ShoppingSettingItemListREQ) => [...shoppingSettingKeys.itemLists(), params] as const,
};

type ShoppingSettingListQueryKey = ReturnType<typeof shoppingSettingKeys.list>;
type ShoppingSettingDetailQueryKey = ReturnType<typeof shoppingSettingKeys.detail>;
type ShoppingSettingItemListQueryKey = ReturnType<typeof shoppingSettingKeys.itemList>;

export function shoppingSettingListQueryOptions(params: ShoppingSettingListREQ) {
  return queryOptions<ShoppingSettingListRESP, AxiosError<IBaseError>, ShoppingSettingListRESP, ShoppingSettingListQueryKey>({
    queryKey: shoppingSettingKeys.list(params),
    queryFn: () => getShoppingSettingsAPI(params),
    staleTime: 30_000,
  });
}

export function useShoppingSettingsQuery(
  params: ShoppingSettingListREQ,
  options?: Omit<
    UseQueryOptions<ShoppingSettingListRESP, AxiosError<IBaseError>, ShoppingSettingListRESP, ShoppingSettingListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ShoppingSettingListRESP, AxiosError<IBaseError>, ShoppingSettingListRESP, ShoppingSettingListQueryKey>({
    ...shoppingSettingListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function shoppingSettingDetailQueryOptions(id: number) {
  return queryOptions<ShoppingSettingDetailRESP, AxiosError<IBaseError>, ShoppingSettingDetailRESP, ShoppingSettingDetailQueryKey>({
    queryKey: shoppingSettingKeys.detail(id),
    queryFn: () => getShoppingSettingDetailAPI(id),
    staleTime: 30_000,
  });
}

export function useShoppingSettingDetailQuery(
  id: number,
  options?: Omit<
    UseQueryOptions<ShoppingSettingDetailRESP, AxiosError<IBaseError>, ShoppingSettingDetailRESP, ShoppingSettingDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ShoppingSettingDetailRESP, AxiosError<IBaseError>, ShoppingSettingDetailRESP, ShoppingSettingDetailQueryKey>({
    ...shoppingSettingDetailQueryOptions(id),
    ...options,
  });
}

export function shoppingSettingItemListQueryOptions(params?: ShoppingSettingItemListREQ) {
  return queryOptions<BaseResponse<ShoppingSettingItemListRESP>, AxiosError<IBaseError>, ShoppingSettingItem[], ShoppingSettingItemListQueryKey>({
    queryKey: shoppingSettingKeys.itemList(params),
    queryFn: () => getShoppingSettingItemListAPI(params),
    select: (resp) => resp.data.items,
  });
}

export function useShoppingSettingItemListQuery(
  params?: ShoppingSettingItemListREQ,
  options?: Omit<
    UseQueryOptions<BaseResponse<ShoppingSettingItemListRESP>, AxiosError<IBaseError>, ShoppingSettingItem[], ShoppingSettingItemListQueryKey>,
    'queryKey' | 'queryFn' | 'select'
  >,
) {
  return useQuery<BaseResponse<ShoppingSettingItemListRESP>, AxiosError<IBaseError>, ShoppingSettingItem[], ShoppingSettingItemListQueryKey>({
    ...shoppingSettingItemListQueryOptions(params),
    enabled: Boolean(params?.shopping_setting_id),
    ...options,
  });
}

export function useUpdateShoppingSettingMutation(
  id: number,
  options?: UseMutationOptions<ShoppingSettingDetailRESP, AxiosError<IBaseError>, UpdateShoppingSettingREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (payload) => updateShoppingSettingAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: shoppingSettingKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: shoppingSettingKeys.detail(id) });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateShoppingSettingByIdMutation(
  options?: UseMutationOptions<ShoppingSettingDetailRESP, AxiosError<IBaseError>, { id: number; payload: UpdateShoppingSettingREQ }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => updateShoppingSettingAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: shoppingSettingKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: shoppingSettingKeys.detail(variables.id) });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCreateShoppingSettingItemMutation(
  options?: UseMutationOptions<BaseResponse<ShoppingSettingItem>, AxiosError<IBaseError>, ShoppingSettingItemCreateREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createShoppingSettingItemAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: shoppingSettingKeys.itemLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateShoppingSettingItemMutation(
  options?: UseMutationOptions<BaseResponse<ShoppingSettingItem>, AxiosError<IBaseError>, ShoppingSettingItemUpdateREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateShoppingSettingItemAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: shoppingSettingKeys.itemLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteShoppingSettingItemMutation(options?: UseMutationOptions<unknown, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteShoppingSettingItemAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: shoppingSettingKeys.itemLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
