import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BaseResponse, ErrorRESP } from '@/types';
import { CategoryApi } from './category.api';
import { CategoryREQ } from './category.request';
import { CategoryRESP } from './category.response';

export const CATEGORY_QUERY_KEYS = {
  LIST: 'CATEGORY_LIST',
};

export const useCategoryListQuery = (
  params?: CategoryREQ,
  options?: Omit<UseQueryOptions<BaseResponse<CategoryRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.LIST, params],
    queryFn: () => CategoryApi.getList(params),
    ...options,
  });
