import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { NotificationTemplateDetailPage } from '@/features/notifications/notification-template';

export const Route = createFileRoute('/notifications/templates/$templateId')({
  staticData: {
    breadcrumb: 'Notification Template Detail',
  },
  head: createTitleHead('page.notifications.templates.title', 'Notification Template Detail'),
  component: RouteComponent,
});

function RouteComponent() {
  return <NotificationTemplateDetailPage />;
}
