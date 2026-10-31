import { createFileRoute } from '@tanstack/react-router';

import { GuideListPage, guideListSearchSchema } from '@/features/system-content/guides';

export const Route = createFileRoute('/system-content/guides/')({
  validateSearch: guideListSearchSchema,
  component: GuideListPage,
});
