import { createFileRoute } from '@tanstack/react-router';

import { popupDetailQueryOptions, PopupEditPage } from '@/features/system-content/popups';

export const Route = createFileRoute('/system-content/popups/$popupId')({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(popupDetailQueryOptions(params.popupId));
  },
  component: PopupEditPage,
});
