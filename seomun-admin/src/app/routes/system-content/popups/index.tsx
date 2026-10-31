import { createFileRoute } from '@tanstack/react-router';

import { PopupListPage, popupListSearchSchema } from '@/features/system-content/popups';

export const Route = createFileRoute('/system-content/popups/')({
  validateSearch: popupListSearchSchema,
  component: PopupListPage,
});
