import { api } from '@/config';
import { BaseResponse } from '@/types';
import { VirtualAccountCreateREQ } from './virtual-account.request';
import { VirtualAccountCreateRESP, VirtualAccountDetailRESP } from './virtual-account.response';

const ENDPOINT = {
  GET: '/mypage/virtual-accounts',
  CREATE: '/mypage/virtual-accounts',
  UPDATE: '/mypage/virtual-accounts',
};

export const VirtualAccountApi = {
  get: () => api.get<BaseResponse<VirtualAccountDetailRESP>>(ENDPOINT.GET),
  create: (body: VirtualAccountCreateREQ) => api.post<BaseResponse<VirtualAccountCreateRESP>>(ENDPOINT.CREATE, body),
  update: (body: VirtualAccountCreateREQ) => api.put<BaseResponse<VirtualAccountCreateRESP>>(ENDPOINT.UPDATE, body),
};
