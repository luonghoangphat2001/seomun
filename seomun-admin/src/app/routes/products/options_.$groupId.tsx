import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { OptionDetailPage, optionDetailSearchSchema } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/options_/$groupId')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.options_detail'),
  },
  validateSearch: optionDetailSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: OptionDetailPage,
});
