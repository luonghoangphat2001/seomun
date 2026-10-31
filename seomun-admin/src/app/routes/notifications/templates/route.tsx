import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/notifications/templates')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('notifications.templates'),
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
