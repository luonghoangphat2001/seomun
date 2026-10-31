import { keepPreviousData, useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BaseResponse, ErrorRESP } from '@/types';
import { ProductApi } from './product.api';
import {
  ProductsByCategoryRESP,
  ProductSpineResponse,
  ProductUnitPriceSettingRESP,
  ProductUploadFileResponse,
} from './product.response';
import {
  ProductDetailReviewREQ,
  ProductQuoteREQ,
  ProductSearchREQ,
  ProductSpineREQ,
  ProductTemplateREQ,
  ProductUploadFileREQ,
} from './product.request';

export const productQueryKeys = {
  all: ['products'] as const,
  byCategory: (slug: string) => [...productQueryKeys.all, 'category', slug] as const,
  PRODUCT_DETAIL: 'PRODUCT_DETAIL',
  PAPER: 'PRODUCT_PAPER',
  ALL_PAPER: 'PRODUCT_ALL_PAPER',
  SIZE_OPTION: 'PRODUCT_SIZE_OPTION',
  PRODUCT_TEMPLATE: 'PRODUCT_TEMPLATE',
  PRODUCT_SEARCH: 'PRODUCT_SEARCH',
  PRODUCT_QUOTATION: 'PRODUCT_QUOTATION',
  ORDER_QUOTATION: 'ORDER_QUOTATION',
  PRODUCT_DETAIL_REVIEW: 'PRODUCT_DETAIL_REVIEW',
  PRODUCT_UNIT_PRICE_SETTING: 'PRODUCT_UNIT_PRICE_SETTING',
};

export const useGetProductByCategoryQuery = (
  slug: string,
  options?: Omit<UseQueryOptions<BaseResponse<ProductsByCategoryRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: productQueryKeys.byCategory(slug),
    queryFn: () => ProductApi.getProductByCategory({ slug }),
    enabled: !!slug,
    ...options,
  });

export const useProductBySlugQuery = (slug?: string) =>
  useQuery({
    queryKey: [productQueryKeys.PRODUCT_DETAIL, slug],
    queryFn: () => ProductApi.getProductDetailBySlug(slug as string),
    select: (resp) => resp.data.product,
    enabled: !!slug,
  });

export const useGetPaperByProductQuery = (productId?: number) =>
  useQuery({
    queryKey: [productQueryKeys.PAPER, productId],
    queryFn: () => ProductApi.getPaperTypeByProduct(productId as number),
    select: (resp) => resp.data.paper_types,
    enabled: !!productId,
  });

export const useGetAllPaperQuery = (enabled = true) =>
  useQuery({
    queryKey: [productQueryKeys.ALL_PAPER],
    queryFn: () => ProductApi.getAllPaper(),
    select: (resp) => resp.data.papers,
    enabled,
  });

export const useGetSizeOptionsByProductQuery = (productId?: number) =>
  useQuery({
    queryKey: [productQueryKeys.SIZE_OPTION, productId],
    queryFn: () => ProductApi.getSizeOptionsByProduct(productId as number),
    select: (resp) => resp.data.size_options,
    enabled: !!productId,
  });

export const useGetTemplatesByProductQuery = (params: ProductTemplateREQ) =>
  useQuery({
    queryKey: [productQueryKeys.PRODUCT_TEMPLATE, params],
    queryFn: () => ProductApi.getTemplatesByProduct(params),
    select: (resp) => resp.data.templates,
    enabled: !!params.slug,
  });

export const useSearchProductQuery = (params?: ProductSearchREQ) =>
  useQuery({
    queryKey: [productQueryKeys.PRODUCT_SEARCH, params],
    queryFn: () => ProductApi.getProductBySearch(params),
    select: (resp) => ({
      list: resp.data.products,
      pagination: resp.pagination,
    }),
  });

export const useOrderQuotationQuery = (body?: ProductQuoteREQ) =>
  useQuery({
    queryKey: [productQueryKeys.ORDER_QUOTATION, body],
    queryFn: () => ProductApi.getOrderQuotation(body as ProductQuoteREQ),
    select: (resp) => resp.data,
    enabled: !!body,
  });

export const useProductQuotationQuery = (body?: ProductQuoteREQ) =>
  useQuery({
    queryKey: [productQueryKeys.PRODUCT_QUOTATION, body],
    queryFn: () => ProductApi.getProductQuotation(body as ProductQuoteREQ),
    select: (resp) => resp.data,
    enabled: !!body,
    // placeholderData: keepPreviousData,
    retry: 1,
  });

export const useProductReviewListQuery = (params?: ProductDetailReviewREQ) =>
  useQuery({
    queryKey: [productQueryKeys.PRODUCT_DETAIL_REVIEW, params],
    queryFn: () => ProductApi.getReviewList(params as ProductDetailReviewREQ),
    select: (resp) => resp.data.reviews,
    enabled: !!params?.slug,
    placeholderData: keepPreviousData,
  });

export const useGetProductUnitPriceSettingQuery = (productSlug?: string) =>
  useQuery({
    queryKey: [productQueryKeys.PRODUCT_UNIT_PRICE_SETTING, productSlug],
    queryFn: () => ProductApi.getProductUnitPriceSetting(productSlug as string),
    select: (resp) => resp.data as ProductUnitPriceSettingRESP[],
    enabled: !!productSlug,
  });

export const useUploadProductFileMutation = (
  options?: UseMutationOptions<BaseResponse<ProductUploadFileResponse>, AxiosError<ErrorRESP>, ProductUploadFileREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: ProductApi.uploadProductFile,
  });

export const useProductSpineMutation = (
  options?: UseMutationOptions<BaseResponse<ProductSpineResponse>, AxiosError<ErrorRESP>, ProductSpineREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: ProductApi.calculateProductSpine,
  });
