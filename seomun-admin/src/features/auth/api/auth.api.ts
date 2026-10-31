import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import type { LoginREQ } from './auth.request';
import type { LoginRESP } from './auth.response';

export const loginAPI = (body: LoginREQ): Promise<LoginRESP> => api.post(ENDPOINTS.AUTH.LOGIN, body);
