import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { EquipmentListPage, equipmentListQueryOptionsBySearch, equipmentListSearchSchema } from '@/features/orders/equipment';

export const Route = createFileRoute('/orders/equipment/')({
  validateSearch: equipmentListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(equipmentListQueryOptionsBySearch(deps));
  },
  head: createTitleHead('nav.orders.equipment', 'Equipment Management'),
  component: RouteComponent,
});

function RouteComponent() {
  return <EquipmentListPage />;
}
