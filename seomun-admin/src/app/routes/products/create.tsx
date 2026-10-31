import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { ProductCreatePage } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/create')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.create'),
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('nav.products.create', 'Product Registration'),
  component: ProductCreatePage,
});
