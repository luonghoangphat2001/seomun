import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { StatisticsManagementPage } from '@/features/dashboard';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/statistics')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('dashboard.statistics'),
  },
  head: createTitleHead('nav.dashboard.statistics', 'Statistics Management'),
  component: DashboardStatisticsRoute,
});

function DashboardStatisticsRoute() {
  return <StatisticsManagementPage />;
}
