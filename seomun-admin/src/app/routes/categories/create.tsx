import { createFileRoute } from '@tanstack/react-router';

import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { CategoryCreatePage } from '@/features/categories';

export const Route = createFileRoute('/categories/create')({
  staticData: {
    breadcrumb: () => breadcrumbKey('categories.create'),
  },
  component: CategoryCreatePage,
  head: createTitleHead('page.category.create.title', 'Create Category'),
});
