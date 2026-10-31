import { createFileRoute } from '@tanstack/react-router';

import { FaqListPage, faqListSearchSchema } from '@/features/system-content/faq';

export const Route = createFileRoute('/system-content/faqs/')({
  validateSearch: faqListSearchSchema,
  component: FaqListPage,
});
