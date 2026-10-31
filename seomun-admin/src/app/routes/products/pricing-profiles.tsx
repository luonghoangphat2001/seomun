import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { PricingProfileListPage, pricingProfileListSearchSchema } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/pricing-profiles')({
  validateSearch: pricingProfileListSearchSchema,
  staticData: {
    breadcrumb: () => breadcrumbKey('products.pricing_profiles'),
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: PricingProfileListPage,
});
