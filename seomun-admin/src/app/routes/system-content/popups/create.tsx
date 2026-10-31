import { createFileRoute } from '@tanstack/react-router';

import { PopupCreatePage } from '@/features/system-content/popups';

export const Route = createFileRoute('/system-content/popups/create')({
  component: PopupCreatePage,
});
