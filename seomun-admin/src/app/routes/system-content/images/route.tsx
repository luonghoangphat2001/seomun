import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/system-content/images')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
