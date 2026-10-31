import { api } from '@/config';
import { BaseResponse } from '@/types';
import { DashboardRESP } from './dashboard.response';

export const DashboardApi = {
  getMyDashboard: () => api.get<BaseResponse<DashboardRESP>>('/mypage/dashboard'),
};
