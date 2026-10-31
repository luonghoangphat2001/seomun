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

import type { ProductListSearch } from '../schemas';
import { buildProductListParams } from '../utils/product-list-params';
import type { ProductCreateREQ, ProductListREQ, ProductUpdateREQ } from './product.request';
import type {
  ErpOptionGroupsRESP,
  ProductCreateRESP,
  ProductDetailRESP,
  ProductListLocale,
  ProductListRESP,
  ProductUpdateRESP,
} from './product.response';
import { createProduct, deleteProduct, getErpOptionGroups, getProductDetail, getProductList, updateProduct } from './product.service';
import { DEFAULT_INFINITE_PER_PAGE } from '../constants';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListREQ, locale: ProductListLocale) => [...productKeys.lists(), locale, params] as const,
  infinite: (params: ProductListREQ, locale: ProductListLocale) => [...productKeys.lists(), 'infinite', locale, params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
  erpOptionGroups: () => [...productKeys.all, 'erp-option-groups'] as const,
};

type ProductListQueryKey = ReturnType<typeof productKeys.list>;
type ProductDetailQueryKey = ReturnType<typeof productKeys.detail>;
type ErpOptionGroupsQueryKey = ReturnType<typeof productKeys.erpOptionGroups>;

export function productListQueryOptions(params: ProductListREQ, locale: ProductListLocale = 'en') {
  return queryOptions<ProductListRESP, AxiosError<IBaseError>, ProductListRESP, ProductListQueryKey>({
    queryKey: productKeys.list(params, locale),
    queryFn: () => getProductList(params, locale),
    staleTime: 30_000,
  });
}

export function productListQueryOptionsBySearch(search: ProductListSearch, locale: ProductListLocale = 'en') {
  return productListQueryOptions(buildProductListParams(search), locale);
}

export function productDetailQueryOptions(productId: string) {
  return queryOptions<ProductDetailRESP, AxiosError<IBaseError>, ProductDetailRESP, ProductDetailQueryKey>({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductDetail(productId),
    staleTime: 30_000,
  });
}

export function useProductsQuery(
  params: ProductListREQ,
  locale: ProductListLocale = 'en',
  options?: Omit<UseQueryOptions<ProductListRESP, AxiosError<IBaseError>, ProductListRESP, ProductListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ProductListRESP, AxiosError<IBaseError>, ProductListRESP, ProductListQueryKey>({
    ...productListQueryOptions(params, locale),
    ...options,
    // placeholderData: keepPreviousData,
  });
}

export function useProductsInfiniteQuery(params: Omit<ProductListREQ, 'page'>, locale: ProductListLocale = 'en', options?: { enabled?: boolean }) {
  const search = { ...params, per_page: params.per_page ?? DEFAULT_INFINITE_PER_PAGE };

  return useInfiniteQuery({
    queryKey: productKeys.infinite(search, locale),
    queryFn: ({ pageParam }) => getProductList({ ...search, page: pageParam }, locale),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.current_page < lastPage.pagination.total_page ? lastPage.pagination.current_page + 1 : undefined,
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

export function useProductDetailQuery(
  productId: string,
  options?: Omit<UseQueryOptions<ProductDetailRESP, AxiosError<IBaseError>, ProductDetailRESP, ProductDetailQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ProductDetailRESP, AxiosError<IBaseError>, ProductDetailRESP, ProductDetailQueryKey>({
    ...productDetailQueryOptions(productId),
    ...options,
  });
}

export function erpOptionGroupsQueryOptions() {
  return queryOptions<ErpOptionGroupsRESP, AxiosError<IBaseError>, ErpOptionGroupsRESP, ErpOptionGroupsQueryKey>({
    queryKey: productKeys.erpOptionGroups(),
    queryFn: getErpOptionGroups,
    staleTime: 300_000,
  });
}

export function useErpOptionGroupsQuery(
  options?: Omit<UseQueryOptions<ErpOptionGroupsRESP, AxiosError<IBaseError>, ErpOptionGroupsRESP, ErpOptionGroupsQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ErpOptionGroupsRESP, AxiosError<IBaseError>, ErpOptionGroupsRESP, ErpOptionGroupsQueryKey>({
    ...erpOptionGroupsQueryOptions(),
    ...options,
  });
}

export function useCreateProductMutation(options?: UseMutationOptions<ProductCreateRESP, AxiosError<IBaseError>, ProductCreateREQ>) {
  const queryClient = useQueryClient();

  return useMutation<ProductCreateRESP, AxiosError<IBaseError>, ProductCreateREQ>({
    ...options,
    mutationFn: createProduct,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateProductMutation(
  productId: string,
  options?: UseMutationOptions<ProductUpdateRESP, AxiosError<IBaseError>, ProductUpdateREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation<ProductUpdateRESP, AxiosError<IBaseError>, ProductUpdateREQ>({
    ...options,
    mutationFn: (payload) => updateProduct(productId, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) }),
      ]);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteProductMutation(options?: UseMutationOptions<ProductUpdateRESP, AxiosError<IBaseError>, string>) {
  const queryClient = useQueryClient();

  return useMutation<ProductUpdateRESP, AxiosError<IBaseError>, string>({
    ...options,
    mutationFn: deleteProduct,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
