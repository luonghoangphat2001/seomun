import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { ADMIN_AND_SUPER_MANAGER_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/categories')({
  beforeLoad: requireRole(ADMIN_AND_SUPER_MANAGER_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('categories.list'),
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
