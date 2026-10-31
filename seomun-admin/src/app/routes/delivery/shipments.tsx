import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { ShipmentManagementPage, shipmentListSearchSchema } from '@/features/delivery';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/delivery/shipments')({
  validateSearch: shipmentListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('page.delivery.shipments.title', 'Shipment Management'),
  component: RouteComponent,
});

function RouteComponent() {
  return <ShipmentManagementPage />;
}
