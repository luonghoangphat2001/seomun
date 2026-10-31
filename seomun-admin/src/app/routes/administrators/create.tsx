import { createFileRoute } from '@tanstack/react-router';

import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';

import { AdministratorCreatePage } from '@/features/administrators';

export const Route = createFileRoute('/administrators/create')({
  staticData: {
    breadcrumb: () => breadcrumbKey('administrators.create'),
  },
  head: createTitleHead('page.administrators.create.title', 'Administrator Registration'),
  component: RouteComponent,
});

function RouteComponent() {
  return <AdministratorCreatePage />;
}
