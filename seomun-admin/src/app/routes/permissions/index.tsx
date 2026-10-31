import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { PermissionListPage, permissionListQueryOptions, permissionListSearchSchema } from '@/features/permissions';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/permissions/')({
  validateSearch: permissionListSearchSchema,
  loaderDeps: ({ search }) => search,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  loader: ({ deps, context: { queryClient } }) => {
    return queryClient.ensureQueryData(permissionListQueryOptions(deps));
  },
  component: RouteComponent,
  head: createTitleHead('page.permissions.list.title', 'Administrator privileges'),
});

function RouteComponent() {
  return <PermissionListPage />;
}
