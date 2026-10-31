import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import {
  createWebEditorAPI,
  deleteWebEditorAPI,
  getWebEditorDetailAPI,
  getWebEditorsAPI,
  getWebEditorTemplatesAPI,
  updateWebEditorAPI,
} from './web-editor.api';
import type { WebEditorListREQ, WebEditorREQ, WebEditorUpdateREQ } from './web-editor.request';
import type { WebEditorDetailRESP, WebEditorWriteRESP, WebEditorListRESP, WebEditorTemplatesRESP } from './web-editor.response';

export const webEditorKeys = {
  all: ['web-editors'] as const,
  lists: () => [...webEditorKeys.all, 'list'] as const,
  list: (params: WebEditorListREQ) => [...webEditorKeys.lists(), params] as const,
  detail: (id: number) => [...webEditorKeys.all, 'detail', id] as const,
  templates: (id: number) => [...webEditorKeys.all, 'templates', id] as const,
};

type WebEditorListQueryKey = ReturnType<typeof webEditorKeys.list>;

export function useWebEditorsQuery(
  params: WebEditorListREQ,
  options?: Omit<UseQueryOptions<WebEditorListRESP, AxiosError<IBaseError>, WebEditorListRESP, WebEditorListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<WebEditorListRESP, AxiosError<IBaseError>, WebEditorListRESP, WebEditorListQueryKey>({
    queryKey: webEditorKeys.list(params),
    queryFn: () => getWebEditorsAPI(params),
    staleTime: 30_000,
    ...options,
  });
}

type WebEditorDetailQueryKey = ReturnType<typeof webEditorKeys.detail>;

export function useWebEditorDetailQuery(
  id: number | null,
  options?: Omit<UseQueryOptions<WebEditorDetailRESP, AxiosError<IBaseError>, WebEditorDetailRESP, WebEditorDetailQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<WebEditorDetailRESP, AxiosError<IBaseError>, WebEditorDetailRESP, WebEditorDetailQueryKey>({
    queryKey: webEditorKeys.detail(id ?? 0),
    queryFn: () => getWebEditorDetailAPI(id!),
    enabled: id !== null,
    staleTime: 30_000,
    ...options,
  });
}

type WebEditorTemplatesQueryKey = ReturnType<typeof webEditorKeys.templates>;

export function useWebEditorTemplatesQuery(
  id: number | null,
  options?: Omit<
    UseQueryOptions<WebEditorTemplatesRESP, AxiosError<IBaseError>, WebEditorTemplatesRESP, WebEditorTemplatesQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<WebEditorTemplatesRESP, AxiosError<IBaseError>, WebEditorTemplatesRESP, WebEditorTemplatesQueryKey>({
    queryKey: webEditorKeys.templates(id ?? 0),
    queryFn: () => getWebEditorTemplatesAPI(id!),
    enabled: id !== null,
    staleTime: 30_000,
    ...options,
  });
}

export function useCreateWebEditorMutation(options?: UseMutationOptions<WebEditorWriteRESP, AxiosError<IBaseError>, WebEditorREQ>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => createWebEditorAPI(payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: webEditorKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateWebEditorMutation(
  options?: UseMutationOptions<WebEditorWriteRESP, AxiosError<IBaseError>, { id: number; payload: WebEditorUpdateREQ }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => updateWebEditorAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: webEditorKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteWebEditorMutation(options?: UseMutationOptions<void, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deleteWebEditorAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: webEditorKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
