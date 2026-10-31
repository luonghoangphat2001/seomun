import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/config/endpoints';

import type { FaqCreateREQ, FaqListREQ, FaqUpdateREQ } from './faq.request';
import type { FaqDetailRESP, FaqFiltersRESP, FaqListRESP, FaqRESP, FaqSearchFiltersRESP, FaqWriteRESP } from './faq.response';

export const getFaqAPI = (params: FaqListREQ): Promise<FaqListRESP> => api.get<FaqListRESP>(ENDPOINTS.FAQS.LIST, { params });

export const getFaqByIdAPI = async (id: string): Promise<FaqRESP | null> => {
  const response = await api.get<FaqDetailRESP>(ENDPOINTS.FAQS.DETAIL(id));
  return response.data.faq;
};

export const createFaqAPI = async (payload: FaqCreateREQ): Promise<FaqRESP> => {
  const response = await api.post<FaqWriteRESP>(ENDPOINTS.FAQS.CREATE, payload);
  return response.data.faq;
};

export const editFaqAPI = async (id: string, payload: FaqUpdateREQ): Promise<FaqRESP> => {
  const response = await api.put<FaqWriteRESP>(ENDPOINTS.FAQS.UPDATE(id), payload);
  return response.data.faq;
};

export const deleteFaqAPI = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.FAQS.DELETE(id));
};

export const getFaqSearchFilterAPI = async (): Promise<FaqFiltersRESP> => {
  const response = await api.get<FaqSearchFiltersRESP>(ENDPOINTS.FAQS.SEARCH_FILTERS);
  return response.data.filters;
};
