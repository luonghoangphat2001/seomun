import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { CustomerRegisterPage } from '@/features/customers';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/customers/create')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('nav.customers.create', 'Customer Registration'),
  component: CustomerRegisterPage,
});
