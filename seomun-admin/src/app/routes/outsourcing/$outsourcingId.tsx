import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { OutsourcingDetailPage, outsourcingDetailQueryOptions } from '@/features/outsourcing';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/outsourcing/$outsourcingId')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('outsourcing.detail'),
  },
  loader: async ({ context, params }) => {
    const outsourcingId = Number(params.outsourcingId);

    if (!Number.isFinite(outsourcingId) || outsourcingId <= 0) {
      return null;
    }

    const response = await context.queryClient.ensureQueryData(outsourcingDetailQueryOptions(outsourcingId));

    return response;
  },
  head: createTitleHead('page.outsourcing.detail.title', 'Outsourcing Detail'),
  component: OutsourcingDetailRoute,
});

function OutsourcingDetailRoute() {
  const { outsourcingId } = Route.useParams();
  const resolvedOutsourcingId = Number(outsourcingId);
  const normalizedOutsourcingId = Number.isFinite(resolvedOutsourcingId) && resolvedOutsourcingId > 0 ? resolvedOutsourcingId : undefined;

  return (
    <OutsourcingDetailPage
      outsourcingId={normalizedOutsourcingId}
      listPath={routePaths.outsourcing.list}
      editPath={routePaths.outsourcing.edit.replace('$outsourcingId', outsourcingId)}
    />
  );
}
