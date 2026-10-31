import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { CouponListPage, couponListQueryOptionsBySearch, couponListSearchSchema } from '@/features/orders';

export const Route = createFileRoute('/orders/coupons/')({
  validateSearch: couponListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(couponListQueryOptionsBySearch(deps));
  },
  head: createTitleHead('nav.orders.coupons', 'Coupon Management'),

  component: RouteComponent,
});

function RouteComponent() {
  return <CouponListPage />;
}
