import { createFileRoute } from '@tanstack/react-router';

import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { UnauthorizedMessage } from '@/features/auth';

export const Route = createFileRoute('/unauthorized')({
  head: createTitleHead('page.system.unauthorized.title', 'Unauthorized'),
  component: UnauthorizedRoute,
});

function UnauthorizedRoute() {
  return <UnauthorizedMessage routePath={routePaths.unauthorized} />;
}
