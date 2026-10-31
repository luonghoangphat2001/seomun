import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { ALL_STAFF_ROLES } from '@/lib/auth';

import { WebEditorListPage, webEditorListSearchSchema } from '@/features/products';

export const Route = createFileRoute('/products/web-editors')({
  validateSearch: webEditorListSearchSchema,
  staticData: {
    breadcrumb: () => breadcrumbKey('products.web_editors'),
  },
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: WebEditorListPage,
});
