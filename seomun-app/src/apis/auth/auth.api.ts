import { api } from '@/config';
import { BaseResponse } from '@/types';
import { FindIdREQ, LoginREQ, LoginSocialREQ, ResetPasswordWithCodeREQ, SendVerifyCodeREQ, VerifyCodeREQ } from './auth.request';
import { FindIdRESP, LoginRESP, ProxyLoginExchangeRESP, RegisterRESP, SocialRedirectRESP } from './auth.response';

export const ENDPOINTS = {
  LOGIN: '/auth/login',
  SOCIAL_LOGIN_REDIRECT: (provider: string) => `/auth/social/${provider}/redirect-url`,
  SOCIAL_LOGIN_CALLBACK: (provider: string) => `/auth/social/${provider}/callback`,
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  REGISTER: '/auth/register',
  SEND_CODE: '/auth/send-verification-code',
  VERIFY_CODE: '/auth/verify-verification-code',
  FIND_ID: '/auth/find-username',
  RESET_PASSWORD: '/auth/reset-password/with-code',
  PROXY_LOGIN_EXCHANGE: '/proxy-login/exchange',
};

export const AuthApi = {
  login: (data: LoginREQ) => api.post<BaseResponse<LoginRESP>>(ENDPOINTS.LOGIN, data),
  getSocialLoginRedirect: (provider: string) =>
    api.get<BaseResponse<SocialRedirectRESP>>(ENDPOINTS.SOCIAL_LOGIN_REDIRECT(provider)),
  loginBySocial: (body: LoginSocialREQ) =>
    api.post<BaseResponse<LoginRESP>>(ENDPOINTS.SOCIAL_LOGIN_CALLBACK(body.provider), body),
  logout: () => api.post<BaseResponse<null>>(ENDPOINTS.LOGOUT),

  register: (data: FormData) =>
    api.post<BaseResponse<RegisterRESP>>(ENDPOINTS.REGISTER, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  sendCode: (data: SendVerifyCodeREQ) => api.post<BaseResponse<null>>(ENDPOINTS.SEND_CODE, data),
  verifyCode: (data: VerifyCodeREQ) => api.post<BaseResponse<null>>(ENDPOINTS.VERIFY_CODE, data),
  findId: (data: FindIdREQ) => api.post<BaseResponse<FindIdRESP>>(ENDPOINTS.FIND_ID, data),
  resetPassword: (data: ResetPasswordWithCodeREQ) => api.post<BaseResponse<null>>(ENDPOINTS.RESET_PASSWORD, data),

  handleProxyLoginExchange: () =>
    api.post<BaseResponse<ProxyLoginExchangeRESP>>(ENDPOINTS.PROXY_LOGIN_EXCHANGE, {}, { withCredentials: true }),
};
