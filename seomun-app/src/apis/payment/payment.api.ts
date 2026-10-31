import { api } from '@/config';
import { BaseResponse } from '@/types';
import { BankTransferPaymentREQ, PaymentByVirtualAccountREQ, PaymentConfirmREQ, PaymentInitREQ } from './payment.request';
import {
  BankTransferPaymentRESP,
  PaymentByVirtualAccountRESP,
  PaymentConfirmRESP,
  PaymentDetailRESP,
  PaymentInitRESP,
  PaymentMethodsRESP,
} from './payment.response';

export const ENDPOINTS = {
  PAYMENT_BY_VIRTUAL_ACCOUNT: '/payments/virtual-account/pay',
  PAYMENT_INIT: '/payments',
  PAYMENT_CONFIRM: '/payments/toss/confirm',
  PAYMENT_METHODS: '/payment-methods',
  PAYMENT_DETAIL: (transactionId: string) => `/payments/${encodeURIComponent(transactionId)}`,
};

export const PaymentApi = {
  paymentByVirtualAccount: (body: PaymentByVirtualAccountREQ) =>
    api.post<BaseResponse<PaymentByVirtualAccountRESP>>(ENDPOINTS.PAYMENT_BY_VIRTUAL_ACCOUNT, body),

  initPayment: (body: PaymentInitREQ) => api.post<BaseResponse<PaymentInitRESP>>(ENDPOINTS.PAYMENT_INIT, body),

  confirmPayment: (body: PaymentConfirmREQ) => api.post<BaseResponse<PaymentConfirmRESP>>(ENDPOINTS.PAYMENT_CONFIRM, body),

  getPaymentMethods: () => api.get<BaseResponse<PaymentMethodsRESP>>(ENDPOINTS.PAYMENT_METHODS),

  createBankTransferPayment: (body: BankTransferPaymentREQ) =>
    api.post<BaseResponse<BankTransferPaymentRESP>>(ENDPOINTS.PAYMENT_INIT, body),

  getPaymentDetail: (transactionId: string) => api.get<BaseResponse<PaymentDetailRESP>>(ENDPOINTS.PAYMENT_DETAIL(transactionId)),
};
