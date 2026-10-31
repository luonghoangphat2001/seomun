import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from './dashboard.api';

export const DASHBOARD_QUERY_KEYS = {
  DETAIL: 'DASHBOARD_DETAIL',
};

export const useMyDashboardQuery = () =>
  useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.DETAIL],
    queryFn: () => DashboardApi.getMyDashboard(),
    select: (resp) => resp.data,
  });
