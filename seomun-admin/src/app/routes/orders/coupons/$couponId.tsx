import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { CouponDetailPage, couponDetailQueryOptions } from '@/features/orders';

export const Route = createFileRoute('/orders/coupons/$couponId')({
  staticData: {
    breadcrumb: (match) => match.params.couponId,
  },
  loader: ({ params, context: { queryClient } }) => {
    void queryClient.prefetchQuery(couponDetailQueryOptions(Number(params.couponId)));
  },
  head: createTitleHead('nav.orders.coupon_detail', 'Coupon Detail'),
  component: RouteComponent,
});

function RouteComponent() {
  return <CouponDetailPage />;
}
