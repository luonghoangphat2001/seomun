import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { AccessLogListPage, accessLogListQueryOptionsBySearch, accessLogListSearchSchema } from '@/features/system-logs/access-logs';
import { SUPER_MANAGER_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/system-logs/access')({
  validateSearch: accessLogListSearchSchema,
  loaderDeps: ({ search }) => search,
  beforeLoad: requireRole(SUPER_MANAGER_ROLES),
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(accessLogListQueryOptionsBySearch(deps));
  },
  component: RouteComponent,
  head: createTitleHead('page.system_logs.access.title', 'Connection Log'),
});

function RouteComponent() {
  return <AccessLogListPage />;
}
