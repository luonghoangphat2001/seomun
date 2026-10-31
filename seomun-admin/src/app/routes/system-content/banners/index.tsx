import { createFileRoute } from '@tanstack/react-router';

import { BannerListPage, bannerListSearchSchema } from '@/features/system-content/banners';

export const Route = createFileRoute('/system-content/banners/')({
  validateSearch: bannerListSearchSchema,
  component: BannerListPage,
});
