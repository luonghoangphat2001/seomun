import { createFileRoute } from '@tanstack/react-router';

import { BoardConfigPage } from '@/features/system-content/board';

export const Route = createFileRoute('/system-content/board-configs/')({
  component: BoardConfigPage,
});
