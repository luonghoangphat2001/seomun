import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { PopbillDepositManagementPage, popbillDepositManagementSearchSchema } from '@/features/payments';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/payments/popbill-deposits')({
  validateSearch: popbillDepositManagementSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: PopbillDepositManagementPage,
});
