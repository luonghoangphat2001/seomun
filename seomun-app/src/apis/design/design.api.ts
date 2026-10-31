import { api } from '@/config';
import { DesignCreateREQ, DesignHistoryREQ, DesignUpdateREQ } from './design.request';
import { BaseResponse, PaginationResponse } from '@/types';
import { DesignCreateRESP, DesignDetailRESP, DesignHistoryListRESP } from './design.response';

const ENDPOINT = {
  ROOT: '/designs',
  HISTORY: '/mypage/designs',
};

export const DesignApi = {
  create: (body: DesignCreateREQ) => api.post<BaseResponse<DesignCreateRESP>>(ENDPOINT.ROOT, body),
  update: (body: DesignUpdateREQ) => api.put<BaseResponse<DesignCreateRESP>>(`${ENDPOINT.ROOT}/${body.id}`, body),
  detail: (designId: number) => api.get<BaseResponse<DesignDetailRESP>>(`${ENDPOINT.ROOT}/${designId}`),
  history: (params?: DesignHistoryREQ) => api.get<PaginationResponse<DesignHistoryListRESP>>(`${ENDPOINT.HISTORY}`, { params }),
};
