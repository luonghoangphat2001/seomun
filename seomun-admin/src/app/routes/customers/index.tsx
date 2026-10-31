import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { CustomerListPage, customerListSearchSchema } from '@/features/customers';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/customers/')({
  validateSearch: customerListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('nav.customers.list', 'Customer List'),
  component: CustomersListRoute,
});

function CustomersListRoute() {
  return <CustomerListPage />;
}
