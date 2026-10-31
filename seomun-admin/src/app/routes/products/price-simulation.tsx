import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { PriceSimulationPage } from '@/features/products';
import { productListQueryOptions } from '@/features/products/management';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/price-simulation')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.price_simulation'),
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(productListQueryOptions({ page: 1, per_page: 100 }));
  },
  head: createTitleHead('nav.products.price_simulation', 'Price Simulation'),
  component: PriceSimulationPage,
});
