import { createFileRoute } from '@tanstack/react-router';

import { ImageDetailPage } from '@/features/system-content/images';

export const Route = createFileRoute('/system-content/images/$imageId/')({
  component: ImageDetailPage,
});
