import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { OrderListPage, orderListQueryOptionsBySearch, orderListSearchSchema } from '@/features/orders';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/orders/')({
  validateSearch: orderListSearchSchema,
  loaderDeps: ({ search }) => search,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(orderListQueryOptionsBySearch(deps));
  },
  head: createTitleHead('nav.orders.list', 'Order List'),

  component: RouteComponent,
});

function RouteComponent() {
  return <OrderListPage />;
}
