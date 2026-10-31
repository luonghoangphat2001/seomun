import { api } from '@/config';
import { NoticeListREQ } from './notice.request';
import { BaseResponse, PaginationResponse } from '@/types';
import { NoticeDetailResponse, NoticeResponse } from './notice.response';
import { NoticeCategory } from '@/enums/notice';

const ENDPOINT = {
  LIST: '/notices',
  LIST_MYPAGE: '/mypage/notices',
  DETAIL: (id: number) => `/notices/${id}`,
  DETAIL_MYPAGE: (id: number) => `/mypage/notices/${id}`,
};

export const NoticeApi = {
  list: (params?: NoticeListREQ, isMyPage = false) =>
    api.get<PaginationResponse<NoticeResponse>>(isMyPage ? ENDPOINT.LIST_MYPAGE : ENDPOINT.LIST, {
      params: { ...params, type: params?.type === NoticeCategory.ALL ? undefined : params?.type },
    }),
  detail: (id: number, isMyPage = false) =>
    api.get<BaseResponse<NoticeDetailResponse>>(isMyPage ? ENDPOINT.DETAIL_MYPAGE(id) : ENDPOINT.DETAIL(id)),
};
