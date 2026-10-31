import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { InquiryListPage, inquiryListSearchSchema } from '@/features/inquiries';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/inquiries/')({
  validateSearch: inquiryListSearchSchema,
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  head: createTitleHead('page.inquiries.list.title', 'Inquiry List'),
  component: RouteComponent,
});

function RouteComponent() {
  return <InquiryListPage getDetailTo={(inquiryId) => routePaths.inquiries.detail.replace('$inquiryId', inquiryId)} />;
}
