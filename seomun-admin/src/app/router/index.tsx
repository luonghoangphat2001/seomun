import { RouterProvider, createRouter } from '@tanstack/react-router';

import { AppProvider } from '@/app/providers/app-provider';
import { queryClient } from '@/lib/query/query-client';
import { routeTree } from '@/routeTree.gen';
import type { BreadcrumbValue } from './breadcrumbs';

export type RouterContext = {
  queryClient: typeof queryClient;
};

function stringifySearch(search: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(search).forEach(([key, value]) => {
    if (value == null || value === '') return;

    params.set(key, String(value));
  });

  const result = params.toString();
  return result ? `?${result}` : '';
}

function parseSearch(searchStr: string) {
  const search = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr;
  const params = new URLSearchParams(search);

  return Object.fromEntries(params.entries());
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  stringifySearch,
  parseSearch,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    breadcrumb?: BreadcrumbValue;
  }
}

export function AppRouter() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
