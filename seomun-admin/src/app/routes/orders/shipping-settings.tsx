import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { ShippingSettingsPage, shippingSettingsQueryOptions } from '@/features/orders';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/orders/shipping-settings')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('orders.shipping_settings'),
  },
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(shippingSettingsQueryOptions());
  },
  head: createTitleHead('nav.orders.shipping_settings', 'Free Shipping Settings'),

  component: RouteComponent,
});

function RouteComponent() {
  return <ShippingSettingsPage />;
}
