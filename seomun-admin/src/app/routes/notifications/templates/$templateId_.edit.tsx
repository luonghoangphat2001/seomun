import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { NotificationTemplateEditPage } from '@/features/notifications/notification-template';

export const Route = createFileRoute('/notifications/templates/$templateId_/edit')({
  staticData: {
    breadcrumb: 'Edit Notification Template',
  },
  head: createTitleHead('page.notifications.templates.title', 'Edit Notification Template'),
  component: RouteComponent,
});

function RouteComponent() {
  return <NotificationTemplateEditPage />;
}
