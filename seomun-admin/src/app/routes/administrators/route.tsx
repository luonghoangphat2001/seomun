import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { SUPER_MANAGER_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/administrators')({
  beforeLoad: requireRole(SUPER_MANAGER_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('administrators.list'),
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
