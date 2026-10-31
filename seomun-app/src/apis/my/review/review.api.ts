import { api } from '@/config';
import { BaseResponse, PaginationResponse } from '@/types';
import { ReviewCreateREQ, ReviewListREQ, ReviewUnreviewedListREQ } from './review.request';
import { ReviewCreateRESP, ReviewListRESP, ReviewUnreviewedListAPIRESP } from './review.response';

const ENDPOINT = {
  LIST: '/mypage/reviews',
  UNREVIEWED_LIST: '/mypage/reviews/unreviewed',
};

export const ReviewApi = {
  list: (params?: ReviewListREQ) => api.get<PaginationResponse<ReviewListRESP>>(ENDPOINT.LIST, { params }),
  create: (body: ReviewCreateREQ) => api.post<BaseResponse<ReviewCreateRESP>>(ENDPOINT.LIST, body),
  unreviewedList: (params?: ReviewUnreviewedListREQ) =>
    api.get<PaginationResponse<ReviewUnreviewedListAPIRESP>>(ENDPOINT.UNREVIEWED_LIST, { params }),
};
