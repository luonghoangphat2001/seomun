import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { BaseResponse } from '@/types/api/response';

import type { UserLimitCreateREQ, UserLimitListREQ, UserLimitUpdateREQ, UserListREQ } from './post-payment-limit.request';
import type { UserLimitDetailWrapRESP, UserLimitListRESP, UserLimitRESP, UserListRESP } from './post-payment-limit.response';

export function getUserLimitsAPI(params: UserLimitListREQ): Promise<UserLimitListRESP> {
  return api.get<UserLimitListRESP>(ENDPOINTS.PAYMENTS.POST_LIMITS_LIST, { params });
}

export function getUserLimitDetailAPI(id: number): Promise<UserLimitDetailWrapRESP> {
  return api.get<UserLimitDetailWrapRESP>(ENDPOINTS.PAYMENTS.POST_LIMITS_DETAIL(id));
}

export function createUserLimitAPI(payload: UserLimitCreateREQ): Promise<BaseResponse<UserLimitRESP>> {
  return api.post<BaseResponse<UserLimitRESP>>(ENDPOINTS.PAYMENTS.POST_LIMITS_CREATE, payload);
}

export function updateUserLimitAPI(id: number, payload: UserLimitUpdateREQ): Promise<BaseResponse<UserLimitRESP>> {
  return api.put<BaseResponse<UserLimitRESP>>(ENDPOINTS.PAYMENTS.POST_LIMITS_UPDATE(id), payload);
}

export function deleteUserLimitAPI(id: number): Promise<BaseResponse<string>> {
  return api.delete<BaseResponse<string>>(ENDPOINTS.PAYMENTS.POST_LIMITS_DELETE(id));
}

export function getUserListAPI(params: UserListREQ): Promise<UserListRESP> {
  return api.get<UserListRESP>(ENDPOINTS.PAYMENTS.POST_USER_LIST, { params });
}
