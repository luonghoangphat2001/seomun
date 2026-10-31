import { api } from '@/config';
import { BaseResponse } from '@/types';
import { DesignsListREQ } from './designs.request';
import { DesignAvailableSizesDataRESP, DesignListDataRESP } from './designs.response';

const ENDPOINT = {
  LIST: '/mypage/designs',
  AVAILABLE_SIZES: '/mypage/designs/available_sizes',
};

export const DesignsApi = {
  list: (params?: DesignsListREQ) => api.get<BaseResponse<DesignListDataRESP>>(ENDPOINT.LIST, { params }),
  availableSizes: () => api.get<BaseResponse<DesignAvailableSizesDataRESP>>(ENDPOINT.AVAILABLE_SIZES),
};
