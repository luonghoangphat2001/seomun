import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { buildTitle } from '@/app/router/create-title-head';
import { OrderDetailPage, orderDetailQueryOptions } from '@/features/orders';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  loader: ({ params: { orderId }, context: { queryClient } }) => {
    void queryClient.prefetchQuery(orderDetailQueryOptions(orderId));
  },
  head: ({ match }) => ({
    meta: [{ title: buildTitle('page.orders.detail.title', 'Order Detail', { order_number: match.params.orderId }) }],
  }),
  staticData: {
    breadcrumb: (match) => match.params.orderId,
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <OrderDetailPage />;
}
