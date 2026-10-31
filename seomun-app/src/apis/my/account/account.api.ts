import { api } from '@/config';
import { BaseResponse, PaginationResponse } from '@/types';
import { MyAccountCertificateDetailRESP } from './account-certificate.response';
import { MyAccountHistoryListREQ } from './account-histories.request';
import { MyAccountHistoriesRESP } from './account-histories.response';
import { MyAccountChangeBankREQ } from './account.request';
import { MyAccountChangeBankRESP, MyAccountDetailRESP } from './account.response';

const ENDPOINT = {
  GET: '/mypage/account',
  CHANGE_BANK: '/mypage/account/bank',
  CERTIFICATE: '/mypage/account/certificate',
  HISTORIES: '/mypage/account/histories',
};

export const MyAccountApi = {
  get: () => api.get<BaseResponse<MyAccountDetailRESP>>(ENDPOINT.GET),
  getCertificate: () => api.get<BaseResponse<MyAccountCertificateDetailRESP>>(ENDPOINT.CERTIFICATE),
  changeBank: (body: MyAccountChangeBankREQ) => api.post<BaseResponse<MyAccountChangeBankRESP>>(ENDPOINT.CHANGE_BANK, body),
  histories: (params?: MyAccountHistoryListREQ) =>
    api.get<PaginationResponse<MyAccountHistoriesRESP>>(ENDPOINT.HISTORIES, { params }),
};
