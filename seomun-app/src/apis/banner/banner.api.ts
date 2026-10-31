import { fetcher } from '@/config';
import { BaseResponse } from '@/types';
import { BannerRESP } from './banner.response';

export const ENDPOINTS = {
  BANNER_LIST: (type: string) => `/banners/${type}`,
};

export const BannerApi = {
  getList: (type: string, requestOption?: RequestInit) =>
    fetcher.get<BaseResponse<BannerRESP>>(ENDPOINTS.BANNER_LIST(type), {
      ...requestOption,
    }),
};
