import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import {
  NotificationTemplatesPage,
  notificationTemplateListQueryOptionsBySearch,
  notificationTemplateListSearchSchema,
} from '@/features/notifications/notification-template';

export const Route = createFileRoute('/notifications/templates/')({
  validateSearch: notificationTemplateListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(notificationTemplateListQueryOptionsBySearch(deps));
  },
  head: createTitleHead('page.notifications.templates.title', 'Notification Templates'),
  component: RouteComponent,
});

function RouteComponent() {
  return <NotificationTemplatesPage />;
}
