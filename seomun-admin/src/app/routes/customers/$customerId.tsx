import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { customerDetailSearchSchema, CustomerDetailPage } from '@/features/customers';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/customers/$customerId')({
  validateSearch: customerDetailSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('page.customers.detail.title', 'Customer Detail'),
  component: CustomerDetailRoute,
});

function CustomerDetailRoute() {
  return <CustomerDetailPage />;
}
