import { api } from '@/config';
import { OrderCreateREQ, OrderDesignReviewReplyREQ } from './order.request';
import { BaseResponse } from '@/types';
import { OrderCreateResponse, OrderDesignReviewRESP } from './order.response';

export const ENDPOINTS = {
  CREATE_ORDER: '/orders',
  GET_ORDER_DETAIL: (orderNumber: string) => `/orders/${orderNumber}`,
  DESIGN_REVIEW: (token: string) => `/design-reviews/${token}`,
  DESIGN_REVIEW_REPLY: (token: string) => `/design-reviews/${token}/responses`,
};

export const OrderApi = {
  createOrderProduct: (body: OrderCreateREQ) => api.post<BaseResponse<OrderCreateResponse>>(ENDPOINTS.CREATE_ORDER, body),
  getOrderDetailByNumber: (orderNumber: string) =>
    api.get<BaseResponse<OrderCreateResponse>>(ENDPOINTS.GET_ORDER_DETAIL(orderNumber)),
  getDesignReview: (token: string) => api.get<BaseResponse<OrderDesignReviewRESP>>(ENDPOINTS.DESIGN_REVIEW(token)),
  replyDesignReview: (body: OrderDesignReviewReplyREQ) =>
    api.post<BaseResponse<unknown>>(ENDPOINTS.DESIGN_REVIEW_REPLY(body.token), body),
};
