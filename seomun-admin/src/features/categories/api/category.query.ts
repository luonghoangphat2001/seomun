import {
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { CategoryCreateREQ, CategoryListREQ, CategorySortOrderREQ, CategoryUpdateREQ, ExportCategoriesREQ } from './category.request';
import type {
  Category,
  CategoryActionRESP,
  CategoryFilterOptionRESP,
  CategoryListRESP,
  CategorySortOrderRESP,
  UploadExposureImageRESP,
} from '../api/category.response';
import { CATEGORY_EXPORT_MAX_ATTEMPTS, CATEGORY_EXPORT_POLL_INTERVAL_MS } from '../constants';
import { ExportStatus } from '../enums';
import { getCompletedExportResult, parseCategoryExportStatus, type CategoryExportResult } from '../utils/category-export';
import { categoryApi } from './category.api';

const DEFAULT_CATEGORY_INFINITE_PER_PAGE = 20;

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: CategoryListREQ) => [...categoryKeys.lists(), params] as const,
  infinite: (params: CategoryListREQ) => [...categoryKeys.lists(), 'infinite', params] as const,
  filters: () => [...categoryKeys.all, 'search-filters'] as const,
  detail: (categoryId: number) => [...categoryKeys.all, 'detail', categoryId] as const,
};

type CategoryListQueryKey = ReturnType<typeof categoryKeys.list>;
type CategoryFiltersQueryKey = ReturnType<typeof categoryKeys.filters>;
type CategoryDetailQueryKey = ReturnType<typeof categoryKeys.detail>;
type CategoryUploadImageVariables = { file: File; type: 'banner' | 'icon' };

export function categoryListQueryOptions(params: CategoryListREQ) {
  return queryOptions<CategoryListRESP, AxiosError<IBaseError>, CategoryListRESP, CategoryListQueryKey>({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryApi.getCategoryList(params),
    staleTime: 30_000,
  });
}

export function useCategoryListQuery(
  params: CategoryListREQ,
  options?: Omit<UseQueryOptions<CategoryListRESP, AxiosError<IBaseError>, CategoryListRESP, CategoryListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CategoryListRESP, AxiosError<IBaseError>, CategoryListRESP, CategoryListQueryKey>({
    ...categoryListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useCategoriesInfiniteQuery(params: Omit<CategoryListREQ, 'page'>, options?: { enabled?: boolean }) {
  const search = { ...params, per_page: params.per_page ?? DEFAULT_CATEGORY_INFINITE_PER_PAGE };

  return useInfiniteQuery({
    queryKey: categoryKeys.infinite(search),
    queryFn: ({ pageParam }) => categoryApi.getCategoryList({ ...search, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.current_page < lastPage.pagination.total_page ? lastPage.pagination.current_page + 1 : undefined,
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

export function categorySearchFiltersQueryOptions() {
  return queryOptions<CategoryFilterOptionRESP, AxiosError<IBaseError>, CategoryFilterOptionRESP, CategoryFiltersQueryKey>({
    queryKey: categoryKeys.filters(),
    queryFn: categoryApi.getCategorySearchFilters,
    staleTime: 300_000,
  });
}

export function useCategorySearchFiltersQuery(
  options?: Omit<
    UseQueryOptions<CategoryFilterOptionRESP, AxiosError<IBaseError>, CategoryFilterOptionRESP, CategoryFiltersQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<CategoryFilterOptionRESP, AxiosError<IBaseError>, CategoryFilterOptionRESP, CategoryFiltersQueryKey>({
    ...categorySearchFiltersQueryOptions(),
    ...options,
  });
}

export function categoryDetailQueryOptions(categoryId: number) {
  return queryOptions<Category | null, AxiosError<IBaseError>, Category | null, CategoryDetailQueryKey>({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: async () => {
      const response = await categoryApi.getCategoryDetail(categoryId);
      return response.data.category;
    },
    staleTime: 30_000,
    enabled: categoryId > 0,
  });
}

export function useCategoryDetailQuery(
  categoryId: number,
  options?: Omit<UseQueryOptions<Category | null, AxiosError<IBaseError>, Category | null, CategoryDetailQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Category | null, AxiosError<IBaseError>, Category | null, CategoryDetailQueryKey>({
    ...categoryDetailQueryOptions(categoryId),
    ...options,
  });
}

export function useDeleteCategoryMutation(options?: UseMutationOptions<CategoryActionRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: categoryApi.deleteCategory,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCreateCategoryMutation(options?: UseMutationOptions<Category, AxiosError<IBaseError>, CategoryCreateREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (data) => {
      const response = await categoryApi.createCategory(data);
      return response.data.category;
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCategoryMutation(categoryId: number, options?: UseMutationOptions<Category, AxiosError<IBaseError>, CategoryUpdateREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (data) => {
      const response = await categoryApi.updateCategory(categoryId, data);
      return response.data.category;
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: categoryKeys.detail(categoryId) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCategorySortOrderMutation(
  options?: UseMutationOptions<CategorySortOrderRESP, AxiosError<IBaseError>, CategorySortOrderREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: categoryApi.updateCategorySortOrder,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: async (error, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      await options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useExportCategoriesMutation(options?: UseMutationOptions<CategoryExportResult, Error, ExportCategoriesREQ>) {
  return useMutation({
    ...options,
    mutationFn: async (payload) => {
      const response = await categoryApi.exportCategoriesToExcel(payload);

      if (!response.success || !response.data?.history?.id) {
        throw new Error('Export initiation failed');
      }

      const initialHistory = response.data.history;
      const initialStatus = parseCategoryExportStatus(initialHistory.status);
      const completedResult = getCompletedExportResult(initialStatus, initialHistory.file_path, initialHistory.file_name);
      if (completedResult) return completedResult;
      if (initialStatus === ExportStatus.FAILED) throw new Error('Export failed');

      for (let attempt = 0; attempt < CATEGORY_EXPORT_MAX_ATTEMPTS; attempt++) {
        const statusResponse = await categoryApi.checkExportStatus(initialHistory.id);
        if (!statusResponse.success || !statusResponse.data?.history) {
          throw new Error('Export status check failed');
        }

        const { file_path, file_name } = statusResponse.data.history;
        const status = parseCategoryExportStatus(statusResponse.data.history.status);
        const result = getCompletedExportResult(status, file_path, file_name);
        if (result) return result;

        if (status === ExportStatus.FAILED) {
          throw new Error('Export failed');
        }

        if (attempt < CATEGORY_EXPORT_MAX_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, CATEGORY_EXPORT_POLL_INTERVAL_MS));
        }
      }

      throw new Error('Export timeout');
    },
  });
}

export function useUploadExposureImageMutation(
  options?: UseMutationOptions<UploadExposureImageRESP, AxiosError<IBaseError>, CategoryUploadImageVariables>,
) {
  return useMutation({
    ...options,
    mutationFn: ({ file, type }) => categoryApi.uploadExposureImage(file, type),
  });
}
