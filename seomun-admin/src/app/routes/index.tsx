import { routePaths } from '@/app/router/route-paths';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: routePaths.home });
  },
});
