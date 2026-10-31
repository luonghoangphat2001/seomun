import { api } from '@/config';
import { WithdrawalREQ } from './withdrawal.request';
import { BaseResponse } from '@/types';
import { WithdrawalCheckRESP } from './withdrawal.response';

const ENDPOINT = {
  CHECK: '/mypage/withdrawal/check',
  WITHDRAWAL: '/mypage/withdrawal',
};

export const WithDrawalApi = {
  checkAbleToWithDrawal: () => api.get<BaseResponse<WithdrawalCheckRESP>>(ENDPOINT.CHECK),
  withDrawalAccount: (body: WithdrawalREQ) => api.post<BaseResponse<null>>(ENDPOINT.WITHDRAWAL, body),
};
