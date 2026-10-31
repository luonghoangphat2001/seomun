import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { templateListQueryOptionsBySearch, templateListSearchSchema, TemplateListPage } from '@/features/products';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/products/templates')({
  staticData: {
    breadcrumb: () => breadcrumbKey('products.templates'),
  },
  validateSearch: templateListSearchSchema,
  loaderDeps: ({ search }) => search,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(templateListQueryOptionsBySearch(deps));
  },
  head: createTitleHead('nav.products.templates', 'Template Management'),
  component: RouteComponent,
});

function RouteComponent() {
  return <TemplateListPage />;
}
