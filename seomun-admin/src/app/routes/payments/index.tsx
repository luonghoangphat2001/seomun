import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { PaymentListPage, paymentListSearchSchema } from '@/features/payments';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/payments/')({
  validateSearch: paymentListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: PaymentListPage,
});
