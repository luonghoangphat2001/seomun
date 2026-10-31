import { BaseResponse, ErrorRESP } from '@/types';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AuthApi } from './auth.api';
import { FindIdREQ, LoginREQ, LoginSocialREQ, ResetPasswordWithCodeREQ, SendVerifyCodeREQ, VerifyCodeREQ } from './auth.request';
import { FindIdRESP, LoginRESP, ProxyLoginExchangeRESP, RegisterRESP, SocialRedirectRESP } from './auth.response';

export const useLoginMutation = (options?: UseMutationOptions<BaseResponse<LoginRESP>, AxiosError<ErrorRESP>, LoginREQ>) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.login,
  });

export const useLogoutMutation = (options?: UseMutationOptions<BaseResponse<null>, AxiosError<null>, null>) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.logout,
  });

export const useRegisterMutation = (options?: UseMutationOptions<BaseResponse<RegisterRESP>, AxiosError<ErrorRESP>, FormData>) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.register,
  });

export const useSendCodeMutation = (options?: UseMutationOptions<BaseResponse<null>, AxiosError<ErrorRESP>, SendVerifyCodeREQ>) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.sendCode,
  });

export const useVerifyCodeMutation = (options?: UseMutationOptions<BaseResponse<null>, AxiosError<ErrorRESP>, VerifyCodeREQ>) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.verifyCode,
  });

export const useFindIdMutation = (options?: UseMutationOptions<BaseResponse<FindIdRESP>, AxiosError<ErrorRESP>, FindIdREQ>) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.findId,
  });

export const useResetPasswordMutation = (
  options?: UseMutationOptions<BaseResponse<null>, AxiosError<ErrorRESP>, ResetPasswordWithCodeREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.resetPassword,
  });

export const useSocialRedirectMutation = (
  options?: UseMutationOptions<BaseResponse<SocialRedirectRESP>, AxiosError<ErrorRESP>, string>,
) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.getSocialLoginRedirect,
  });

export const useSocialLoginMutation = (
  options?: UseMutationOptions<BaseResponse<LoginRESP>, AxiosError<ErrorRESP>, LoginSocialREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.loginBySocial,
  });

export const useProxyLoginMutation = (
  options?: UseMutationOptions<BaseResponse<ProxyLoginExchangeRESP>, AxiosError<ErrorRESP>>,
) =>
  useMutation({
    ...options,
    mutationFn: AuthApi.handleProxyLoginExchange,
  });
