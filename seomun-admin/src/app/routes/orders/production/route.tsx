import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/orders/production')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
