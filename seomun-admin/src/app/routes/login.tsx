import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';

import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { LoginPage } from '@/features/auth';
import { queryClient } from '@/lib/query/query-client';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: routePaths.home });
    }
  },
  head: createTitleHead('page.auth.login.title', 'Login'),
  component: LoginRoute,
});

function LoginRoute() {
  // Cache is cleared here (not in logout) so it happens after the app shell unmounts —
  // otherwise mounted queries refetch without a token, 401, and trigger a hard redirect.
  useEffect(() => {
    queryClient.clear();
  }, []);

  return <LoginPage homePath={routePaths.home} />;
}
