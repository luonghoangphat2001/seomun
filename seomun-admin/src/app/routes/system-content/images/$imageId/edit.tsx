import { createFileRoute } from '@tanstack/react-router';

import { ImageEditPage } from '@/features/system-content/images';

export const Route = createFileRoute('/system-content/images/$imageId/edit')({
  component: ImageEditPage,
});
