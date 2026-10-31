import { createFileRoute } from '@tanstack/react-router';

import { ImageCreatePage } from '@/features/system-content/images';

export const Route = createFileRoute('/system-content/images/create')({
  component: ImageCreatePage,
});
