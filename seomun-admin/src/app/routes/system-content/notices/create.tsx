import { createFileRoute } from '@tanstack/react-router';

import { NoticeCreatePage } from '@/features/system-content/notices';

export const Route = createFileRoute('/system-content/notices/create')({
  component: NoticeCreatePage,
});
