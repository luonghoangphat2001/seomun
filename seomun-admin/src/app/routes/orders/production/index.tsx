import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { ProductionListPage, orderListQueryOptionsBySearch, orderListSearchSchema } from '@/features/orders';

export const Route = createFileRoute('/orders/production/')({
  validateSearch: orderListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(orderListQueryOptionsBySearch(deps));
  },
  head: createTitleHead('nav.production.list', 'Production List'),
  component: ProductionListPage,
});
