import { createFileRoute } from '@tanstack/react-router';

import { FaqEditPage, faqDetailQueryOptions } from '@/features/system-content/faq';

export const Route = createFileRoute('/system-content/faqs/$faqId')({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(faqDetailQueryOptions(params.faqId));
  },
  component: FaqEditPage,
});
