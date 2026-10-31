import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { AssignedDesignStatus, DesignOrderTrackingPage } from '@/features/orders';
import { ALL_STAFF_ROLES } from '@/lib/auth';

const designWorkflowSearchSchema = z.object({
  selected_order_number: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  status: z.enum(AssignedDesignStatus).optional().catch(undefined),
});

export const Route = createFileRoute('/orders/design-workflow')({
  validateSearch: designWorkflowSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('orders.design_workflow'),
  },
  head: createTitleHead('nav.orders.design_workflow', 'Designing Order'),
  component: DesignOrderTrackingPage,
});
