import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { AdministratorListPage, administratorListQueryOptionsBySearch, administratorListSearchSchema } from '@/features/administrators';

export const Route = createFileRoute('/administrators/')({
  validateSearch: administratorListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps, context: { queryClient } }) => {
    void queryClient.prefetchQuery(administratorListQueryOptionsBySearch(deps));
  },
  component: RouteComponent,
  head: createTitleHead('page.administrators.list.title', 'Administrator Accounts'),
});

function RouteComponent() {
  return <AdministratorListPage />;
}
