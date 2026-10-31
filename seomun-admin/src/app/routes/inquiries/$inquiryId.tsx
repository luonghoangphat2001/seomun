import { createFileRoute } from '@tanstack/react-router';

import { requireRole } from '@/app/guards/require-role';
import { createTitleHead } from '@/app/router/create-title-head';
import { routePaths } from '@/app/router/route-paths';
import { InquiryDetailPage, inquiryDetailQueryOptions } from '@/features/inquiries';
import { ALL_STAFF_ROLES } from '@/lib/auth';

export const Route = createFileRoute('/inquiries/$inquiryId')({
  beforeLoad: requireRole(ALL_STAFF_ROLES),
  staticData: {
    breadcrumb: (matches) => matches.params.inquiryId,
  },
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(inquiryDetailQueryOptions(params.inquiryId));
  },
  head: createTitleHead('page.inquiries.detail.title', 'Inquiry Detail'),
  component: InquiryDetailRoute,
});

function InquiryDetailRoute() {
  const { inquiryId } = Route.useParams();
  const navigate = Route.useNavigate();

  return (
    <InquiryDetailPage
      inquiryId={inquiryId}
      onBackToList={() =>
        void navigate({
          to: routePaths.inquiries.list,
        })
      }
    />
  );
}
