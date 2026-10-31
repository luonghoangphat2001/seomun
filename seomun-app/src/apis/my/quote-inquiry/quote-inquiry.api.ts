import { api } from '@/config';
import { BaseResponse, PaginationResponse } from '@/types';
import { QuoteInquiryCommentCreateREQ, QuoteInquiryCreateREQ, QuoteInquiryListREQ } from './quote-inquiry.request';
import {
  QuoteInquiryCommentCreateRESP,
  QuoteInquiryCreateRESP,
  QuoteInquiryDetailRESP,
  QuoteInquiryListRESP,
} from './quote-inquiry.response';

const ENDPOINT = {
  LIST: '/mypage/inquiries',
  CREATE: '/mypage/inquiries',
  DETAIL: (id: number) => `/mypage/inquiries/${id}`,
  COMMENTS: (id: number) => `/mypage/inquiries/${id}/comments`,
};

export const QuoteInquiryApi = {
  list: (params?: QuoteInquiryListREQ) => api.get<PaginationResponse<QuoteInquiryListRESP>>(ENDPOINT.LIST, { params }),
  create: (body: QuoteInquiryCreateREQ) =>
    api.post<BaseResponse<QuoteInquiryCreateRESP>>(ENDPOINT.CREATE, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  detail: (id: number) => api.get<BaseResponse<QuoteInquiryDetailRESP>>(ENDPOINT.DETAIL(id)),
  createComment: (body: QuoteInquiryCommentCreateREQ) => {
    const formData = new FormData();
    formData.append('content', body.content);

    if (body.manager_name) {
      formData.append('manager_name', body.manager_name);
    }

    body.attachments?.forEach((file) => {
      formData.append('attachments[]', file);
    });

    return api.post<BaseResponse<QuoteInquiryCommentCreateRESP>>(ENDPOINT.COMMENTS(body.id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
