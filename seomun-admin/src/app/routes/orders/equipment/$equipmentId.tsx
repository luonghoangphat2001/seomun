import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { EquipmentDetailPage, equipmentDetailQueryOptions } from '@/features/orders/equipment';

export const Route = createFileRoute('/orders/equipment/$equipmentId')({
  staticData: {
    breadcrumb: (matches) => matches.params.equipmentId,
  },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(equipmentDetailQueryOptions(params.equipmentId)),
  head: createTitleHead('nav.orders.equipment_detail', 'Equipment Detail'),
  component: RouteComponent,
});

function RouteComponent() {
  return <EquipmentDetailPage />;
}
