import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { customerPointsSearchSchema, CustomerPointsPage } from '@/features/customers';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/customers/points')({
  validateSearch: customerPointsSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('nav.customers.points', 'Point Management'),
  component: CustomerPointsPage,
});
