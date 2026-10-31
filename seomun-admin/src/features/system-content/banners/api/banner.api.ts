import { api } from '@/lib/api/api-client';

import { ENDPOINTS } from '@/config/endpoints';
import type { BannerListParams, BannerPayload } from './banner.request';
import type { Banner, BannerDetailRESP, BannerFilterFields, BannerFiltersRESP, BannerListRESP, BannerWriteRESP } from './banner.response';

export const getBannersAPI = (params: BannerListParams): Promise<BannerListRESP> => api.get<BannerListRESP>(ENDPOINTS.BANNERS.LIST, { params });

export const getBannerByIdAPI = async (id: string): Promise<Banner> => {
  const response = await api.get<BannerDetailRESP>(ENDPOINTS.BANNERS.DETAIL(id));
  return response.data.banner;
};

export const createBannerAPI = async (payload: BannerPayload): Promise<Banner> => {
  const response = await api.post<BannerWriteRESP>(ENDPOINTS.BANNERS.CREATE, payload);
  return response.data;
};

export const updateBannerAPI = async (id: string, payload: BannerPayload): Promise<Banner> => {
  const response = await api.put<BannerWriteRESP>(ENDPOINTS.BANNERS.UPDATE(id), payload);
  return response.data;
};

export const deleteBannerAPI = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.BANNERS.DELETE(id));
};

export const getBannerSearchFiltersAPI = async (): Promise<BannerFilterFields> => {
  const response = await api.get<BannerFiltersRESP>(ENDPOINTS.BANNERS.SEARCH_FILTERS);
  return response.data.filters;
};
