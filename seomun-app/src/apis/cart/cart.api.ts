import { api } from '@/config';
import { CartAddItemREQ, CartDeleteBatchREQ, CartListREQ, CartOrderREQ, CartQuoteREQ } from './cart.request';
import { BaseResponse } from '@/types';
import { CartListResponse, CartQuoteRESP } from './cart.response';
import { OrderCreateResponse } from '../order/order.response';

export const ENDPOINTS = {
  ADD_TO_CART: '/mypage/cart',
  CART_LIST: '/mypage/cart',
  DELETE_SINGLE: (id: number) => `/mypage/cart/${id}`,
  DELETE_BATCH: '/mypage/cart/batch',
  CART_QUOTE: '/mypage/cart/checkout/quote',
  CART_ORDER: '/mypage/cart/checkout',
};

export const CartApi = {
  addToCart: (body: CartAddItemREQ) => api.post<BaseResponse<unknown>>(ENDPOINTS.ADD_TO_CART, body),
  getCartList: (params?: CartListREQ) => api.get<BaseResponse<CartListResponse>>(ENDPOINTS.CART_LIST, { params }),
  deleteCartItem: (id: number) => api.delete(ENDPOINTS.DELETE_SINGLE(id)),
  deleteCartBatch: (body: CartDeleteBatchREQ) => api.delete(ENDPOINTS.DELETE_BATCH, body),
  checkCartQuote: (body: CartQuoteREQ) => api.post<BaseResponse<CartQuoteRESP>>(ENDPOINTS.CART_QUOTE, body),
  orderCartItem: (body: CartOrderREQ) => api.post<BaseResponse<OrderCreateResponse>>(ENDPOINTS.CART_ORDER, body),
};
