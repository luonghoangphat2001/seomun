import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { CashReceiptListPage, cashReceiptListSearchSchema } from '@/features/orders';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/orders/cash-receipts')({
  validateSearch: cashReceiptListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('orders.cash_receipts'),
  },
  head: createTitleHead('nav.orders.cash_receipts', 'Cash Receipt'),
  component: CashReceiptListPage,
});
