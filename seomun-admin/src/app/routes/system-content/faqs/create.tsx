import { createFileRoute } from '@tanstack/react-router';

import { FaqCreatePage } from '@/features/system-content/faq';

export const Route = createFileRoute('/system-content/faqs/create')({
  component: FaqCreatePage,
});
