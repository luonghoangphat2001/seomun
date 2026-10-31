import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { CategoryListPage, categoryListSearchSchema } from '@/features/categories';

export const Route = createFileRoute('/categories/')({
  validateSearch: categoryListSearchSchema,
  component: CategoryListPage,
  head: createTitleHead('page.category.list.title', 'Categories'),
});
