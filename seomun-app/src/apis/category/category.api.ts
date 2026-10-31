import { fetcher } from '@/config';
import { BaseResponse } from '@/types';
import { CategoryREQ } from './category.request';
import { CategoryRESP } from './category.response';

export const ENDPOINTS = {
  CATEGORY_LIST: '/categories',
};

export const CategoryApi = {
  getList: (params: CategoryREQ = {}, requestOption?: RequestInit) =>
    fetcher.get<BaseResponse<CategoryRESP>>(ENDPOINTS.CATEGORY_LIST, {
      params: { ...(params ?? {}) },
      ...requestOption,
    }),
};
