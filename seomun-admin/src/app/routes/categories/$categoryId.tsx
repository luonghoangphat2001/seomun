import { createFileRoute } from '@tanstack/react-router';

import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { CategoryDetailPage } from '@/features/categories';

export const Route = createFileRoute('/categories/$categoryId')({
  staticData: {
    breadcrumb: () => breadcrumbKey('categories.detail'),
  },
  component: CategoryDetailPage,
  head: createTitleHead('page.category.detail.title', 'Category Detail'),
});
