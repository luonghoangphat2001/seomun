import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { SettingsPage } from '@/features/settings';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/settings')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('nav.settings.title', 'Settings'),
  component: SettingsPage,
});
