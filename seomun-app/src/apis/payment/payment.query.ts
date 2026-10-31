import { BaseResponse, ErrorRESP } from '@/types';
import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { PaymentApi } from './payment.api';
import { BankTransferPaymentREQ, PaymentByVirtualAccountREQ, PaymentConfirmREQ, PaymentInitREQ } from './payment.request';
import {
  BankTransferPaymentRESP,
  PaymentByVirtualAccountRESP,
  PaymentConfirmRESP,
  PaymentDetailRESP,
  PaymentInitRESP,
  PaymentMethodsRESP,
} from './payment.response';

export const paymentQueryKeys = {
  METHODS: 'PAYMENT_METHODS',
  DETAIL: 'PAYMENT_DETAIL',
};

export const usePaymentByVirtualAccountMutation = (
  options?: UseMutationOptions<BaseResponse<PaymentByVirtualAccountRESP>, AxiosError<ErrorRESP>, PaymentByVirtualAccountREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: PaymentApi.paymentByVirtualAccount,
  });

export const useInitPaymentMutation = (
  options?: UseMutationOptions<BaseResponse<PaymentInitRESP>, AxiosError<ErrorRESP>, PaymentInitREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: PaymentApi.initPayment,
  });

export const useConfirmPaymentMutation = (
  options?: UseMutationOptions<BaseResponse<PaymentConfirmRESP>, AxiosError<ErrorRESP>, PaymentConfirmREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: PaymentApi.confirmPayment,
  });

export const useCreateBankTransferPaymentMutation = (
  options?: UseMutationOptions<BaseResponse<BankTransferPaymentRESP>, AxiosError<ErrorRESP>, BankTransferPaymentREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: PaymentApi.createBankTransferPayment,
  });

export const usePaymentMethodsQuery = (
  options?: Omit<
    UseQueryOptions<BaseResponse<PaymentMethodsRESP>, AxiosError<ErrorRESP>, PaymentMethodsRESP>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [paymentQueryKeys.METHODS],
    queryFn: PaymentApi.getPaymentMethods,
    select: (resp) => resp.data,
    ...options,
  });

export const usePaymentDetailQuery = (
  transactionId?: string,
  options?: Omit<
    UseQueryOptions<BaseResponse<PaymentDetailRESP>, AxiosError<ErrorRESP>, PaymentDetailRESP>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [paymentQueryKeys.DETAIL, transactionId],
    queryFn: () => PaymentApi.getPaymentDetail(transactionId as string),
    select: (resp) => resp.data,
    enabled: !!transactionId,
    ...options,
  });
