import { api } from '@/config';
import { GuideListREQ } from './guide.request';
import { PaginationResponse } from '@/types';
import { GuideListRESP } from './guide.response';

const ENDPOINTS = {
  ROOT: '/guide-contents',
};

export const GuideApi = {
  getList: (params?: GuideListREQ) => api.get<PaginationResponse<GuideListRESP>>(ENDPOINTS.ROOT, { params }),
};
