import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { PriceHistoryPage } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/price-history')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.price_history'),
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: PriceHistoryPage,
});
