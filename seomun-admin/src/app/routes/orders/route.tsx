import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/orders')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: RouteComponent,
  staticData: {
    breadcrumb: () => breadcrumbKey('orders.title'),
  },
});

function RouteComponent() {
  return <Outlet />;
}
