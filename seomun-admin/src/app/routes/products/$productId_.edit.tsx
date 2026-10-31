import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { ProductEditPage } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/$productId_/edit')({
  staticData: {
    breadcrumb: '상품 수정',
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('products.edit', 'Edit Product'),
  component: ProductEditPage,
});
