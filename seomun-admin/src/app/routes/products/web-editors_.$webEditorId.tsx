import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { ALL_STAFF_ROLES } from '@/lib/auth';

import { WebEditorDetailPage } from '@/features/products';

export const Route = createFileRoute('/products/web-editors_/$webEditorId')({
  staticData: {
    breadcrumb: 'Web Editor Detail',
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: WebEditorDetailPage,
});
