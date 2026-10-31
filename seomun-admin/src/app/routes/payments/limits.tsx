import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { PostPaymentLimitListPage, postPaymentLimitListSearchSchema } from '@/features/payments';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/payments/limits')({
  validateSearch: postPaymentLimitListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: PostPaymentLimitListPage,
});
