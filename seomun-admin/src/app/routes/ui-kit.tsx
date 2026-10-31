import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { UiKitPage } from '@/features/dev';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/ui-kit')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('page.dev.ui_kit.title', 'UI Kit'),
  component: UiKitRoute,
});

function UiKitRoute() {
  return <UiKitPage />;
}
