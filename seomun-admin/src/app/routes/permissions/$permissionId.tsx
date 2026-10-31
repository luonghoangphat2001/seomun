import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { navConfig } from '@/app/navigation/nav-config';
import { navIcons } from '@/app/navigation/nav-icons';
import { createTitleHead } from '@/app/router/create-title-head';
import { PermissionDetailPage, permissionDetailQueryOptions, permissionMenuSettingsQueryOptions } from '@/features/permissions';
import { ALL_STAFF_ROLES } from '@/lib/auth';

const PERMISSION_NAV_ITEMS = navConfig.map((item) => ({ ...item, icon: navIcons[item.icon] }));

export const Route = createFileRoute('/permissions/$permissionId')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: (match) => match.loaderData?.name ?? match.params.permissionId,
  },
  loader: async ({ params, context: { queryClient } }) => {
    const permissionId = Number(params.permissionId);
    const [permission] = await Promise.all([
      queryClient.ensureQueryData(permissionDetailQueryOptions(permissionId)),
      queryClient.ensureQueryData(permissionMenuSettingsQueryOptions(permissionId)),
    ]);

    return permission;
  },
  head: createTitleHead('page.permissions.settings.title', 'Permission Settings'),
  component: RouteComponent,
});

function RouteComponent() {
  const { permissionId } = Route.useParams();

  return <PermissionDetailPage key={permissionId} permissionId={Number(permissionId)} navItems={PERMISSION_NAV_ITEMS} />;
}
