import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { MembershipLevelPage } from '@/features/customers';
import { SUPER_MANAGER_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/customers/membership-levels')({
  beforeLoad: requireRole(SUPER_MANAGER_ROLES),
  head: createTitleHead('nav.customers.membership_levels', 'Membership Level Management'),
  component: MembershipLevelPage,
});
