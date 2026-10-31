import { HeadContent, Outlet, createRootRouteWithContext, useRouterState } from '@tanstack/react-router';

import type { RouterContext } from '@/app/router';
import { routePaths } from '@/app/router/route-paths';
import { AppShell } from '@/app/shells/app-shell';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isStandaloneRoute = pathname === routePaths.login;

  return (
    <>
      <HeadContent />
      {isStandaloneRoute ? (
        <Outlet />
      ) : (
        <AppShell>
          <Outlet />
        </AppShell>
      )}
    </>
  );
}
