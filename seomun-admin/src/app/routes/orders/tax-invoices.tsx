import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { breadcrumbKey } from '@/app/router/breadcrumbs';
import { createTitleHead } from '@/app/router/create-title-head';
import { TaxInvoiceListPage, taxInvoiceListSearchSchema } from '@/features/orders';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/orders/tax-invoices')({
  validateSearch: taxInvoiceListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: () => breadcrumbKey('orders.tax_invoices'),
  },
  head: createTitleHead('nav.orders.tax_invoices', 'Tax Invoice'),
  component: TaxInvoiceListPage,
});
