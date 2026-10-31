import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type { GuideListParams, GuidePayload } from './guide.request';
import type { Guide, GuideDetailRESP, GuideFilterFields, GuideFiltersRESP, GuideListRESP, GuideWriteRESP } from './guide.response';

export const getGuidesAPI = (params: GuideListParams): Promise<GuideListRESP> => api.get<GuideListRESP>(ENDPOINTS.GUIDE.LIST, { params });

export const getGuideByIdAPI = async (id: string): Promise<Guide> => {
  const response = await api.get<GuideDetailRESP>(ENDPOINTS.GUIDE.DETAIL(id));
  return response.data.guide_content;
};

export const createGuideAPI = async (payload: GuidePayload): Promise<Guide> => {
  const response = await api.post<GuideWriteRESP>(ENDPOINTS.GUIDE.CREATE, payload);
  return response.data.guide_content;
};

export const updateGuideAPI = async (id: string, payload: GuidePayload): Promise<Guide> => {
  const response = await api.put<GuideWriteRESP>(ENDPOINTS.GUIDE.UPDATE(id), payload);
  return response.data.guide_content;
};

export const deleteGuideAPI = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.GUIDE.DELETE(id));
};

export const getGuideSearchFiltersAPI = async (): Promise<GuideFilterFields> => {
  const response = await api.get<GuideFiltersRESP>(ENDPOINTS.GUIDE.SEARCH_FILTERS);
  return response.data.filters;
};
