import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import {
  NotificationHistoryPage,
  notificationHistoryListQueryOptionsBySearch,
  notificationHistoryListSearchSchema,
} from '@/features/notifications/notification-history';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/notifications/history')({
  validateSearch: notificationHistoryListSearchSchema,
  loaderDeps: ({ search }) => search,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(notificationHistoryListQueryOptionsBySearch(deps));
  },
  staticData: {
    breadcrumb: () => breadcrumbKey('notifications.history'),
  },
  head: createTitleHead('page.notifications.history.title', 'Notification Sending History'),
  component: RouteComponent,
});

function RouteComponent() {
  return <NotificationHistoryPage />;
}
