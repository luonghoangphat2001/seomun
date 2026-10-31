import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { DirectShippingPage, directShippingListSearchSchema } from '@/features/delivery';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/delivery/direct-shipping')({
  validateSearch: directShippingListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('page.delivery.direct_shipping.title', 'Direct Shipping'),
  component: RouteComponent,
});

function RouteComponent() {
  return <DirectShippingPage />;
}
