import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { OutsourcingListPage, outsourcingListSearchSchema } from '@/features/outsourcing';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/outsourcing/')({
  validateSearch: outsourcingListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('nav.outsourcing.list', 'Outsourcing Accounts'),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OutsourcingListPage
      createPath={routePaths.outsourcing.create}
      getDetailTo={(outsourcingId) => routePaths.outsourcing.detail.replace('$outsourcingId', outsourcingId)}
      getEditTo={(outsourcingId) => routePaths.outsourcing.edit.replace('$outsourcingId', outsourcingId)}
    />
  );
}
