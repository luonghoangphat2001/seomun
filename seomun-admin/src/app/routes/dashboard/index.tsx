import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { OperationsDashboardPage } from '@/features/dashboard';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('dashboard.operations'),
  },
  head: createTitleHead('nav.dashboard.operations', 'Operations Dashboard'),
  component: DashboardRoute,
});

function DashboardRoute() {
  return <OperationsDashboardPage />;
}
