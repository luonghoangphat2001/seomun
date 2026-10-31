import { api } from '@/config';
import { BaseResponse } from '@/types';
import { ProfileRESP, UploadBusinessRegistrationFileRESP } from './profile.response';
import { SwitchToBusinessREQ, UpdatePasswordREQ, UpdateProfileREQ, UploadBusinessRegistrationFileREQ } from './profile.request';

const ENDPOINT = {
  GET_PROFILE: '/mypage/profile',
  UPDATE_PROFILE: '/mypage/profile',
  UPDATE_PASSWORD: '/mypage/profile/password',
  UPLOAD_BUSINESS_REGISTRATION_FILE: '/mypage/profile/business-registration-file',
  SWITCH_TO_BUSINESS: '/mypage/convert-to-business-member',
};

export const ProfileApi = {
  get: () => api.get<BaseResponse<ProfileRESP>>(ENDPOINT.GET_PROFILE),
  update: (body: UpdateProfileREQ) => api.put<BaseResponse<unknown>>(ENDPOINT.UPDATE_PROFILE, body),
  updatePassword: (body: UpdatePasswordREQ) => api.put<BaseResponse<unknown>>(ENDPOINT.UPDATE_PASSWORD, body),
  uploadBusinessRegistrationFile: (body: UploadBusinessRegistrationFileREQ) => {
    const formData = new FormData();
    formData.append('file', body.file);

    return api.post<BaseResponse<UploadBusinessRegistrationFileRESP>>(ENDPOINT.UPLOAD_BUSINESS_REGISTRATION_FILE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  switchToAccountBusiness: (body: SwitchToBusinessREQ) => {
    const formData = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      formData.append(key, value instanceof File ? value : String(value));
    });

    return api.post(ENDPOINT.SWITCH_TO_BUSINESS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
