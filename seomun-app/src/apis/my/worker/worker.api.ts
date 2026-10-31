import { api } from '@/config';
import { WorkerCreateREQ, WorkerListREQ, WorkerSendCodeREQ, WorkerUpdateREQ, WorkerVerifyCode } from './worker.request';
import { BaseResponse, PaginationResponse } from '@/types';
import { WorkerDetailResponse, WorkerResponse } from './worker.response';

const ENDPOINT = {
  ROOT: '/mypage/workers',
  DETAIL: (id: number) => `${ENDPOINT.ROOT}/${id}`,
  DELETE: '/mypage/workers/batch',
  SEND_CODE: '/mypage/workers/send-verification-code',
  VERIFY_CODE: '/mypage/workers/verify-code',
};

export const WorkerApi = {
  list: (params?: WorkerListREQ) => api.get<PaginationResponse<WorkerResponse>>(ENDPOINT.ROOT, { params }),
  detail: (id: number) => api.get<BaseResponse<WorkerDetailResponse>>(ENDPOINT.DETAIL(id)),
  create: (body: WorkerCreateREQ) => api.post(ENDPOINT.ROOT, body),
  update: (body: WorkerUpdateREQ) => api.put(ENDPOINT.DETAIL(body.id), body),
  delete: (ids: number[]) => api.delete(ENDPOINT.DELETE, { ids }),
  sendCode: (body: WorkerSendCodeREQ) => api.post(ENDPOINT.SEND_CODE, body),
  verifyCode: (body: WorkerVerifyCode) => api.post(ENDPOINT.VERIFY_CODE, body),
};
