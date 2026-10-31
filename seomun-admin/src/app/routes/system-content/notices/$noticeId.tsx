import { createFileRoute } from '@tanstack/react-router';

import { noticeDetailQueryOptions, NoticeEditPage } from '@/features/system-content/notices';

export const Route = createFileRoute('/system-content/notices/$noticeId')({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(noticeDetailQueryOptions(params.noticeId));
  },
  component: NoticeEditPage,
});
