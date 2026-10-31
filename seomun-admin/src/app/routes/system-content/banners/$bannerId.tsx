import { createFileRoute } from '@tanstack/react-router';

import { bannerDetailQueryOptions, BannerEditPage } from '@/features/system-content/banners';

export const Route = createFileRoute('/system-content/banners/$bannerId')({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(bannerDetailQueryOptions(params.bannerId));
  },
  component: BannerEditPage,
});
