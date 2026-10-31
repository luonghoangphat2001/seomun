import { api } from '@/config';
import { BaseResponse, PaginationREQ } from '@/types';
import { PopupListRESP } from './popup.response';

const ENDPOINTS = {
  POPUP_LIST: `/popups`,
};

export const PopupApi = {
  getList: (params?: PaginationREQ) => api.get<BaseResponse<PopupListRESP>>(ENDPOINTS.POPUP_LIST, { params }),
};
