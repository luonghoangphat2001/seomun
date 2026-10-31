import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { OptionListPage, optionListSearchSchema } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/options')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.options'),
  },
  validateSearch: optionListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: OptionListPage,
});
