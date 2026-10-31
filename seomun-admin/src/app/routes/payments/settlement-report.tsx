import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { SettlementReportListPage, settlementReportListSearchSchema } from '@/features/payments';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/payments/settlement-report')({
  validateSearch: settlementReportListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  component: SettlementReportListPage,
});
