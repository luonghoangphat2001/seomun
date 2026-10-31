import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { TaskLogListPage, taskLogListQueryOptionsBySearch, taskLogListSearchSchema } from '@/features/system-logs/task-logs';
import { SUPER_MANAGER_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/system-logs/tasks')({
  validateSearch: (search) => taskLogListSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  beforeLoad: requireRole(SUPER_MANAGER_ROLES),
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(taskLogListQueryOptionsBySearch(deps));
  },
  component: RouteComponent,
  head: createTitleHead('page.system_logs.tasks.title', 'Work Log List'),
});

function RouteComponent() {
  return <TaskLogListPage />;
}
