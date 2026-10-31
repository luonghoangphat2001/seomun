import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { ALL_STAFF_ROLES } from '@/lib/auth';
import { breadcrumbKey } from '@/app/router/breadcrumbs';

export const Route = createFileRoute('/orders/equipment')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: RouteComponent,
  staticData: {
    breadcrumb: () => breadcrumbKey('orders.equipment'),
  },
});

function RouteComponent() {
  return <Outlet />;
}
