import { createFileRoute } from '@tanstack/react-router';

import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { CategoryEditPage } from '@/features/categories';

export const Route = createFileRoute('/categories/$categoryId_/edit')({
  staticData: {
    breadcrumb: () => breadcrumbKey('categories.edit'),
  },
  component: CategoryEditPage,
  head: createTitleHead('page.category.edit.title', 'Edit Category'),
});
