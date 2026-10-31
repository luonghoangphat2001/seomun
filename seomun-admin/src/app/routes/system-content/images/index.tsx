import { createFileRoute } from '@tanstack/react-router';

import { ImageListPage, imageListSearchSchema } from '@/features/system-content/images';

export const Route = createFileRoute('/system-content/images/')({
  validateSearch: imageListSearchSchema,
  component: ImageListPage,
});
