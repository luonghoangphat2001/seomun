import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { OrderProcessingScreen } from '@/features/orders';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/orders/processing')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('nav.orders.processing', 'Order Processing'),
  component: OrderProcessingScreen,
});
