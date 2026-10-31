import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { FormMode, OutsourcingFormPage } from '@/features/outsourcing';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/outsourcing/create')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('outsourcing.create'),
  },
  head: createTitleHead('nav.outsourcing.create', 'Register Outsourcing Company'),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  const goToList = () => void navigate({ to: routePaths.outsourcing.list });

  return <OutsourcingFormPage mode={FormMode.CREATE} listPath={routePaths.outsourcing.list} onCancel={goToList} onSubmitSuccess={goToList} />;
}
