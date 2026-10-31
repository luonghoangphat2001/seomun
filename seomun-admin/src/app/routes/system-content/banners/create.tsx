import { createFileRoute } from '@tanstack/react-router';

import { BannerCreatePage } from '@/features/system-content/banners';

export const Route = createFileRoute('/system-content/banners/create')({
  component: BannerCreatePage,
});
