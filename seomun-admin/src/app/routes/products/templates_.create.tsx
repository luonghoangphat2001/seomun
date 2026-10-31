import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { ALL_STAFF_ROLES } from '@/lib/auth';

import { TemplateCreatePage } from '@/features/products';

export const Route = createFileRoute('/products/templates_/create')({
  staticData: {
    breadcrumb: 'Add Template',
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: TemplateCreatePage,
});
