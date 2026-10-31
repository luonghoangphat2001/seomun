import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { DeliveryTrackingPage, trackingListSearchSchema } from '@/features/delivery';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/delivery/tracking')({
  validateSearch: trackingListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('page.delivery.tracking.title', 'Delivery Tracking'),
  component: RouteComponent,
});

function RouteComponent() {
  return <DeliveryTrackingPage />;
}
