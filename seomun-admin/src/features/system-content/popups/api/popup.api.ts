import { api } from '@/lib/api/api-client';

import { ENDPOINTS } from '@/config/endpoints';
import type { PopupListParams, PopupPayload } from './popup.request';
import type { Popup, PopupDetailRESP, PopupFilterFields, PopupFiltersRESP, PopupListRESP, PopupWriteRESP } from './popup.response';

export const getPopupsAPI = (params: PopupListParams): Promise<PopupListRESP> => api.get<PopupListRESP>(ENDPOINTS.POPUPS.LIST, { params });

export const getPopupByIdAPI = async (id: string): Promise<Popup> => {
  const response = await api.get<PopupDetailRESP>(ENDPOINTS.POPUPS.DETAIL(id));
  return response.data.popup;
};

export const createPopupAPI = async (payload: PopupPayload): Promise<Popup> => {
  const response = await api.post<PopupWriteRESP>(ENDPOINTS.POPUPS.CREATE, payload);
  return response.data;
};

export const updatePopupAPI = async (id: string, payload: PopupPayload): Promise<Popup> => {
  const response = await api.put<PopupWriteRESP>(ENDPOINTS.POPUPS.UPDATE(id), payload);
  return response.data;
};

export const deletePopupAPI = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.POPUPS.DELETE(id));
};

export const getPopupSearchFiltersAPI = async (): Promise<PopupFilterFields> => {
  const response = await api.get<PopupFiltersRESP>(ENDPOINTS.POPUPS.SEARCH_FILTERS);
  return response.data.filters;
};
