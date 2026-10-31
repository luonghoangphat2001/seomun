import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { ShoppingSettingsPage } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/shopping-settings')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.shopping_settings'),
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: ShoppingSettingsPage,
});
