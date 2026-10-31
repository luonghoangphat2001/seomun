import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { unitPriceSettingsSearchSchema, UnitPriceSettingsPage } from '@/features/products';
import { ADMIN_AND_SUPER_MANAGER_ROLES } from '@/lib/auth';

function UnitPriceSettingsRoute() {
  return <UnitPriceSettingsPage />;
}

export const Route = createFileRoute('/products/unit-price-settings')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.unit_price_settings'),
  },
  validateSearch: unitPriceSettingsSearchSchema,
  beforeLoad: requireRole(ADMIN_AND_SUPER_MANAGER_ROLES),
  head: createTitleHead('nav.products.unit_price_settings', 'Unit Price Settings'),
  component: UnitPriceSettingsRoute,
});
