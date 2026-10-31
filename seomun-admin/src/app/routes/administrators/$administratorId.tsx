import { createFileRoute, redirect } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { useAuthStore } from '@/stores/auth-store';

import { AdministratorDetailPage, administratorDetailQueryOptions } from '@/features/administrators';

export const Route = createFileRoute('/administrators/$administratorId')({
  beforeLoad: ({ params }) => {
    const currentUser = useAuthStore.getState().user;
    const isSuperAdmin = currentUser?.username.toLowerCase() === 'superadmin';

    if (!isSuperAdmin && String(currentUser?.id) !== params.administratorId) {
      throw redirect({ to: routePaths.unauthorized });
    }
  },
  staticData: {
    breadcrumb: (match) =>
      // return breadcrumbKey('administrators.edit', {

      match.params.administratorId,
    // });
    // },
  },
  loader: ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(administratorDetailQueryOptions(params.administratorId));
  },
  head: createTitleHead('page.administrators.detail.title', 'Administrator Details'),
  component: RouteComponent,
});

function RouteComponent() {
  return <AdministratorDetailPage />;
}
