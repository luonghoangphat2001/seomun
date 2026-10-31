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

import type { TemplateListSearch } from '../schemas';
import { buildTemplateListParams } from '../utils/template-list-params';
import {
  copyTemplateAPI,
  createTemplateAPI,
  deleteTemplateAPI,
  getTemplateCopyPreviewAPI,
  getTemplateDetailAPI,
  getTemplateSearchFiltersAPI,
  getTemplatesAPI,
  patchTemplateAPI,
} from './template.api';
import type { TemplateCopyREQ, TemplateListREQ, TemplateWriteREQ } from './template.request';
import type { TemplateCopyPreviewRESP, TemplateDetailRESP, TemplateListRESP, TemplateSearchFiltersRESP } from './template.response';

export const templateKeys = {
  all: ['products', 'templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (params: TemplateListREQ) => [...templateKeys.lists(), params] as const,
  filters: () => [...templateKeys.all, 'search-filters'] as const,
  detail: (id: number) => [...templateKeys.all, 'detail', id] as const,
  copyPreview: (id: number) => [...templateKeys.all, 'copy-preview', id] as const,
};

type TemplateListQueryKey = ReturnType<typeof templateKeys.list>;
type TemplateFiltersQueryKey = ReturnType<typeof templateKeys.filters>;
type TemplateDetailQueryKey = ReturnType<typeof templateKeys.detail>;
type TemplateCopyPreviewQueryKey = ReturnType<typeof templateKeys.copyPreview>;

export function templateListQueryOptions(params: TemplateListREQ) {
  return queryOptions<TemplateListRESP, AxiosError<IBaseError>, TemplateListRESP, TemplateListQueryKey>({
    queryKey: templateKeys.list(params),
    queryFn: () => getTemplatesAPI(params),
    staleTime: 30_000,
  });
}

export function templateListQueryOptionsBySearch(search: TemplateListSearch) {
  return templateListQueryOptions(buildTemplateListParams(search));
}

export function templateSearchFiltersQueryOptions() {
  return queryOptions<TemplateSearchFiltersRESP, AxiosError<IBaseError>, TemplateSearchFiltersRESP, TemplateFiltersQueryKey>({
    queryKey: templateKeys.filters(),
    queryFn: getTemplateSearchFiltersAPI,
    staleTime: 300_000,
  });
}

export function templateDetailQueryOptions(id: number) {
  return queryOptions<TemplateDetailRESP, AxiosError<IBaseError>, TemplateDetailRESP, TemplateDetailQueryKey>({
    queryKey: templateKeys.detail(id),
    queryFn: () => getTemplateDetailAPI(id),
    staleTime: 30_000,
  });
}

export function useTemplatesQuery(
  params: TemplateListREQ,
  options?: Omit<UseQueryOptions<TemplateListRESP, AxiosError<IBaseError>, TemplateListRESP, TemplateListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TemplateListRESP, AxiosError<IBaseError>, TemplateListRESP, TemplateListQueryKey>({
    ...templateListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useTemplateSearchFiltersQuery(
  options?: Omit<
    UseQueryOptions<TemplateSearchFiltersRESP, AxiosError<IBaseError>, TemplateSearchFiltersRESP, TemplateFiltersQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<TemplateSearchFiltersRESP, AxiosError<IBaseError>, TemplateSearchFiltersRESP, TemplateFiltersQueryKey>({
    ...templateSearchFiltersQueryOptions(),
    ...options,
  });
}

export function useTemplateDetailQuery(
  id: number | null,
  options?: Omit<UseQueryOptions<TemplateDetailRESP, AxiosError<IBaseError>, TemplateDetailRESP, TemplateDetailQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TemplateDetailRESP, AxiosError<IBaseError>, TemplateDetailRESP, TemplateDetailQueryKey>({
    ...templateDetailQueryOptions(id ?? 0),
    enabled: id !== null,
    ...options,
  });
}

export function templateCopyPreviewQueryOptions(id: number) {
  return queryOptions<TemplateCopyPreviewRESP, AxiosError<IBaseError>, TemplateCopyPreviewRESP, TemplateCopyPreviewQueryKey>({
    queryKey: templateKeys.copyPreview(id),
    queryFn: () => getTemplateCopyPreviewAPI(id),
    staleTime: 0,
  });
}

export function useTemplateCopyPreviewQuery(
  id: number | null,
  options?: Omit<
    UseQueryOptions<TemplateCopyPreviewRESP, AxiosError<IBaseError>, TemplateCopyPreviewRESP, TemplateCopyPreviewQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<TemplateCopyPreviewRESP, AxiosError<IBaseError>, TemplateCopyPreviewRESP, TemplateCopyPreviewQueryKey>({
    ...templateCopyPreviewQueryOptions(id ?? 0),
    enabled: id !== null,
    ...options,
  });
}

export function useCreateTemplateMutation(options?: UseMutationOptions<TemplateDetailRESP, AxiosError<IBaseError>, TemplateWriteREQ>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => createTemplateAPI(payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateTemplateMutation(
  options?: UseMutationOptions<TemplateDetailRESP, AxiosError<IBaseError>, { id: number; payload: Partial<TemplateWriteREQ> }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => patchTemplateAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteTemplateMutation(options?: UseMutationOptions<void, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deleteTemplateAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCopyTemplateMutation(
  options?: UseMutationOptions<TemplateDetailRESP, AxiosError<IBaseError>, { id: number; payload: TemplateCopyREQ }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => copyTemplateAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
