import { api } from '@/lib/api/api-client';

import { ENDPOINTS } from '@/config/endpoints';
import type { NoticeListParams, NoticePayload } from './notice.request';
import type { Notice, NoticeDetailRESP, NoticeFilterFields, NoticeFiltersRESP, NoticeListRESP, NoticeWriteRESP } from './notice.response';

export const getNoticesAPI = (params: NoticeListParams): Promise<NoticeListRESP> => api.get<NoticeListRESP>(ENDPOINTS.NOTICES.LIST, { params });

export const getNoticeByIdAPI = async (id: string): Promise<Notice> => {
  const response = await api.get<NoticeDetailRESP>(ENDPOINTS.NOTICES.DETAIL(id));
  return response.data.notice;
};

export const createNoticeAPI = async (payload: NoticePayload): Promise<Notice> => {
  const response = await api.post<NoticeWriteRESP>(ENDPOINTS.NOTICES.CREATE, payload);
  return response.data;
};

export const updateNoticeAPI = async (id: string, payload: NoticePayload): Promise<Notice> => {
  const response = await api.put<NoticeWriteRESP>(ENDPOINTS.NOTICES.UPDATE(id), payload);
  return response.data;
};

export const deleteNoticeAPI = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.NOTICES.DELETE(id));
};

export const getNoticeSearchFiltersAPI = async (): Promise<NoticeFilterFields> => {
  const response = await api.get<NoticeFiltersRESP>(ENDPOINTS.NOTICES.SEARCH_FILTERS);
  return response.data.filters;
};
