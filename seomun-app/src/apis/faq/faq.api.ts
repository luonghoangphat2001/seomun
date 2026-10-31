import { api } from '@/config';
import { FaqCountREQ, FaqListREQ } from './faq.request';
import { BaseResponse, PaginationResponse } from '@/types';
import { FaqCountRESP, FaqResponse } from './faq.response';

const ENDPOINT = {
  LIST: '/faqs',
  LIST_MYPAGE: '/mypage/faqs',
  COUNT_LIST: '/faqs/category-counts',
  COUNT_LIST_MYPAGE: '/mypage/faqs/category-counts',
};

export const FaqApi = {
  list: (params?: FaqListREQ, isMyPage = false) =>
    api.get<PaginationResponse<FaqResponse>>(isMyPage ? ENDPOINT.LIST_MYPAGE : ENDPOINT.LIST, { params }),
  count: (params?: FaqCountREQ, isMyPage = false) =>
    api.get<BaseResponse<FaqCountRESP>>(isMyPage ? ENDPOINT.COUNT_LIST_MYPAGE : ENDPOINT.COUNT_LIST, { params }),
};
