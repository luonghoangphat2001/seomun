import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { NotificationTemplateCreatePage } from '@/features/notifications/notification-template';

export const Route = createFileRoute('/notifications/templates/create')({
  staticData: {
    breadcrumb: 'Create Notification Template',
  },
  head: createTitleHead('page.notifications.templates.title', 'Create Notification Template'),
  component: RouteComponent,
});

function RouteComponent() {
  return <NotificationTemplateCreatePage />;
}
