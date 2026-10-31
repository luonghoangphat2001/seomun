import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { FormMode, OutsourcingFormPage, outsourcingDetailQueryOptions } from '@/features/outsourcing';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/outsourcing/$outsourcingId_/edit')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('outsourcing.edit'),
  },
  loader: async ({ context, params }) => {
    const outsourcingId = Number(params.outsourcingId);

    if (!Number.isFinite(outsourcingId) || outsourcingId <= 0) {
      return null;
    }

    const response = await context.queryClient.ensureQueryData(outsourcingDetailQueryOptions(outsourcingId));

    return response;
  },
  head: createTitleHead('page.outsourcing.edit.title', 'Edit Outsourcing Company'),
  component: OutsourcingEditRoute,
});

function OutsourcingEditRoute() {
  const { outsourcingId } = Route.useParams();
  const navigate = Route.useNavigate();
  const resolvedOutsourcingId = Number(outsourcingId);
  const normalizedOutsourcingId = Number.isFinite(resolvedOutsourcingId) && resolvedOutsourcingId > 0 ? resolvedOutsourcingId : undefined;

  return (
    <OutsourcingFormPage
      mode={FormMode.EDIT}
      outsourcingId={normalizedOutsourcingId}
      listPath={routePaths.outsourcing.list}
      onCancel={() => void navigate({ to: routePaths.outsourcing.list })}
      onSubmitSuccess={() =>
        void navigate({
          to: routePaths.outsourcing.detail,
          params: { outsourcingId },
        })
      }
    />
  );
}
