import { createFileRoute } from '@tanstack/react-router';

import { GuideEditPage, guideDetailQueryOptions } from '@/features/system-content/guides';

export const Route = createFileRoute('/system-content/guides/$guideId')({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(guideDetailQueryOptions(params.guideId));
  },
  component: GuideEditPage,
});
