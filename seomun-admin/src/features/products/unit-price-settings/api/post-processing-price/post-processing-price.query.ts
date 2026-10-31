import { queryOptions, useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import {
  createPostProcessingPriceAPI,
  deletePostProcessingPriceAPI,
  getPostProcessingPriceDetailAPI,
  getPostProcessingPricesAPI,
  updatePostProcessingPriceAPI,
} from './post-processing-price.api';
import type { PostProcessingPriceCreateREQ, PostProcessingPriceListREQ, PostProcessingPriceUpdateREQ } from './post-processing-price.request';
import type { PostProcessingPriceActionRESP, PostProcessingPriceDetailRESP, PostProcessingPriceListRESP } from './post-processing-price.response';

export const postProcessingPriceKeys = {
  all: ['products', 'unit-price-settings', 'post-processing-prices'] as const,
  lists: () => [...postProcessingPriceKeys.all, 'list'] as const,
  list: (params: PostProcessingPriceListREQ) => [...postProcessingPriceKeys.lists(), params] as const,
  detail: (id: number) => [...postProcessingPriceKeys.all, 'detail', id] as const,
};

type PostProcessingPriceListQueryKey = ReturnType<typeof postProcessingPriceKeys.list>;
type PostProcessingPriceDetailQueryKey = ReturnType<typeof postProcessingPriceKeys.detail>;

export function postProcessingPriceListQueryOptions(params: PostProcessingPriceListREQ) {
  return queryOptions<PostProcessingPriceListRESP, AxiosError<IBaseError>, PostProcessingPriceListRESP, PostProcessingPriceListQueryKey>({
    queryKey: postProcessingPriceKeys.list(params),
    queryFn: () => getPostProcessingPricesAPI(params),
    staleTime: 30_000,
  });
}

export function usePostProcessingPricesQuery(
  params: PostProcessingPriceListREQ,
  options?: Omit<
    UseQueryOptions<PostProcessingPriceListRESP, AxiosError<IBaseError>, PostProcessingPriceListRESP, PostProcessingPriceListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PostProcessingPriceListRESP, AxiosError<IBaseError>, PostProcessingPriceListRESP, PostProcessingPriceListQueryKey>({
    ...postProcessingPriceListQueryOptions(params),
    ...options,
    // placeholderData: keepPreviousData,
  });
}

export function postProcessingPriceDetailQueryOptions(id: number) {
  return queryOptions<PostProcessingPriceDetailRESP, AxiosError<IBaseError>, PostProcessingPriceDetailRESP, PostProcessingPriceDetailQueryKey>({
    queryKey: postProcessingPriceKeys.detail(id),
    queryFn: () => getPostProcessingPriceDetailAPI(id),
    staleTime: 30_000,
  });
}

export function usePostProcessingPriceDetailQuery(
  id: number | null,
  options?: Omit<
    UseQueryOptions<PostProcessingPriceDetailRESP, AxiosError<IBaseError>, PostProcessingPriceDetailRESP, PostProcessingPriceDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PostProcessingPriceDetailRESP, AxiosError<IBaseError>, PostProcessingPriceDetailRESP, PostProcessingPriceDetailQueryKey>({
    ...postProcessingPriceDetailQueryOptions(id ?? 0),
    enabled: id !== null,
    ...options,
  });
}

export function useCreatePostProcessingPriceMutation(
  options?: UseMutationOptions<PostProcessingPriceActionRESP, AxiosError<IBaseError>, PostProcessingPriceCreateREQ>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => createPostProcessingPriceAPI(payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: postProcessingPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdatePostProcessingPriceMutation(
  options?: UseMutationOptions<PostProcessingPriceActionRESP, AxiosError<IBaseError>, { id: number; payload: PostProcessingPriceUpdateREQ }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => updatePostProcessingPriceAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: postProcessingPriceKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: postProcessingPriceKeys.detail(variables.id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeletePostProcessingPriceMutation(options?: UseMutationOptions<void, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deletePostProcessingPriceAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: postProcessingPriceKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
