import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { EquipmentCreatePage } from '@/features/orders/equipment';
import { breadcrumbKey } from '@/app/router/breadcrumbs';

export const Route = createFileRoute('/orders/equipment/create')({
  head: createTitleHead('nav.orders.equipment_create', 'Register Equipment'),
  component: RouteComponent,
  staticData: {
    breadcrumb: () => breadcrumbKey('orders.equipment_create'),
  },
});

function RouteComponent() {
  return <EquipmentCreatePage />;
}
