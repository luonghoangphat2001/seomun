import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { ProductListPage, productListQueryOptionsBySearch, productListSearchSchema } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.products'),
  },
  validateSearch: productListSearchSchema,
  loaderDeps: ({ search }) => search,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(productListQueryOptionsBySearch(deps));
  },
  head: createTitleHead('nav.products.products', 'Product Management'),
  component: RouteComponent,
});

function RouteComponent() {
  return <ProductListPage />;
}
