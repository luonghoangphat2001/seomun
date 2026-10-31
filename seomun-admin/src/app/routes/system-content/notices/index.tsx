import { createFileRoute } from '@tanstack/react-router';

import { NoticeListPage, noticeListSearchSchema } from '@/features/system-content/notices';

export const Route = createFileRoute('/system-content/notices/')({
  validateSearch: noticeListSearchSchema,
  component: NoticeListPage,
});
