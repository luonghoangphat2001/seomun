import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { ALL_STAFF_ROLES } from '@/lib/auth';

import { TemplateDetailPage } from '@/features/products';

export const Route = createFileRoute('/products/templates_/$templateId')({
  staticData: {
    breadcrumb: 'Template Detail',
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: TemplateDetailPage,
});
