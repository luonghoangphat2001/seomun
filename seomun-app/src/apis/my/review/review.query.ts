import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BaseResponse, ErrorRESP, PaginationRESP, PaginationResponse } from '@/types';
import { ReviewApi } from './review.api';
import { ReviewCreateREQ, ReviewListREQ, ReviewUnreviewedListREQ } from './review.request';
import {
  ReviewCreateRESP,
  ReviewItemRESP,
  ReviewListRESP,
  ReviewUnreviewedListAPIRESP,
  ReviewUnreviewedListRESP,
  ReviewUnreviewedOrderItemRESP,
  ReviewUnreviewedProductRESP,
} from './review.response';

export const REVIEW_QUERY_KEYS = {
  LIST: 'REVIEW_LIST',
  UNREVIEWED_LIST: 'REVIEW_UNREVIEWED_LIST',
};

const mapUnreviewedProduct = (
  product?: ReviewUnreviewedListAPIRESP['order_items'][number]['product'],
): ReviewUnreviewedProductRESP | undefined => {
  if (!product) return undefined;

  const categoryValue =
    typeof product.category === 'object' && product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : product.category || undefined;

  return {
    id: product.id,
    name: product.name,
    name_en: product.name_en || product.name,
    slug: product.slug || '',
    sku: product.sku,
    first_image: product.images?.[0] || '',
    images: product.images || [],
    category: categoryValue,
    short_description: product?.short_description || '',
  };
};

const mapUnreviewedOrderItem = (item: ReviewUnreviewedListAPIRESP['order_items'][number]): ReviewUnreviewedOrderItemRESP => {
  const product = mapUnreviewedProduct(item.product);
  const categoryName =
    typeof item.product?.category === 'string'
      ? item.product.category
      : item.product?.category?.name?.ko || item.product?.category?.name?.en || '-';

  return {
    id: item.id,
    order_id: item.order_id,
    order_number: item.order_number ?? item.order?.order_number ?? (item.order_id ? String(item.order_id) : undefined),
    product_id: item.product_id,
    title: item.title,
    quantity: item.quantity,
    multiplier: item.multiplier,
    number_of_cases: item.number_of_cases ?? 1,
    production_days: item.production_days,
    total_quantity: item.total_quantity,
    unit: item.unit,
    unit_price: String(item.unit_price),
    total_price: String(item.total_price),
    configuration: item.configuration,
    notes: item.notes,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product,
    product_snapshot: product
      ? {
          id: product.id,
          name: product.name,
          name_en: product.name_en,
          slug: product.slug,
          category: categoryName,
        }
      : undefined,
  };
};

export const useReviewListQuery = (
  params?: ReviewListREQ,
  options?: Omit<
    UseQueryOptions<
      PaginationResponse<ReviewListRESP>,
      AxiosError<ErrorRESP>,
      { reviews: ReviewItemRESP[]; pagination: PaginationRESP }
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [REVIEW_QUERY_KEYS.LIST, params],
    queryFn: () => ReviewApi.list(params),
    select: (resp) => ({
      reviews: resp.data.reviews,
      pagination: resp.pagination,
    }),
    ...options,
  });

export const useReviewCreateMutation = (
  options?: UseMutationOptions<BaseResponse<ReviewCreateRESP>, AxiosError<ErrorRESP>, ReviewCreateREQ>,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options ?? {};

  return useMutation({
    mutationFn: ReviewApi.create,
    ...mutationOptions,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.LIST] });
      await queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.UNREVIEWED_LIST] });
      await onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useReviewUnreviewedListQuery = (
  params?: ReviewUnreviewedListREQ,
  options?: Omit<
    UseQueryOptions<PaginationResponse<ReviewUnreviewedListAPIRESP>, AxiosError<ErrorRESP>, ReviewUnreviewedListRESP>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [REVIEW_QUERY_KEYS.UNREVIEWED_LIST, params],
    queryFn: () => ReviewApi.unreviewedList(params),
    select: (resp) => ({
      order_items: resp.data.order_items.map(mapUnreviewedOrderItem),
      pagination: resp.pagination,
    }),
    ...options,
  });
